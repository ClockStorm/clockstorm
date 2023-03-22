const fs = require('fs')

const postBuild = async () => {
  fs.writeFileSync('dist/version.txt', process.env.CLOCKSTORM_COMMIT_HASH || 'dev')
}

postBuild()
