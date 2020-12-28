import postHtml from "posthtml";

interface NewxOptions {
  /** The directory to page files. */
  pages?: string
  /** The directory to component files. */
  components?: string
  /** The directory to layout files. */
  layouts?: string
}

export default class Newx {
  options: NewxOptions

  constructor(options: NewxOptions) {
    this.options = options
  }

  process(html: string): string {
    // 转换并输出 html 代码字符串
    return html
  }

  processFile(input: string, output: string): void {
    // 读取并创建 html 代码文件
  }

  format(content: string): string {
    // 格式化代码
    return content
  }
}