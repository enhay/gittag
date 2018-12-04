#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('./libs/git.js');

async function getNewVersion(version) {
  let answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `当前版本号为[${chalk.red(version)}],继续?`
    },
    {
      type: 'list',
      name: 'tag',
      massage: `plese chose `,
      choices: [
        { name: "working(w)", value: 4 },
        { name: "fixbug(b)", value: 3 },
        { name: "add feature(f)", value: 2 },
        { name: "struct revolution(s)", value: 1 }
      ],
      when: (answers) => {
        return answers.confirm;
      }
    }
  ]);
  if (!answers.confirm) {
    console.error('donothing');
    return;
  }
  const newVersion = version.split('.').map((varsionPart, index) => {
    const val = parseInt(varsionPart, 10);
    if (index === answers.tag - 1 || index === 3) {
      return val + 1;
    }
    return val;
  }).join('.');
  answers = await inquirer.prompt({
    type: 'confirm',
    name: 'update',
    message: `确定更新版本号为[${chalk.red(newVersion)}],并提交代码?`,
  });
  if (!answers.update) {
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

