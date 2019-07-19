'use strict'
const exec = require('child_process').exec
const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora')
const os = require('os')
const uid = require('uid')
const rm = require('rimraf').sync
const config = require('../templates.json')
const path = require('path')

module.exports = () => {
  const tplNameList = Object.keys(config.tpl)
  var questions = [
    {
      type: 'list',
      name: 'templateName',
      message: '你想使用哪个模板?',
      choices: tplNameList
    }
  ]

  inquirer.prompt(questions).then(answer => {
    const { templateName } = answer
    const { branch, gitUrl} = config.tpl[templateName]
    downloadAndGenerate(branch, gitUrl)
  })

  const downloadAndGenerate = (branch, gitUrl) => {
//    var tmp = os.tmpdir() + '/peon-template-' + uid();
    var tmp = './peon-template-' + uid();

    var spinner = ora('downloading template');
    spinner.start();

    if (branch && gitUrl) {
      let cmdStr = `git clone -b ${branch} ${gitUrl} ${tmp}`
      console.log(chalk.white('\n Start generating...'))
      exec(cmdStr, (error, stdout, stderr) => {
        // 进程结束时，删除临时文件目录
        /* process.on('exit', function (err) {
          exec(`rm -rf ${tmp}`)
        }); */
        if (error) {
          console.log(error)
          process.exit()
        }


        console.log(chalk.green('\n √ Generation completed!'))
        exec(`rm -rf ${tmp}/.git`, (error) => {
          if(error){
            console.log(error)
            process.exit()
          }
          generate(srcPath, './')
        })

        process.exit()
      })
    }
  }

  const generate = (srcPath, tarPath, filter=[]) => {
    fs.readdir(srcPath, function (error, files){
      if (error === null){
        files.forEach(function (fileName){
          let filedir = path.join(srcPath, fileName)
          let filterFlag = filter.some(item => item === filename)
          if(!filterFlag){
            fs.stat(filedir, function (error, stats){
              if(error === null) {
                let isFile = stats.isFile()
                if (isFile) {
                  const destPath = path.join(tarPath, filename);
                  fs.copyFile(filedir, destPath, (error) => {})
                }
                // 如果是文件夹
                else {
                  let tarFiledir = path.join(tarPath, filename);
                  fs.mkdir(tarFiledir, (error) => {});
                  copyFile(filedir, tarFiledir, filter)                 // 递归
                }
              } else{
                console.log(error)
              }
              
            })
          }
        })
      } else{
        console.log(error)
      }
    })
  }

}