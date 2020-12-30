import fs from "fs"
import postHtml from 'posthtml'
import postHtmlExtend from 'posthtml-extend'
import postHtmlParser from 'posthtml-parser'
import postHtmlRender from "posthtml-render"
import postHtmlModules from 'posthtml-modules'
import beautify from 'js-beautify'
import path from "path"

interface NewxOptions {
    /** The directory to component files. */
    components: string
    /** The directory to layout files. */
    layouts: string
    /** Specify the output format. */
    format: boolean
    parser?: postHtmlParser.Options
    render?: Partial<postHtmlRender.Options>
}

const postHtmlNestedModules: typeof postHtmlModules = ({ plugins=[], ...options} = {}) => {
  const hookedPostHtmlModules = (tree: postHtml.Node) => postHtmlNestedModules({ plugins, ...options })(tree)
  const _plugins = plugins instanceof Array ? plugins : [plugins]
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
      postHtmlExtend({ root: 'src/layouts' }),
      postHtmlNestedModules({ root: 'src/components' })
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
      if (this.options.format)
        outputContent = beautify.html(outputContent, { preserve_newlines: false })
        await fs.promises.writeFile(outputFile, outputContent)
    } catch (err) {
      console.log(err)
    }
  }
}