#!/usr/bin/env node

/**
 * @returfs/cli
 *
 * The Returfs extension developer CLI. A thin commander front-end over the
 * yeoman scaffolding generator (kept in ./generators/app), plus dev/build/
 * validate helpers for working on an extension locally.
 *
 * Dev-facing only: there is intentionally no `publish` — extensions are
 * submitted via GitHub and deployed by Returfs (see ../../../ARCHITECTURE.md).
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { program } from 'commander';
import { execa } from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detect the package manager from the nearest lockfile (defaults to npm). */
function detectPackageManager(cwd) {
  if (existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(path.join(cwd, 'bun.lockb'))) return 'bun';
  return 'npm';
}

/** Read package.json from cwd, or null if absent/invalid. */
function readPackageJson(cwd) {
  const file = path.join(cwd, 'package.json');
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Run a package.json script in the current project, streaming output. */
async function runScript(script, extraArgs) {
  const cwd = process.cwd();
  const projectPkg = readPackageJson(cwd);
  if (!projectPkg) {
    console.error(
      chalk.red(`✗ No package.json found in ${cwd}.`),
      'Run this inside an extension directory.',
    );
    process.exit(1);
  }
  if (!projectPkg.scripts || !projectPkg.scripts[script]) {
    console.error(
      chalk.red(`✗ No "${script}" script in package.json.`),
      `Available: ${Object.keys(projectPkg.scripts || {}).join(', ') || '(none)'}`,
    );
    process.exit(1);
  }

  const pm = detectPackageManager(cwd);
  const args = ['run', script, ...(extraArgs || [])];
  console.log(chalk.dim(`$ ${pm} ${args.join(' ')}`));
  try {
    await execa(pm, args, { stdio: 'inherit', cwd });
  } catch (error) {
    process.exit(typeof error.exitCode === 'number' ? error.exitCode : 1);
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

program
  .name('returfs')
  .description('Returfs extension developer CLI')
  .version(pkg.version);

program
  .command('new')
  .argument('[name]', 'Extension name (a directory is created and used as the app name)')
  .description('Scaffold a new extension (Laravel and/or React) from the skeleton')
  .action(async (name) => {
    // If a name is given, create + enter that directory so the generator's
    // appname (derived from the cwd) matches it — mirrors `mkdir x && cd x`.
    if (name) {
      const dest = path.resolve(process.cwd(), name);
      mkdirSync(dest, { recursive: true });
      process.chdir(dest);
    }

    // yeoman-environment v4 exposes createEnv as a named export.
    const env = await import('yeoman-environment').then((m) =>
      (m.createEnv ?? m.default?.createEnv ?? m.default)(),
    );
    const generatorPath = path.join(__dirname, '../generators/app/index.js');
    await env.register(generatorPath, { namespace: 'returfs:app' });
    await env.run(['returfs:app']);
  });

program
  .command('dev')
  .description("Run the extension's dev server (project's `dev` script)")
  .allowUnknownOption(true)
  .argument('[args...]', 'Extra args passed through to the dev script')
  .action(async (args) => {
    await runScript('dev', args);
  });

program
  .command('build')
  .description("Build the extension (project's `build` script)")
  .allowUnknownOption(true)
  .argument('[args...]', 'Extra args passed through to the build script')
  .action(async (args) => {
    await runScript('build', args);
  });

program
  .command('validate')
  .description('Validate the extension structure in the current directory')
  .action(() => {
    const cwd = process.cwd();
    const problems = [];
    const notes = [];

    const projectPkg = readPackageJson(cwd);
    const hasComposer = existsSync(path.join(cwd, 'composer.json'));

    if (!projectPkg && !hasComposer) {
      problems.push('No package.json or composer.json found — not an extension.');
    }

    if (projectPkg) {
      if (!projectPkg.name) problems.push('package.json is missing "name".');
      if (!projectPkg.scripts?.build)
        notes.push('package.json has no "build" script.');
      notes.push('React stack detected (package.json).');
    }

    if (hasComposer) {
      try {
        const composer = JSON.parse(
          readFileSync(path.join(cwd, 'composer.json'), 'utf8'),
        );
        if (!composer.name) problems.push('composer.json is missing "name".');
        notes.push('Laravel stack detected (composer.json).');
      } catch {
        problems.push('composer.json is not valid JSON.');
      }
    }

    for (const note of notes) console.log(chalk.dim('•'), note);

    if (problems.length) {
      console.log();
      for (const problem of problems) console.log(chalk.red('✗'), problem);
      process.exit(1);
    }

    console.log(chalk.green('✓ Extension structure looks valid.'));
  });

program.parseAsync().catch((error) => {
  console.error(chalk.red('✗'), error?.message || error);
  process.exit(1);
});
