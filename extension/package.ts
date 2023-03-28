const archiver = require('archiver')
const fs = require('fs')

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.error('Please specify the ZIP file name as an argument.')
  process.exit(1)
}

const zipFileName = args[0]

if (!/^clockstorm-[0-9]+\.[0-9]+\.[0-9]+-[A-Za-z0-9]+\.zip$/.test(zipFileName)) {
  console.error('Please specify a ZIP path like this: 1.0.0-abc123.zip')
  process.exit(1)
}

const sourceDir = 'dist'

const output = fs.createWriteStream(zipFileName)
const archive = archiver('zip')

archive.on('error', function (err: any) {
  throw err
})

archive.pipe(output)
archive.directory(sourceDir, false)
archive.finalize()
