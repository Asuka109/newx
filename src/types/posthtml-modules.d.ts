import postHtml from 'posthtml'

declare module posthtmlModules {
  export interface Options<TThis> {
    /** Root path for modules lookup. */
    root?: string
    /** 
     * PostHTML plugins to apply for every parsed module.
     * If a function provided, it will be called with module's file path.
     */
    plugins?: postHtml.Plugin<TThis> | postHtml.Plugin<TThis>[]
    /**
     * Root filename for processing apply, needed for path resolving
     * (it's better to always provide it).
     */
    from?: string
    /** Apply plugins to root file after modules processing. */
    initial?: boolean
    /** Use a custom tag name. */
    tag?: string
    /** Use a custom attribute name. */
    attribute?: string
  }

  declare function posthtmlModules <TThis>(options: Options<TThis>): postHtml.Plugin<TThis>

  export default posthtmlModules 
}

export = posthtmlModules