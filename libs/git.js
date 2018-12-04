const shell = require('shelljs');

async function pushTag(version) {
  shell.exec(`git commit -a -m [${version}]`)
  shell.exec('CUR_BRANCH=`git rev-parse --abbrev-ref HEAD` git pull origin $CUR_BRANCH ; git push origin  $CUR_BRANCH ;');
  shell.exec(`git tag ${version}; git push --tags`)
}

module.exports = {
  pushTag
}