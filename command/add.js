const inquirer = require('inquirer')
const fs = require('fs')
const chalk = require('chalk')
const config = require('../templates.json')


module.exports = () => {
  var questions = [
    {
      type: 'input',
      name: 'templateName',
      message: "你要使用的模板名称?",
      validate: function (value) {
        var pass = value.match(
          /[-_a-zA-Z0-9]/i
        );
        if (pass) {
          return true;
        }

        return '轻输入正确的模板名称';
      }
    },
    {
      type: 'input',
      name: 'gitUrl',
      message: '模板所在git地址?',
      validate: function (value) {
        var pass = value.match(
          /[-_a-zA-Z0-9]/i
        );
        if (pass) {
          return true;
        }

        return '轻输入正确的git地址';
      }
    },
    {
      type: 'input',
      name: 'branch',
      message: '要clone哪个分支?',
      validate: function (value) {
        var pass = value.match(
          /[-_a-zA-Z0-9]/i
        );
        if (pass) {
          return true;
        }

        return '轻输入正确的分支名';
      }
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const { templateName, gitUrl, branch } = answers
    if(!config.tpl[templateName]){
      config.tpl[templateName] = {}
      config.tpl[templateName]['url'] = gitUrl.replace(/[\u0000-\u0019]/g, '') // 过滤unicode字符
      config.tpl[templateName]['branch'] = branch
    } else{
      console.log(chalk.red('Template has already existed!'))
      process.exit()
    }

    // 把模板信息写入templates.json
    fs.writeFile(__dirname + '/../templates.json', JSON.stringify(config, null, 2), 'utf-8', (err) => {
      if (err) console.log(err)
      console.log(chalk.green('New template added!\n'))
      console.log(chalk.grey('The last template list is: \n'))
      console.log(JSON.stringify(config, null, 2))
      console.log('\n')
      process.exit()
    })
  })
} 