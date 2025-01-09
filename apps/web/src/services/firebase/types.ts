export type WrappedWithId<T> = { data: T; id: string }
export type Ordered<T> = T & { order: number }

export type Wizard = {
  title: string
  publishedVersion?: string
}

export type Block = {
  type: string
}

export type WizardPage = {
  title: string
  content: Ordered<Block>[]
}

export type WizardVersion = {
  title?: string
  pages?: WizardPage[]
}
