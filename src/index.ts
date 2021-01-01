import fs from 'fs'
import path from 'path'
import postHtml from 'posthtml'
import postHtmlExtend from 'posthtml-extend'
import postHtmlParser from 'posthtml-parser'
import postHtmlRender from 'posthtml-render'
import postHtmlModules from 'posthtml-modules'
import beautify from 'js-beautify'
import chalk from 'chalk'
import logger from './logger'

interface NewxOptions {
    /** The directory to component files. */
    components: string
    /** The directory to layout files. */
    layouts: string
    /** Specify the output format. */
    format: boolean
    /** Options for posthtml-parser. */
    parser?: postHtmlParser.Options
    /** Options for posthtml-render. */
    render?: Partial<postHtmlRender.Options>
    /** Debug mode. */
    debug: boolean
}

const postHtmlNestedModules: typeof postHtmlModules = ({ plugins=[], ...options } = {}) => {
  const _plugins = plugins instanceof Array ? plugins : [plugins]
  const hookedPostHtmlModules = (tree: postHtml.Node) => postHtmlNestedModules({
    plugins: _plugins,
    ...options
  })(tree)
  return postHtmlModules({
    plugins: [hookedPostHtmlModules, ..._plugins],
    ...options
  })
}

export default class Newx {
  options: NewxOptions
  processor: postHtml.PostHTML<unknown, unknown>
  parser: (content: string) => postHtmlParser.Tree
  render: (tree: postHtmlRender.Tree) => string

  constructor(options: NewxOptions) {
    this.options = options
    this.processor = postHtml([
      postHtmlExtend({
        root: options.layouts
      }),
      postHtmlNestedModules({
        root: options.components,
        tag: 'import',
        attribute: 'from',
        from: `${options.components}/__` 
      })
    ])
    this.parser = (content: string) => postHtmlParser(content, options?.parser)
    this.render = (tree: postHtmlRender.Tree) => postHtmlRender(tree, options?.render)
  }

  async process(html: string) {
    const result = await this.processor.process(html, {
      parser: this.parser,
      render: this.render,
      sync: false
    })
    return result.html
  }

  async processFile(inputFile: string, outputFile: string) {
    try {
      const outputDir = path.dirname(outputFile)
      fs.mkdirSync(outputDir, { recursive: true })
      const inputContent = await fs.promises.readFile(inputFile, { encoding: 'utf-8' })
      let outputContent = await this.process(inputContent)
      if (this.options.format) {
        outputContent = beautify.html(outputContent, { preserve_newlines: false })
      }
      await fs.promises.writeFile(outputFile, outputContent)
    } catch (err) {
      logger.error(chalk`Error while building the file {green '${inputFile}'}.`)
      logger.error(err)
    }
  }
}