#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const { prompt } = require('enquirer');
const pkg = require('./package.json');

const cwd = process.cwd();
const templates = ['lib-ts'];

program.version(pkg.version, '-v, --version', 'output the version number');
program.helpOption('-h, --help', 'output usage information');

program
  .name('create-app')
  .arguments('[project-name]')
  .option('-t, --template', 'select a template')
  .action(async (projectName, options) => {
    let projectDir = projectName;

    // determine project folder
    if (!projectDir) {
      const { name } = await prompt({
        type: 'input',
        name: 'name',
        message: 'Project name:',
        initial: 'app',
      });

      projectDir = name;
    }

    const root = path.join(cwd, projectDir);
    console.log(root);

    // determine template
    let template = options.template;

    if (!template) {
      const { t } = await prompt({
        type: 'select',
        name: 't',
        message: 'Select a template:',
        choices: templates,
      });

      template = t;
    }

    const templateDir = path.join(cwd, 'templates', `template-${template}`);
    const files = fs.readdirSync(templateDir);

    console.log(files);
  });

program.parse(process.argv);
