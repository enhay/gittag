const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('./libs/git.js');

function updateVersion(version, ref) {
  let fn;
  switch (ref) {
    case 3:
      fn = ($0, p1, p2, p3) => {
        const newTag = parseInt(p3, 10) + 1;
        return `v${p1}.${p2}.${newTag}`;
      };
      break;
    case 2:
      fn = ($0, p1, p2, p3) => {
        const newTag = parseInt(p2, 10) + 1;
        return `v${p1}.${newTag}.0`;
      };
      break;
    case 1:
      fn = ($0, p1, p2, p3) => {
        const newTag = parseInt(p1, 10) + 1;
        return `v${newTag}.0.0`;
      };
      break;
    default:
      fn = ($0) => {
        return $0;
      }
      break;
  }
  return version.replace(/v(\d+).(\d+).(\d+)/ig, fn);
}

async function getNewVersion(version) {
  let answer = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `当前版本号为[${chalk.red(version)}],是否继续?`
  });
  if (!answer.confirm) {
    return;
  }

  const choices = [];
  var pushChoice = function (suffix, version) {
    this.push({
      name: `${suffix}(${chalk.bold(version)})`,
      value: version
    });
  }.bind(choices);

  pushChoice('1) UPDATE PATCH ', updateVersion(version, 3))
  pushChoice('2) UPDATE MINOR ', updateVersion(version, 2))
  pushChoice('3) UPDATE MAJOR ', updateVersion(version, 1))
  //pushChoice('4) 我要自己定', inputTag())
  answer = await inquirer.prompt({
    type: 'list',
    name: 'tag',
    suffix: '请选择新tag',
    massage: ``,
    choices
  })

  const newVersion = answer.tag;
  if (!answer.tag) {
    return;
  }

  answer = await inquirer.prompt({
    type: 'confirm',
    name: 'update',
    message: `确定更新版本号为[${chalk.red(newVersion)}],并提交代码?`,
  });
  if (!answer.update) {
    return;
  }
  return newVersion;
}

async function getVersion() {
  const wordDir = process.cwd();
  if (!fs.existsSync(path.join(wordDir, '.git'))) {
    console.log('当前目录不是git项目根目录');
    return;
  }
  const versionPath = path.join(wordDir, 'version.txt');
  if (fs.existsSync(versionPath)) {
    return fs.readFileSync(versionPath, 'utf8');
  }
  const version = 'v0.1.0';
  const answer = await inquirer.prompt({
    type: 'confirm',
    name: 'init',
    message: 'version.txt不存在,要新建一个吗?',
  });
  if (answer.init) {
    fs.writeFileSync(versionPath, version);
    return version;
  }
  return null;
}

async function run() {
  const version = await getVersion();
  if (!version) {
    return;
  }
  const newVersion = await getNewVersion(version);
  // 终止
  if (!newVersion) {
    return;
  }
  const wordDir = process.cwd();
  fs.writeFileSync(path.join(wordDir, 'version.txt'), newVersion);
  shell.pushTag(newVersion);
}

module.exports = run;