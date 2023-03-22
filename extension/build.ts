import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
const commitHash = args[0] || 'dev'

const manifest = fs.readFileSync('package/manifest.json', 'utf8')
const manifestObj = JSON.parse(manifest)
const version = manifestObj.version as string
const fullVersion = `${version}-${commitHash}`

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

  await esbuild.build({
    entryPoints: [
      'src/content-script.ts',
      'src/service-worker.ts',
      'src/extension-options.ts',
      'src/offscreen.ts',
      'src/popup.ts',
    ],
    bundle: true,
    minify: true,
    keepNames: true,
    sourcemap: true,
    sourcesContent: false,
    target: 'chrome58',
    outdir: 'dist',
    outbase: 'src',
  })

  const packageFiles = getAllFilesInDirectory('package')

  for (const file of packageFiles) {
    const destPath = file.replace('package', 'dist')
    const destDir = path.dirname(destPath)
    fs.mkdirSync(destDir, { recursive: true })
    fs.copyFileSync(file, destPath)
  }

  fs.writeFileSync('dist/version.js', `window.ClockStormVersion = ${JSON.stringify(fullVersion)};`)
  fs.writeFileSync('dist/version.txt', commitHash)
  fs.writeFileSync('dist/tag.txt', fullVersion)
}

build()
