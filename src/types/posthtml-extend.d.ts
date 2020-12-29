import postHtml from 'posthtml'

declare module posthtmlExtend {
  export interface Options {
    /** The encoding of the parent template. */
    encoding?: string
    /** PostHTML plugins to apply for the template. */
    plugins?: postHtml.Plugin[]
    /** The path to the root template directory. */
    root?: string
    /** Whether the plugin should disallow undeclared block names. */
    strict?: string
    /** Tag names used to match a content block with a block for inserting content. */
    slot?: string
    /** The tag name to use when extending. */
    tagName?: string
  }

  declare function posthtmlExtend (options: Options): postHtml.Plugin

  export default posthtmlExtend
}

export = posthtmlExtend
