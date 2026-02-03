import chalk from 'chalk';
import { promptProjectDetails, promptRemoteDetails } from '../utils/prompts';
import { createHostApp } from './create-host';
import { createRemoteApp } from './create-remote';

export async function interactiveMode(): Promise<void> {
  console.log(chalk.blue('🎯 Interactive Mode\n'));
  console.log(chalk.gray('Answer a few questions to scaffold your micro-frontend project.\n'));

  const config = await promptProjectDetails();

  if (config.type === 'host') {
    await createHostApp();
  } else {
    await createRemoteApp();
  }
}
