import chalk from 'chalk';
import ora from 'ora';
import { promptProjectDetails, promptRemoteDetails } from '../utils/prompts';
import { generateHostApp } from '../generators/host-generator';
import { setupMonorepo } from '../generators/monorepo-generator';

export async function createHostApp(): Promise<void> {
  console.log(chalk.blue('📦 Creating Host Application...\n'));

  const config = await promptProjectDetails('host');
  const remotes = await promptRemoteDetails();

  const spinner = ora('Generating project files...').start();

  try {
    if (config.isMonorepo) {
      await setupMonorepo(config, remotes);
    } else {
      await generateHostApp(config, remotes);
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
