#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createHostApp } from './commands/create-host';
import { createRemoteApp } from './commands/create-remote';
import { interactiveMode } from './commands/interactive';

const program = new Command();

program
  .name('create-micro-frontend')
  .description('CLI tool for creating micro-frontend applications with Module Federation')
  .version('1.0.0');

program
  .option('--host', 'Create a host application')
  .option('--remote', 'Create a remote application')
  .action(async (options) => {
    console.log(chalk.cyan.bold('\n🚀 Create Micro Frontend CLI\n'));

    try {
      if (options.host) {
        await createHostApp();
      } else if (options.remote) {
        await createRemoteApp();
      } else {
        await interactiveMode();
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(process.argv);
