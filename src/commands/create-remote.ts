import chalk from 'chalk';
import ora from 'ora';
import { promptProjectDetails } from '../utils/prompts';
import { generateRemoteApp } from '../generators/remote-generator';
import { setupMonorepo } from '../generators/monorepo-generator';

export async function createRemoteApp(): Promise<void> {
  console.log(chalk.blue('📦 Creating Remote Application...\n'));

  const config = await promptProjectDetails('remote');

  const spinner = ora('Generating project files...').start();

  try {
    if (config.isMonorepo) {
      await setupMonorepo(config, []);
    } else {
      await generateRemoteApp(config);
    }

    spinner.succeed(chalk.green('Project created successfully!'));

    console.log(chalk.cyan('\n📋 Next steps:\n'));
    
    if (config.isMonorepo) {
      console.log(chalk.white(`  cd ${config.name}`));
      console.log(chalk.white(`  ${config.packageManager} install`));
      console.log(chalk.white(`  ${config.packageManager} run dev\n`));
    } else {
      console.log(chalk.white(`  cd ${config.name}`));
      console.log(chalk.white(`  ${config.packageManager} install`));
      console.log(chalk.white(`  ${config.packageManager} start\n`));
    }

    console.log(chalk.gray('For more information, check the README.md file.\n'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    throw error;
  }
}
