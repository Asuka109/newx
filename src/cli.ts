import { cac } from 'cac'
import fs from 'fs'
import glob from "glob"
import path from 'path'
import { CliArgs, Config, mergeCliArgs, readConfig } from './config'
import Newx from './index'
import rimraf from "rimraf";

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
  if (options.output.clean)
    rimraf.sync(options.output.dir)

  // Build all pages.
  const pageFiles = glob.sync(`${pages}/**/*.html`).map(filename => path.resolve(filename))

  console.log('pageFiles: ', pageFiles);
  pageFiles.forEach(inputFile => {
    const outputFile = getOutputPagePath(inputFile)
    newx.processFile(inputFile, outputFile)
  })
  if (!watch) return

  // Watch dependent files and recompile them when they are modified.
  const watchFiles = removeDuplicate([
    pages, components, layouts, ..._watch instanceof Array ? _watch : [_watch]
  ])
  watchFiles.forEach(watchFile => {
    fs.watch(watchFile, (event, filename) => {
      const abspath = path.resolve(watchFile, filename)
      console.log('abspath: ', abspath)
      if (pageFiles.includes(abspath)) {
        newx.processFile(abspath, getOutputPagePath(abspath))
      } else {
        pageFiles.forEach(inputFile => {
          const outputFile = getOutputPagePath(inputFile)
          newx.processFile(inputFile, outputFile)
        })
      }
    })
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