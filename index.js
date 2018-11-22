const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const versionPath = path.join(process.cwd(), 'version.txt');

const questions = [
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
];


async function updateVersion(versoin) {
  let answers = await inquirer.prompt(questions)
  if (!answers.confirm) {
    console.log('donothing');
    return;
  }
  const newVersion = version.split('.').map((varsionPart, index) => {
    const val = parseInt(varsionPart, 10);
    if (index === answers.tag - 1 || index === 3) {
      return val + 1;
    }
    return val;
  });
  answers = inquirer.prompt({
    type: 'confirm',
    name: 'update',
    message: `确定更新版本号为[${chalk.red(newVersion)}],并提交代码?`,
  });
  if (!answers.update) {
    return;
  }
  return newVersion;
}


function checkPath(file) {
  return fs.existsSync(path.join(workDir, file));
}

async function initVersion() {
  const answer = await inquirer.prompt({
    type: 'confirm',
    name: 'init',
    message: 'version.txt不存在,要新建一个吗?',
  });
  if (answer.init) {
    fs.writeFileSync(versionPath, '0.0.0.0');
    return true;
  }
  return false;
}

async function pushTag(version) {
  fs.writeFileSync(versionPath, version);
  shell.exec(`git commit -a -m [${version}] && git tag -a v.${version} -m '${version}'`);
  shell.exec(`git push --follow-tags`)
}

async function run() {
  if (!checkPath('.git')) {
    console.log('当前目录不是git项目根目录');
    return;
  }
  if (!checkPath('version.txt')) {
    const init = await initVersion();
    if (!init) {
      return;
    }
  }
  const version = fs.readFileSync(versionPath, 'utf8');
  const newVersion = await updateVersion(version);
  // 终止
  if (!newVersion) {
    return;
  }
  pushTag(newVersion);
}


