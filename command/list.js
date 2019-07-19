const inquirer = require('inquirer')
const fs = require('fs')
const config = require('../templates.json')

module.exports = () => {
  console.log(JSON.stringify(config.tpl, null, 2))
  process.exit()
}