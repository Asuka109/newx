import postHtml from "posthtml"
import { statSync } from 'fs'

export interface Config {
  input?: {
    /** The directory to page files. */
    pages?: string
    /** The directory to component files. */
    components?: string
    /** The directory to layout files. */
    layouts?: string
  }
  output?: {
    /** The directory to output files. */
    dir?: string
    /** Clean output directory before building. */
    clean?: boolean
    /** Specify the output format. */
    format?: 'minimize' | 'beautify' | 'original'
  },
  devServer?: {
    /** Server host. */
    host?: string,
    /** Server port. */
    port?: string | number
    /** Open the dev server in your browser when building succeeded. */
    open?: boolean
  }
  /** Configure options for postHtml. */
  postHtmlPlugins?: postHtml.Plugin<unknown>[]
}

export const defaultConfig = () => ({
  input: {
    pages: 'src/pages',
    components: 'src/components',
    layouts: 'src/layouts'
  },
  output: {
    dir: 'dist',
    clean: true,
    format: 'beautify'
  },
  devServer: {
    host: '0.0.0.0',
    port: '4000',
    open: true
  },
  postHtmlPlugins: []
} as Config)

/**
 * Newx will search newx.config.{ts,js} .newxrc.json
 * or newx property in package.json from your project. 
 */
export const readConfig = () => {
  const configContents: Config[] = [];
  ['newx.config.ts', 'newx.config.js', '.newxrc.json', '.newxrc'].forEach(filename => {
    try {
      if (statSync('newx.config.ts').isFile()) {
        configContents.push(require('./newx.config.ts'))
      }
    } catch (e) {}
  })
  return Object.assign(defaultConfig(), ...configContents)
}