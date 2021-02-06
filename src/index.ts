#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { program } from 'commander';
import { prompt } from 'enquirer';

import pkg from '../package.json';

const cwd = process.cwd();
const templates = ['lib-ts', 'vite-plugin'];

const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};

const copyDir = (src: string, dest: string) => {
  fs.mkdirSync(dest, { recursive: true });

  for (const file of fs.readdirSync(src)) {
    const srcFile = path.resolve(src, file);
    const destFile = path.resolve(dest, file);
    copy(srcFile, destFile);
  }
};

const emptyDir = (dir: string) => {
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file);

    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      fs.rmdirSync(abs);
    } else {
      fs.unlinkSync(abs);
    }
  }
};

program.version(pkg.version, '-v, --version', 'output the version number');
program.helpOption('-h, --help', 'output usage information');

program
  .name('create-app')
  .arguments('[project-name]')
  .option('-t, --template', 'select a template')
  .action(async (projectName, options) => {
    // determine project folder
    let projectDir: string = projectName;

    if (!projectDir) {
      const { name } = await prompt<{ name: string }>({
        type: 'input',
        name: 'name',
        message: 'Project name:',
        initial: 'app',
      });

      projectDir = name;
    }

    const root = path.join(cwd, projectDir);

    // determine template
    let template: string = options.template;

    if (!template) {
      const { t } = await prompt<{ t: string }>({
        type: 'select',
        name: 't',
        message: 'Select a template:',
        choices: templates,
      });

      template = t;
    }

    const templateDir = path.join(
      __dirname,
      'templates',
      `template-${template}`,
    );
    const files = fs.readdirSync(templateDir);
  });

program.parse(process.argv);
