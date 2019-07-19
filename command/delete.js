const inquirer = require('inquirer')
const fs = require('fs')
const chalk = require('chalk')
const config = require('../templates.json')

module.exports = () => {
  var questions = [
    {
      type: 'input',
      name: 'templateName',
      message: '你要删除的模板名称?',
      validate: function (value) {
        var pass = value.match(
          /[-_a-zA-Z0-9]/i
        );
        if (pass) {
          return true;
        }

        return '轻输入正确的模板名称';
      }
    }
  ]
  inquirer.prompt(questions).then(answer => {
    const { templateName } = answer
    if (config.tpl[templateName]){
      delete config.tpl[templateName]
    } else{
      console.log(chalk.red('template does not exist!'))
      process.exit()
    }

    // 把模板信息写入templates.json
    fs.writeFile(__dirname + '/../templates.json', JSON.stringify(config, null, 2), 'utf-8', (err) => {
      if (err) console.log(err)
      console.log(chalk.green('Template deleted!\n'))
      console.log(chalk.grey('The last template list is: \n'))
      console.log(JSON.stringify(config, null, 2))
      console.log('\n')
      process.exit()
    })
  })
}