import { statSync } from 'fs'
import postHtml from 'posthtml'
import merge from 'deepmerge'
import beautify from 'js-beautify'
import postHtmlParser from 'posthtml-parser'
import postHtmlRender from 'posthtml-render'
import liveServer from 'live-server'
import { deleteEmptyProp, PartialExcept, PickAndFlatten, RecursivePartial } from './utils'

export interface Config {
  input: {
    /** The directory to page files. */
    pages: string
    /** The directory to component files. */
    components: string
    /** The directory to layout files. */
    layouts: string
  }
  output: {
    /** The directory to output files. */
    dir: string
    /** Clean output directory before building. */
    clean: boolean
    /** Specify the output format. */
    format: boolean
  }
  devServer: liveServer.LiveServerParams & {
    /** Observed path whose change triggers recompilation. */
    watch: string | string[]
  }
  /** Plugins for postHtml. */
  plugins: postHtml.Plugin<unknown>[]
  /** Options for js-beautify. */
  jsBeautify: Partial<beautify.JSBeautifyOptions> 
  /** Options for posthtml-parser. */
  parser: Partial<postHtmlParser.Options>
  /** Options for posthtml-render. */
  render: Partial<postHtmlRender.Options>
  /** Debug mode. */
  debug: boolean
}

export type ConfigSerializableObjectField = 'input'|'output'|'devServer'

export const defaultConfig = () => ({
  input: {
    pages: 'src/pages',
    components: 'src/components',
    layouts: 'src/layouts'
  },
  output: {
    dir: 'dist',
    clean: true,
    format: true
  },
  devServer: {
    host: process.env.IP || '0.0.0.0',
    port: 8080,
    logLevel: 0,
    watch: []
  },
  plugins: [],
  jsBeautify: {},
  parser: {},
  render: {},
  debug: true
} as Config)

/**
 * Merge config objects.
 */
const mergeConfig = (...args: RecursivePartial<Config>[]) => merge.all(args) as Config

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
  return mergeConfig(...configContents)
}

export type CliArgs =
  PickAndFlatten<Config, ConfigSerializableObjectField> &
  Pick<Config, 'debug'>

export const mergeCliArgs = (config: Config, cliArgs: CliArgs) => {
  const _config: PartialExcept<Config, ConfigSerializableObjectField> = {
    input: {
      pages: cliArgs.pages,
      components: cliArgs.components,
      layouts: cliArgs.layouts
    },
    output: {
      dir: cliArgs.dir,
      clean: cliArgs.clean,
      format: cliArgs.format
    },
    devServer: {
      host: cliArgs.host,
      port: cliArgs.port,
      open: cliArgs.open,
      watch: cliArgs.watch
    },
    debug: cliArgs.debug
  }
  deleteEmptyProp(_config)
  return mergeConfig(config, _config)
}
