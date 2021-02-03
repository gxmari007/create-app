#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const { prompt } = require('enquirer');

async function init() {
  const res = await prompt({
    type: 'input',
    name: 'name',
    message: 'Project name',
    initial: 'new-project',
  });

  console.log(res);
}

init().catch((err) => {
  console.error(err);
});
