import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
const commitHash = args[0] || 'dev'
const rootHref = args[1] || '.'
const repoHref = args[2] || '../..'
const repoBlobsHref = args[3] || '../..'

interface GenerateSwimlanesImageRequestBody {
  text: string
}

const getAllFilesInDirectory = (directory: string): string[] => {
  const files: string[] = []
  fs.readdirSync(directory).forEach((file: string) => {
    const absolutePath = path.join(directory, file)
    if (fs.statSync(absolutePath).isDirectory()) {
      files.push(...getAllFilesInDirectory(absolutePath))
    } else {
      files.push(absolutePath)
    }
  })
  return files
}

const build = async () => {
  fs.rmSync('dist', { recursive: true, force: true })
  fs.mkdirSync('dist', { recursive: true })

  const pagesDirectory = 'src/pages'
  const pagesFiles = getAllFilesInDirectory(pagesDirectory)

  for (const pageFile of pagesFiles) {
    const pageContents = fs.readFileSync(pageFile, 'utf-8')
    fs.writeFileSync(
      'dist/' + path.basename(pageFile),
      pageContents
        .replace(/\{RootHref\}/g, rootHref)
        .replace(/\{RepoHref\}/g, repoHref)
        .replace(/\{RepoBlobsHref\}/g, repoBlobsHref),
    )
  }

  const swimlanesFiles = getAllFilesInDirectory('src/swimlanes')

  for (const swimlanesFile of swimlanesFiles) {
    const swimlanesFileText = fs.readFileSync(swimlanesFile, 'utf-8')
    const body: GenerateSwimlanesImageRequestBody = {
      text: swimlanesFileText,
    }

    const response = await fetch('https://api.swimlanes.io/v1/image', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (response.status >= 400) {
      throw new Error(
        `Swimlanes API responded with an error status: ${response.status} Error text: ${response.statusText}`,
      )
    }

    const imageData = await response.arrayBuffer()
    fs.writeFileSync('dist/' + path.basename(swimlanesFile) + '.png', Buffer.from(imageData))
  }

  fs.writeFileSync('dist/Version.md', `This is version ${commitHash} of the documentation.`)
}

build()
