import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { cac } from 'cac'
import rimraf from 'rimraf'
import chalk from 'chalk'
import debounce from 'lodash/debounce'
import liveServer from 'live-server'
import Newx from './index'
import logger from './logger'
import { removeDuplicate } from './utils'
import { CliArgs, mergeCliArgs, readConfig } from './config'

const cli = cac('newx')

const cliAction = (cliOptions: CliArgs, watch: boolean) => {
  const options = mergeCliArgs(readConfig(), cliOptions)
  logger.setOptions({ debug: options.debug })
  const getOutputPagePath = (filename: string) => {
    const relativePath = path.relative(options.input.pages, filename)
    return path.resolve(`${options.output.dir}/${relativePath}`)
  }
  const newx = new Newx({
    ...options.input,
    format: options.output.format,
    parser: options.parser,
    render: options.render,
    debug: options.debug
  })
  const process = (inputFile: string, outputFile: string) => {
    newx.processFile(inputFile, outputFile)
    logger.done('Wrote', path.relative(options.input.pages, inputFile))
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
  const pageFiles = glob.sync(`${options.input.pages}/**/*.html`).map(filename => path.resolve(filename))
  processAll()
  if (!watch) return

  // Watch dependent files and recompile them when they are changed.
  const watchFiles = removeDuplicate([
    options.input.pages,
    options.input.components,
    options.input.layouts,
    ...options.output.watch instanceof Array
      ? options.output.watch
      : [options.output.watch]
  ])
  watchFiles.forEach(watchFile => {
    fs.watch(watchFile, debounce((event, filename) => {
      const abspath = path.resolve(watchFile, filename)
      if (pageFiles.includes(abspath)) {
        process(abspath, getOutputPagePath(abspath))
      } else {
        logger.warn('Dependencies changed, rebuild all pages.')
        processAll()
      }
    }, 50))
  })
  // Start live server.
  liveServer.start({
    ...options.devServer,
    root: options.output.dir
  })
  const serverHost = options.devServer.host === '0.0.0.0' ? 'localhost' : options.devServer.host
  logger.log(chalk`✨ The development server runs on {green http://${serverHost}:${options.devServer.port}}.`)
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
  .option('-d, --debug', 'Enable debug mode.')

cli.help()

cli.parse()