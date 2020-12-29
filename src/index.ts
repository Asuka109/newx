import fs from "fs"
import { promisify } from "util"
import postHtml from 'posthtml'
import postHtmlExtend from 'posthtml-extend'
import postHtmlParser from 'posthtml-parser'
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
}

interface ProcessOptions {
  parser?: postHtmlParser.Options
}

const postHtmlNestedModules: typeof postHtmlModules = (
  { plugins=[], ...options } = {}
) => postHtmlModules({
  plugins: [
    (tree: postHtml.Node) => postHtmlNestedModules({ plugins, ...options })(tree),
    ...plugins instanceof Array ? plugins : [plugins]
  ],
  ...options
})

export default class Newx {
  options: NewxOptions
  processor: postHtml.PostHTML<unknown, unknown>

  constructor(options: NewxOptions) {
    this.options = options
    this.processor = postHtml([
      postHtmlExtend({ root: 'src/layouts' }),
      postHtmlNestedModules({ root: 'src/components' })
    ])
  }

  process(html: string, options?: ProcessOptions): string {
    const parser = (html: string) => postHtmlParser(html, options?.parser)
    const result = this.processor.process(html, { parser, sync: true }) as unknown as postHtml.Result<unknown>
    return result.html
  }

  async processFile(inputFile: string, outputFile: string, options?: ProcessOptions) {
    try {
      const outputDir = path.dirname(outputFile)
      fs.mkdirSync(outputDir, { recursive: true })
      const inputContent = await fs.promises.readFile(inputFile, { encoding: 'utf-8' })
      let outputContent = this.process(inputContent, options)
      if (this.options.format)
        outputContent = beautify.html(outputContent, { preserve_newlines: false })
        await fs.promises.writeFile(outputFile, outputContent)
    } catch (err) {
      console.log(err)
    }
  }
}