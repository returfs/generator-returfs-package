'use strict';

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import {
  getGitConfig,
  guessGitHubUsername,
  guessGitHubVendorInfo,
} from './git-helper.js';
import { slugify, toNamespace, titleCase } from './string-helper.js';

const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const require = createRequire(import.meta.url);

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this._template = 'skeleton-returfs-package';
    this._author = {
      name: getGitConfig('user.name'),
      email: getGitConfig('user.email'),
      username: guessGitHubUsername(),
    };
  }

  async _getGitHubVendorInfo() {
    try {
      const [name, username] = await guessGitHubVendorInfo(
        this._author.name,
        this._author.username,
      );

      return {
        name,
        username,
        slug: slugify(name),
        namespace: toNamespace(name),
      };
    } catch (error) {
      return {
        name: this._author.name,
        username: this._author.username,
        slug: slugify(this._author.name),
        namespace: toNamespace(this._author.name),
      };
    }
  }

  async prompting() {
    // todo: returfs' hex color
    // todo: paid extensions
    // todo: internal and external extensions
    this.log(
      yosay(
        `Welcome to the ${chalk.blue("Generator for returfs' packages ")}!`,
      ),
    );

    const gitHubVendorInfo = await this._getGitHubVendorInfo();

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name:',
        default: this._author.name,
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author email:',
        default: this._author.email,
      },
      {
        type: 'input',
        name: 'authorUsername',
        message: 'Author GitHub username:',
        default: this._author.username,
      },
      {
        type: 'input',
        name: 'vendorName',
        message: 'Vendor name:',
        default: gitHubVendorInfo.name,
      },
      {
        type: 'input',
        name: 'vendorUsername',
        message: 'Vendor username:',
        default: gitHubVendorInfo.username,
      },
      {
        type: 'input',
        name: 'vendorNamespace',
        message: 'Vendor namespace:',
        default: gitHubVendorInfo.namespace,
      },
      {
        type: 'input',
        name: 'packageName',
        message: 'Package name:',
        default: this.appname,
      },
      {
        type: 'input',
        name: 'className',
        message: 'Class name:',
        default: titleCase(this.appname),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Package description:',
        default: 'e.g: text editor for returfs',
      },
      {
        type: 'checkbox',
        name: 'stack',
        // todo
        message: 'Stack:',
        choices: [
          {
            name: 'Laravel',
            value: 'laravel',
            checked: false,
          },
          {
            name: 'React',
            value: 'react',
            checked: false,
          },
          {
            name: 'Others',
            value: 'others',
            checked: false,
          },
        ],
      },
      {
        type: 'confirm',
        name: 'useDependabot',
        message: 'Enable Dependabot?',
        default: true,
      },
    ]);

    const shouldContinue = await this._showSummary();
    return shouldContinue;
  }

  async _showSummary() {
    this.log(
      chalk.blue(`
            __________________________________________________________________________________________
            Author     : ${this.answers.authorName} (${this.answers.authorUsername}, ${this.answers.authorEmail})
            Vendor     : ${this.answers.vendorName} (${slugify(this.answers.vendorName)})
            Package    : ${slugify(this.appname)} <${this.answers.description}>
            Namespace  : ${this.answers.vendorNamespace}\\${this.answers.className}
            Class name : ${this.answers.className}
            ____________________
            Packages & Utilities
            Stack                : ${this.answers.stack.map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(', ')}
            Use Dependabot       : ${this.answers.useDependabot ? 'yes' : 'no'}
            __________________________________________________________________________________________

            This script will replace the above values in all relevant files in the project directory.
        `),
    );

    const proceed = await this.prompt({
      type: 'confirm',
      name: 'modifyFiles',
      message: 'Modify files?',
      default: false,
    });

    if (proceed.modifyFiles) {
      await this.prompting();
      return false;
    }

    return true;
  }

  async writing() {
    this.fs.copyTpl(
      this.templatePath(this._template + '/README.md'),
      this.destinationPath('README.md'),
      this.answers,
    );
    this.fs.copyTpl(
      this.templatePath(this._template + '/LICENSE.md'),
      this.destinationPath('LICENSE.md'),
      this.answers,
    );
    this.fs.copyTpl(
      this.templatePath(this._template + '/CHANGELOG.md'),
      this.destinationPath('CHANGELOG.md'),
      {
        packageName: this.appname,
      },
    );
    this.fs.copy(
      this.templatePath(this._template + '/.gitignore'),
      this.destinationPath('.gitignore'),
    );
    this.fs.copy(
      this.templatePath(this._template + '/.editorconfig'),
      this.destinationPath('.editorconfig'),
    );

    if (this.answers.stack.includes('laravel')) {
      this.fs.copyTpl(
        this.templatePath(this._template + '/phpunit.xml'),
        this.destinationPath('phpunit.xml'),
        {
          packageSlug: slugify(this.appname),
        },
      );
      this.fs.copy(
        this.templatePath(this._template + '/phpstan.neon.dist'),
        this.destinationPath('phpstan.neon'),
      );
      this.fs.copyTpl(
        this.templatePath(this._template + '/composer.json'),
        this.destinationPath('composer.json'),
        {
          ...this.answers,
          vendorSlug: slugify(this.answers.vendorName),
          packageSlug: slugify(this.appname),
        },
      );

      //   /tests
      this.fs.copyTpl(
        this.templatePath(this._template + '/tests/TestCase.php'),
        this.destinationPath('tests/TestCase.php'),
        {
          ...this.answers,
        },
      );
      this.fs.copyTpl(
        this.templatePath(this._template + '/tests/Pest.php'),
        this.destinationPath('tests/Pest.php'),
        {
          ...this.answers,
        },
      );
      this.fs.copy(
        this.templatePath(this._template + '/tests/ExampleTest.php'),
        this.destinationPath('tests/ExampleTest.php'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/tests/ArchTest.php'),
        this.destinationPath('tests/ArchTest.php'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/tests/Unit/.gitkeep'),
        this.destinationPath('tests/Unit/.gitkeep'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/tests/Feature/.gitkeep'),
        this.destinationPath('tests/Feature/.gitkeep'),
      );

      //   /src
      this.fs.copyTpl(
        this.templatePath(this._template + '/src/SkeletonServiceProvider.php'),
        this.destinationPath(
          'src/' + this.answers.className + 'ServiceProvider.php',
        ),
        {
          ...this.answers,
        },
      );
      this.fs.copyTpl(
        this.templatePath(this._template + '/src/EventServiceProvider.php'),
        this.destinationPath('src/EventServiceProvider.php'),
        {
          ...this.answers,
        },
      );
      this.fs.copyTpl(
        this.templatePath(
          this._template + '/src/Http/Controllers/ShowSkeletonController.php',
        ),
        this.destinationPath(
          '/src/Http/Controllers/' +
            'Show' +
            this.answers.className +
            'Controller.php',
        ),
        {
          ...this.answers,
        },
      );
      this.fs.copyTpl(
        this.templatePath(
          this._template + '/src/Http/Controllers/Controller.php',
        ),
        this.destinationPath('/src/Http/Controllers/Controller.php'),
        {
          ...this.answers,
        },
      );
    }

    if (this.answers.stack.includes('react')) {
      this.fs.copy(
        this.templatePath(this._template + '/vite.config.ts'),
        this.destinationPath('vite.config.ts'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/tsconfig.json'),
        this.destinationPath('tsconfig.json'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/tailwind.config.js'),
        this.destinationPath('tailwind.config.js'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/postcss.config.js'),
        this.destinationPath('postcss.config.js'),
      );
      this.fs.copyTpl(
        this.templatePath(this._template + '/package.json'),
        this.destinationPath('package.json'),
        {
          ...this.answers,
          vendorSlug: slugify(this.answers.vendorName),
          packageSlug: slugify(this.appname),
        },
      );
      this.fs.copyTpl(
        this.templatePath(this._template + '/index.html'),
        this.destinationPath('index.html'),
        {
          ...this.answers,
        },
      );
      this.fs.copy(
        this.templatePath(this._template + '/resources/js/main.tsx'),
        this.destinationPath('resources/js/main.tsx'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/resources/js/Extension.tsx'),
        this.destinationPath('resources/js/Extension.tsx'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/resources/js/app.tsx'),
        this.destinationPath('resources/js/app.tsx'),
      );
      this.fs.copy(
        this.templatePath(this._template + '/resources/css/app.css'),
        this.destinationPath('resources/css/app.css'),
      );
    }
  }
}
