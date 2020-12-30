
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type PickAndFlatten<T, K extends keyof T> = UnionToIntersection<T[K]>

export const deleteEmptyProp = (obj: any) => {
  for (const propName in obj)
    if (obj[propName] === null || obj[propName] === undefined)
      delete obj[propName]
    else if (typeof obj[propName] === 'object')
      deleteEmptyProp(obj[propName])
}

export const removeDuplicate = <T = any>(arr: T[]) => Array.from(new Set(arr))
