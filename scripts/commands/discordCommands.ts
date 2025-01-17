import 'dotenv/config';
// scripts/commands/discordCommands.ts
import { join } from 'path';
import inquirer from 'inquirer';
import { REST, Routes } from 'discord.js';
import { writeFileSync, readFileSync } from 'fs';

const COMMANDS_FILE = join(__dirname, '../config/discordCommands.json');

interface Command {
  name: string;
  description: string;
  options?: any[];
}

async function loadCommands(): Promise<Command[]> {
  try {
    return JSON.parse(readFileSync(COMMANDS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function saveCommands(commands: Command[]): Promise<void> {
  writeFileSync(COMMANDS_FILE, JSON.stringify(commands, null, 2));
}

async function main() {
  if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    console.error('\x1b[31m❌ Missing TOKEN or CLIENT_ID in .env\x1b[0m');
    process.exit(1);
  }

  const commands = await loadCommands();
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '🔧 Select action:',
      choices: [
        'Deploy Commands',
        'List Commands',
        'Add Command',
        'Remove Command',
      ],
    },
  ]);

  switch (action) {
    case 'Deploy Commands': {
      try {
        console.log('\x1b[34m🔄 Deploying commands...\x1b[0m');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
          body: commands,
        });
        console.log('\x1b[32m✅ Commands deployed!\x1b[0m');
      } catch (error) {
        console.error('\x1b[31m❌ Deployment failed:', error, '\x1b[0m');
      }
      break;
    }

    case 'List Commands': {
      console.log('\x1b[36m📜 Current commands:\x1b[0m');
      console.table(commands);
      break;
    }

    case 'Add Command': {
      let command: Command = { name: '', description: '' };
      const { name, description, hasOptions } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Command name:',
          validate: (input) => input.length > 0,
        },
        {
          type: 'input',
          name: 'description',
          message: 'Command description:',
          validate: (input) => input.length > 0,
        },
        {
          type: 'confirm',
          name: 'hasOptions',
          message: 'Add command options?',
          default: false,
        },
      ]);
      command = { name, description };
      if (hasOptions) {
        command = { ...command, options: [] };
        let addMore = true;
        while (addMore) {
          const option = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Option name:',
              validate: (input) => input.length > 0,
            },
            {
              type: 'number',
              name: 'type',
              message:
                'Option type (3=STRING, 4=INTEGER, 5=BOOLEAN, 6=USER, 7=CHANNEL):',
              validate: (input) => {
                const num = Number(input);
                return num >= 3 && num <= 7;
              },
            },
            {
              type: 'input',
              name: 'description',
              message: 'Option description:',
              validate: (input) => input.length > 0,
            },
            {
              type: 'confirm',
              name: 'required',
              message: 'Is option required?',
              default: false,
            },
          ]);
          command.options = [...(command.options || []), option];
          const { more } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'more',
              message: 'Add another option?',
              default: false,
            },
          ]);
          addMore = more;
        }
      }
      commands.push(command);
      await saveCommands(commands);
      console.log('\x1b[32m✅ Command added!\x1b[0m');
      break;
    }

    case 'Remove Command': {
      const { commandToRemove } = await inquirer.prompt([
        {
          type: 'list',
          name: 'commandToRemove',
          message: 'Select command to remove:',
          choices: commands.map((c) => c.name),
        },
      ]);

      const index = commands.findIndex((c) => c.name === commandToRemove);
      commands.splice(index, 1);
      await saveCommands(commands);
      console.log('\x1b[32m✅ Command removed!\x1b[0m');
      break;
    }
  }
}

main().catch(console.error);
