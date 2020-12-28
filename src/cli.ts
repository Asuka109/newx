import { cac } from 'cac'
import { statSync } from 'fs'
import merge from 'deepmerge'
import { Config, defaultConfig, RecursivePartial } from './config'
import Newx from './index'

/**
 * Newx will search newx.config.{ts,js} .newxrc.json
 * or newx property in package.json from your project. 
 */
export const readConfig = (): Config => {
  const configContents: RecursivePartial<Config>[] = [defaultConfig()];
  ['newx.config.ts', 'newx.config.js', '.newxrc.json', '.newxrc'].forEach(filename => {
    try {
      if (statSync(filename).isFile()) {
        configContents.push(require(`${process.cwd()}/${filename}`))
      }
    } catch (e) {}
  })
  return merge.all(configContents) as Config
}

/**
 * Mix default config, file defined config and argument.
 */
const mixConfig = (config: RecursivePartial<Config>): Config => Object.assign(readConfig(), config)

const cli = cac('newx')

cli.command('build', 'Build files.')
  .action((options: Config) => {
    const _options = mixConfig(options)
    console.log('_options: ', _options)
    const newx = new Newx(_options.input)
  })

cli.command('dev', 'Watch files and running dev-server.')
  .option('-h, --host <host>', 'Server host.')
  .option('-p, --port <port>', 'Server port.')
  .option('-O, --open', 'Open the dev server in your browser when building succeeded.')
  .action((options: Config) => {
    const _options = mixConfig(options)
    console.log('_options: ', _options)
    const newx = new Newx(_options.input)
  })

cli
  .option('--pages <path>', 'The directory to page files.')
  .option('--components <path>', 'The directory to page files.')
  .option('--layouts <path>', 'The directory to layout files.')
  .option('-o, --dir <path>', 'The directory to output files.')
  .option('-c, --clean', 'Disable clean output directory before building.')
  .option('-f, --format <type>', 'Specify the output format.')

cli.help()

cli.parse()