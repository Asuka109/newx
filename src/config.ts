import postHtml from "posthtml"

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>

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
    format: 'minimize' | 'beautify' | 'original'
  }
  devServer: {
    /** Server host. */
    host: string,
    /** Server port. */
    port: string | number
    /** Open the dev server in your browser when building succeeded. */
    open: boolean
  }
  /** Configure options for postHtml. */
  postHtmlPlugins: postHtml.Plugin<unknown>[]
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
