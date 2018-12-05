#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('./libs/git.js');

function updateVersion(version, ref) {
  const versionPaths = version.split('.').reverse();
  return versionPaths.map((item, index) => {
    const val = parseInt(item, 10);
    if (index === 0) {
      return val + 1;
    }
    if (index === ref - 1) {
      return val + 1;
    }
    return val;
  }).reverse().join('.');
}



async function getNewVersion(version) {
  let answer = await inquirer.prompt(
    {
      type: 'confirm',
      name: 'confirm',
      message: `当前版本号为[${chalk.red(version)}],是否继续?`
    }
  );
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

  pushChoice('1) working', updateVersion(version, 1))
  pushChoice('2) fixbug', updateVersion(version, 2))
  pushChoice('3) add feature', updateVersion(version, 3))
  pushChoice('4) struct revolution', updateVersion(version, 4))

  answer = await inquirer.prompt(
    {
      type: 'list',
      name: 'tag',
      suffix: '请选择新tag',
      massage: ``,
      choices
    }
  )
  console.log(answer)
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
  const version = '0.0.0.1';
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

run();

