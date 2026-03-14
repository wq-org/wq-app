type PdfPreviewProps = {
  pdfUrl: string
  fileName?: string
}

export function PdfPreview({ pdfUrl, fileName = 'document.pdf' }: PdfPreviewProps) {
  return (
    <div className="w-full h-full">
      <iframe
        src={pdfUrl}
        className="w-full h-full border-0"
        title={fileName}
      />
    </div>
  )
}
