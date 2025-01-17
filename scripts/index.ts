import inquirer from 'inquirer';
import { readdirSync } from 'fs';
import { resolve, join } from 'path';
import { spawn } from 'child_process';

const rootDir = resolve(__dirname, 'commands');
const scripts = readdirSync(rootDir).filter(
  (file) => file.endsWith('.ts') && file !== 'index.ts'
);

if (scripts.length === 0) {
  console.log(
    '\x1b[31m❌ No TypeScript scripts found in the root folder.\x1b[0m'
  );
  process.exit(1);
}

console.log('\x1b[34;1m\n🚀 TypeScript Script Runner\n\x1b[0m');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'selectedScript',
      message: '\x1b[32m📜 Select a script to run:\x1b[0m',
      choices: scripts,
    },
  ])
  .then((answers) => {
    const selectedScript = answers.selectedScript;
    console.log(`\x1b[33m\n🔄 Running ${selectedScript}...\n\x1b[0m`);

    const child = spawn('ts-node', [join(rootDir, selectedScript)], {
      stdio: 'inherit',
    });

    child.on('error', (err) => {
      console.error(
        `\x1b[31m❌ Error executing ${selectedScript}:\n\x1b[0m`,
        err
      );
    });
  });
