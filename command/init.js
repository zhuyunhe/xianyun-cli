'use strict'
const exec = require('child_process').exec
const cp = require('child_process')
const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora')
const os = require('os')
const uid = require('uid')
const rm = require('rimraf').sync
const path = require('path')
const fs = require('fs')
const config = require('../templates.json')


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
          generate(tmp, './')
          process.exit()
        })
      })
    }
  }

  const generate = (srcPath, tarPath, filter=[]) => {
    console.log(chalk.white('\n Start generating...'))
    console.log(`srcPath: ${srcPath}`)
    console.log(`tarPath: ${tarPath}`)
    try {
      fs.readdir(srcPath, function (error, files) {
        if (error === null) {
          console.log(files)
          files.forEach(function (fileName) {
            let filedir = path.join(srcPath, fileName)
            let filterFlag = filter.some(item => item === filename)
            if (!filterFlag) {
              fs.stat(filedir, function (error, stats) {
                if (error === null) {
                  let isFile = stats.isFile()
                  if (isFile) {
                    const destPath = path.join(tarPath, filename);
                    fs.copyFile(filedir, destPath, (error) => { })
                  }
                  // 如果是文件夹
                  else {
                    let tarFiledir = path.join(tarPath, filename);
                    fs.mkdir(tarFiledir, (error) => { });
                    copyFile(filedir, tarFiledir, filter)                 // 递归
                  }
                } else {
                  console.log(error)
                }

              })
            }
          })
        } else {
          console.log(error)
        }
      })
    } catch (error) {
      console.log(error)
    }
    
  }

}

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
  const { branch, gitUrl } = config.tpl[templateName]
  downloadAndGenerate(branch, gitUrl)
})

const downloadAndGenerate =  (branch, gitUrl) => {
  //    var tmp = os.tmpdir() + '/peon-template-' + uid();
  var tmp = './peon-template-' + uid();

  var spinner = ora('下载模板仓库');
  spinner.start();

  if (branch && gitUrl) {
    let cmdStr = `git clone -b ${branch} ${gitUrl} ${tmp}`
    exec(cmdStr, (error, stdout, stderr) => {
      // 进程结束时，删除临时文件目录
      /* process.on('exit', function (err) {
        exec(`rm -rf ${tmp}`)
      }); */
      if (error) {
        console.log(error)
        process.exit()
      }

      spinner.succeed('√ git clone completed!')
      exec(`rm -rf ${tmp}/.git`, (error) => {
        if (error) {
          console.log(error)
          process.exit()
        }
        console.log(chalk.white('\n Start generating...'))
        // 得到文件目录树
        let fileTree = generate(tmp, []);
        
        console.log(fileTree)
        //选择复制某个文件夹下所有文件，或单独复制某个文件
        const selectFile = (fileTree) => {
          inquirer.prompt({
            type: 'list',
            name: 'fileName',
            message: '你想复制哪些文件?',
            choices: fileTree.map(item => item.name)
          }).then(answers => {
            console.log(JSON.stringify(answers, null, '  '));
            let fileNode = fileTree.filter(item => item.name === answers.fileName)
            console.log(fileNode)
            if(fileNode &&fileNode.length > 0){
              fileNode = fileNode[0]
              if (fileNode.all === true) {
                cloneFileDir(tmp, './');
                process.exit()
              }
              // 选择了某个文件夹
              else if (!fileNode.isFile) {
                let filedir = path.join(tmp, fileNode.name)
                fileTree = generate(filedir, [])
              } else {
                let file = path.resolve(path.join(tmp, fileNode.name))
                fs.copyFile(file, path.resolve(`./${fileNode.name}`), (error) => {
                  if(error){
                    console.log('copy 文件失败')
                    console.log(error)
                  }
                  process.exit()
                })
              }
            } else {
              process.exit()
            }
          }).catch(error => {
            console.log(error)
          })
        }
        selectFile(fileTree)
        
        // process.exit()
      })
    })
  }
}

// clone文件夹
const cloneFileDir = ( srcPath, tarPath, filter = [] ) => {
  try {
    let files = fs.readdirSync(srcPath)
    files.forEach(function (fileName) {
      let filedir = path.join(srcPath, fileName)
      let filterFlag = filter.some(item => item === fileName)
      if (!filterFlag) {
        let stats = fs.statSync(filedir)
        let isFile = stats.isFile()
        if (isFile) {
          const destPath = path.join(tarPath, fileName);
          fs.copyFile(filedir, destPath, (error) => {})
        }
        // 如果是文件夹
        else {
          let tarFiledir = path.join(tarPath, fileName);
          fs.mkdir(tarFiledir, (error) => {});
          cloneFileDir(filedir, tarFiledir, filter)                 // 递归
        }
      }
    })

    process.exit()

  } catch (error) {
    console.log(error)
  }
}

// 生成目标仓库一级目录
const generate = ( srcPath, filter = [] ) => {
  try {
    let files = fs.readdirSync(srcPath)
    let fileTree = []
    files.forEach(function (fileName) {
      let filedir = path.join(srcPath, fileName)
      let filterFlag = filter.some(item => item === fileName)
      if (!filterFlag) {
        let stats = fs.statSync(filedir)
        let isFile = stats.isFile()
        if (isFile) {
          fileTree.push({
            name: fileName,
            isFile: true
          })
          // fs.copyFile(filedir, destPath, (error) => {})
        }
        // 如果是文件夹
        else {
          fileTree.push({
            name: fileName,
            isFile: false
          })
          // fs.mkdir(tarFiledir, (error) => {});
          generate(filedir, filter)                 // 递归
        }
      }
    })
    fileTree.unshift({
      name: 'clone所有文件到当前目录下',
      all: true
    })
    return fileTree
  } catch (error) {
    console.log(error)
  }
}