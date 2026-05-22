function fileNameFromSource(source: string) {
  try {
    const pathname = new URL(source, window.location.href).pathname
    const base = pathname.split('/').pop()
    if (base?.toLowerCase().endsWith('.pdf')) return base
  } catch {
    // blob: or relative paths
    const segment = source.split('/').pop()?.split('?')[0]
    if (segment?.toLowerCase().endsWith('.pdf')) return segment
  }
  return 'document.pdf'
}

export async function downloadPdfSource(source: string) {
  const response = await fetch(source)
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileNameFromSource(source)
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

type PdfDocumentWithData = {
  getData: () => Promise<Uint8Array>
}

export async function printPdfDocument(
  pdfDocumentProxy: PdfDocumentWithData | null | undefined,
  fallbackSource?: string,
) {
  if (pdfDocumentProxy) {
    const data = await pdfDocumentProxy.getData()
    const blob = new Blob([data], { type: 'application/pdf' })
    const objectUrl = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.className = 'fixed inset-0 h-0 w-0 border-0 opacity-0 pointer-events-none'
    iframe.src = objectUrl

    const cleanup = () => {
      iframe.remove()
      URL.revokeObjectURL(objectUrl)
    }

    iframe.onload = () => {
      const printWindow = iframe.contentWindow
      if (!printWindow) {
        cleanup()
        return
      }
      printWindow.focus()
      printWindow.print()
      printWindow.addEventListener('afterprint', cleanup, { once: true })
    }

    document.body.append(iframe)
    return
  }

  if (fallbackSource) {
    const printWindow = window.open(fallbackSource, '_blank', 'noopener,noreferrer')
    printWindow?.focus()
    printWindow?.print()
  }
}
