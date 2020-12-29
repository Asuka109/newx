import { cac } from 'cac'
import fs from 'fs'
import glob from "glob"
import path from 'path'
import { CliConfig, Config, mergeCliConfig, readConfig } from './config'
import Newx from './index'
import rimraf from "rimraf";

const cli = cac('newx')

const removeDuplicate = <T = any>(arr: T[]) => Array.from(new Set(arr))

const cliAction = (cliOptions: CliConfig, watch: boolean) => {
  const options = mergeCliConfig(readConfig(), cliOptions)
  const getOutputPagePath = (filename: string) => {
    const relativePath = path.relative(pages, filename)
    return path.resolve(`${options.output.dir}/${relativePath}`)
  }
  const {
    input: { components, layouts, pages },
    devServer: { watch: _watch }
  } = options
  const newx = new Newx({ ...options.input, format: options.output.format })

  if (options.output.clean)
    rimraf.sync(options.output.dir)

  glob.sync(`${pages}/**/*.html`).forEach(inputFile => {
    const outputFile = getOutputPagePath(inputFile)
    newx.processFile(inputFile, outputFile)
  })

  if (!watch) return
  
  const watchFiles = removeDuplicate([
    components, layouts, ..._watch instanceof Array ? _watch : [_watch]
  ])

  watchFiles.forEach(path => {
    fs.watch(path, (event, filename) => {
      newx.processFile(filename, getOutputPagePath(filename))
    })
  })
}

cli.command('build', 'Build files.')
  .action((cliOptions: CliConfig) => cliAction(cliOptions, false))

cli.command('dev', 'Watch files and running dev-server.')
  .option('-h, --host <host>', 'Server host.')
  .option('-p, --port <port>', 'Server port.')
  .option('-O, --open', 'Open the dev server in your browser when building succeeded.')
  .action((cliOptions: CliConfig) => cliAction(cliOptions, true))

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