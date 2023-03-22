import archiver from 'archiver'
import * as fs from 'fs'
import * as process from 'process'

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.error('Please specify the ZIP file name as an argument.')
  process.exit(1)
}

const zipFileName = args[0]

const sourceDir = 'dist'

const output = fs.createWriteStream(zipFileName)
const archive = archiver('zip')

archive.on('error', function (err: any) {
  throw err
})

archive.pipe(output)
archive.directory(sourceDir, false)
archive.finalize()
