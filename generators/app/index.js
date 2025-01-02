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
import { slugify, toNamespace } from './string-helper.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const require = createRequire(import.meta.url);

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);
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
  }
}
