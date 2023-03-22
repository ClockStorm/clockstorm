const fs = require('fs')

const postBuild = async () => {
  fs.writeFileSync('dist/version.txt', process.env.FE_COMMIT_HASH || 'dev')
}

postBuild()
