export const readAsDataUrlAsync = async (input: HTMLInputElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const files = input.files

    if (files === null || files.length === 0) {
      reject(new Error('No file selected'))
      return
    }

    const file = files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const fileDataUrl = reader.result
      if (fileDataUrl === null) {
        reject(new Error('Invalid file selection'))
        return
      }

      if (fileDataUrl instanceof ArrayBuffer) {
        reject(new Error('Invalid file data'))
        return
      }
      resolve(fileDataUrl)
    }
  })
}
