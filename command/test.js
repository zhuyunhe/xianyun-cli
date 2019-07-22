'use strict';
var inquirer = require('inquirer');

inquirer.prompt({
  type: 'confirm',
  name: 'copyAll',
  message: (name)=>{
    return  's'
  }
}).then(answers => {
  console.log(JSON.stringify(answers, null, '  '));
})