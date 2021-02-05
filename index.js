#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const { prompt } = require('enquirer');
const pkg = require('./package.json');

const cwd = process.cwd();
const templates = ['lib-ts'];
const renameFiles = {
  _gitignore: '.gitignore',
};

function copy(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const file of fs.readdirSync(src)) {
    const srcFile = path.resolve(src, file);
    const targetFile = path.resolve(dest, file);

    copy(srcFile, targetFile);
  }
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file);

    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      fs.rmdirSync(abs);
    } else {
      fs.unlinkSync(abs);
    }
  }
}

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

    const templateDir = path.join(__dirname, 'templates', `template-${template}`);
    const files = fs.readdirSync(templateDir);

    const write = (file, content) => {
      const targetPath = renameFiles[file]
        ? path.join(root, renameFiles[file])
        : path.join(root, file);

      if (content) {
        fs.writeFileSync(targetPath, content);
      } else {
        copy(path.join(templateDir, file), targetPath);
      }
    };

    if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true });
    } else {
      const existing = fs.readdirSync(root);

      if (existing.length) {
        const { yes } = await prompt({
          type: 'confirm',
          name: 'yes',
          initial: 'Y',
          message: `
            Target directory ${targetDir} is not empty.
            Remove existing files and continue?
          `
        });

        if (yes) {
          emptyDir(root);
        } else {
          // exit program
          return;
        }
      }
    }

    for (const file of files) {
      if (file === 'package.json') {
        const package = require(path.join(templateDir, 'package.json'));

        package.name = path.basename(root);
        write(file, JSON.stringify(package, null, 2));
      } else {
        write(file);
      }
    }

    console.log('\nDone.');
  });

program.parse(process.argv);
