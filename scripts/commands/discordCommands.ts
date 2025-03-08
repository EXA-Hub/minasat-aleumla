import 'dotenv/config';
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

async function showMenu() {
  console.clear();
  return inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '🔧 Select action:',
      choices: [
        'Deploy Commands',
        'List Commands',
        'Add Command',
        'Remove Command',
        new inquirer.Separator(),
        'Exit',
      ],
    },
  ]);
}

async function handleAction(action: string) {
  const commands = await loadCommands();
  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  switch (action) {
    case 'Deploy Commands': {
      try {
        console.log('\x1b[34m🔄 Deploying commands...\x1b[0m');
        await rest.put(
          Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
          { body: commands }
        );
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
          validate: (input) => !!input.trim(),
        },
        {
          type: 'input',
          name: 'description',
          message: 'Command description:',
          validate: (input) => !!input.trim(),
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
        command.options = [];
        let addMore = true;
        while (addMore) {
          const option = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Option name:',
              validate: (input) => !!input.trim(),
            },
            {
              type: 'number',
              name: 'type',
              message:
                'Option type (3=STRING, 4=INTEGER, 5=BOOLEAN, 6=USER, 7=CHANNEL):',
              validate: (input) => (input ? input >= 3 && input <= 7 : false),
            },
            {
              type: 'input',
              name: 'description',
              message: 'Option description:',
              validate: (input) => !!input.trim(),
            },
            {
              type: 'confirm',
              name: 'required',
              message: 'Is option required?',
              default: false,
            },
          ]);
          command.options.push(option);
          ({ addMore } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'addMore',
              message: 'Add another option?',
              default: false,
            },
          ]));
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
      if (index > -1) {
        commands.splice(index, 1);
        await saveCommands(commands);
        console.log('\x1b[32m✅ Command removed!\x1b[0m');
      }
      break;
    }

    case 'Exit': {
      console.log('\x1b[35m👋 Exiting...\x1b[0m');
      process.exit(0);
    }
  }
}

async function main() {
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    console.error('\x1b[31m❌ Missing TOKEN or CLIENT_ID in .env\x1b[0m');
    process.exit(1);
  }

  while (true) {
    const { action } = await showMenu();
    await handleAction(action);

    // Pause before showing menu again
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...',
      },
    ]);
  }
}

main().catch(console.error);
