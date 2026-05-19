export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Failed to read image file'))
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read image file'))
    }
    reader.readAsDataURL(file)
  })
}

export async function fileFromDataUrl(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type || 'image/png' })
}

export function isLocalImageSrc(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:')
}

export function isCloudImageSrc(src: string): boolean {
  return src.startsWith('https://') || src.startsWith('http://')
}
