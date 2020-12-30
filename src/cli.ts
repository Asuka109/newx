import { cac } from 'cac'
import fs from 'fs'
import glob from "glob"
import path from 'path'
import { CliArgs, mergeCliArgs, readConfig } from './config'
import Newx from './index'
import rimraf from "rimraf";
import logger from './logger'
import chalk from 'chalk'
import debounce from 'lodash/debounce'

const cli = cac('newx')

const removeDuplicate = <T = any>(arr: T[]) => Array.from(new Set(arr))

const cliAction = (cliOptions: CliArgs, watch: boolean) => {
  const options = mergeCliArgs(readConfig(), cliOptions)
  const {
    input: { components, layouts, pages },
    devServer: { watch: _watch }
  } = options
  const getOutputPagePath = (filename: string) => {
    const relativePath = path.relative(pages, filename)
    return path.resolve(`${options.output.dir}/${relativePath}`)
  }
  const newx = new Newx({
    ...options.input,
    format: options.output.format,
    parser: options.parser,
    render: options.render
  })
  const process = (inputFile: string, outputFile: string) => {
    newx.processFile(inputFile, outputFile)
    logger.log(chalk.cyan('Wrote'), path.relative(pages, inputFile))
  }
  const processAll = () => {
    pageFiles.forEach(inputFile => {
      const outputFile = getOutputPagePath(inputFile)
      process(inputFile, outputFile)
    })
  }
  if (options.output.clean)
    rimraf.sync(options.output.dir)

  // Build all pages.
  const pageFiles = glob.sync(`${pages}/**/*.html`).map(filename => path.resolve(filename))
  processAll()
  if (!watch) return

  // Watch dependent files and recompile them when they are changed.
  const watchFiles = removeDuplicate([
    pages, components, layouts, ..._watch instanceof Array ? _watch : [_watch]
  ])
  watchFiles.forEach(watchFile => {
    fs.watch(watchFile, debounce((event, filename) => {
      const abspath = path.resolve(watchFile, filename)
      if (pageFiles.includes(abspath)) {
        process(abspath, getOutputPagePath(abspath))
      } else {
        logger.log('Dependencies changed, rebuild all pages.')
        processAll()
      }
    }, 50))
  })
}

cli.command('build', 'Build files.')
  .action((cliOptions: CliArgs) => cliAction(cliOptions, false))

cli.command('dev', 'Watch files and running dev-server.')
  .option('-h, --host <host>', 'Server host.')
  .option('-p, --port <port>', 'Server port.')
  .option('-O, --open', 'Open the dev server in your browser when building succeeded.')
  .action((cliOptions: CliArgs) => cliAction(cliOptions, true))

cli
  .option('--pages <path>', 'The directory to page files.')
  .option('--components <path>', 'The directory to page files.')
  .option('--layouts <path>', 'The directory to layout files.')
  .option('-o, --dir <path>', 'The directory to output files.')
  .option('-c, --clean', 'Clean output directory before building.')
  .option('-f, --format', 'Specify the output format.')
  .option('-w, --watch <path>', 'Observed path whose change triggers recompilation.')

cli.help()

cli.parse()