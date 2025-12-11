import type { DocumentReference, Timestamp } from 'firebase/firestore'

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type WrappedWithId<T> = { id: string; data: T }

/**
 * Extend a type with an order property
 */
export type WithOrder<T> = T & { order: number }

/**
 * Create array from OrderedMap
 */
export type OrderedArr<T extends Record<string, any>> = Array<{ id: string } & WithOrder<T>>

export type OrderedMap<T extends Record<string, any>> = Record<string, WithOrder<T>>

/**
 * @deprecated Use OrderedMap instead
 */
export type Ordered<T> = T & { order: number }

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

/**
 * A generic that takes a type and returns a new type with all properties optional
 * except for the ones specified in the second argument.
 */
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>

export type Patch<T, RequiredKeys extends keyof T = never> = {
  [K in keyof T as K extends RequiredKeys ? K : never]: T[K] extends object ? Patch<T[K]> : T[K]
} & {
  [K in keyof T as K extends RequiredKeys ? never : K]?:
    | (T[K] extends object ? Patch<T[K]> : T[K])
    | symbol
}

/**
 * A generic that narrows the PageContent type to a specific type and returns a new
 * type that has all properties optional except for the type.
 */
export type PartialPageContent<T extends PageContent['type']> = OptionalExcept<
  Extract<PageContent, { type: T }>,
  'type' | 'id'
>

export type SimpleExpression = {
  field: DocumentReference
  type?: undefined
  clauses?: undefined
} & (
  | {
      operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'is' | 'not' | 'isnot' | 'required'
      value?: string | number | boolean
    }
  | {
      operator: 'between'
      value?: { from?: string; to?: string }
    }
)

export type ComplexExpression = {
  type: 'and' | 'or'
  clauses: OrderedMap<SimpleExpression>
  field?: undefined
  operator?: undefined
  value?: undefined
}

export type Expression = SimpleExpression | ComplexExpression

type WithValidator = {
  // Denne er mer kompleks i losen, tror vi kan forenkle denne i første runde og kun bruke den for input
  validator?: {
    pattern: string // Regex som f.eks "^\\d+(,\\d+)?$"
    error: string
  }
}

export type ImageRef = {
  alt?: string
  /**
   * path to image in Firebase storage _RELATIVE_ to the wizard version it is referenced from,
   * meaning that if the wizard version is at `wizards/123/versions/456` and the image src says
   * `some/folder/image.png` the full path to the image in storage will be
   * `wizards/123/versions/456/some/folder/image.png`
   */
  file: string
}

export type Answer = {
  id: string
  type: 'Answer'
  heading: string
  image?: ImageRef
}

export type PageNode<T extends { type: string }> = T

export type Content = {
  id: string
  heading?: string
  text?: string // HTML
  summary?: string
  details?: string
  image?: ImageRef
  show?: Expression // Vi har også hide, men tenker vi kan forenkle det til kun vis i første runde.
  flow?: 'stop' | 'continue' | null
}

export type Text = PageNode<
  Content & {
    type: 'Text'
  }
>

export type Radio = PageNode<
  Content & {
    type: 'Radio'
    allMandatory?: boolean // Required user to check all the options in the list, in order for it to be "valid".
    grid: boolean // Display options in a three column grid.
    options?: OrderedMap<Answer>
  }
>

export type Select = PageNode<
  Content & {
    type: 'Select'
    optional?: boolean // By default all fields are required.
    options?: OrderedMap<Answer>
  }
>

export type Checkbox = PageNode<
  Content & {
    type: 'Checkbox'
    allMandatory?: boolean // Required user to check all the options in the list, in order for it to be "valid".
    grid: boolean // Display options in a three column grid.
    optional?: boolean // By default all fields are required.
    options?: OrderedMap<Answer>
  }
>

export type PageContentWithOptions<Creation = false> = Extract<
  PageContent<Creation>,
  { options?: OrderedMap<Answer> }
>

export type Input = PageNode<
  Content &
    WithValidator & {
      type: 'Input'
      optional?: boolean // By default all fields are required.
    }
>

export type NumberInput = PageNode<
  Content & {
    type: 'Number'
    minimum?: number
    maximum?: number
    unit?: string
    step?: number // Defaults to 1
    optional?: boolean // By default all fields are required.
  }
>

export type Sum = PageNode<
  Content & {
    type: 'Sum'
    values: OrderedMap<{ node: DocumentReference }>
    operations?: Array<'+' | '-' | '*' | '/' | '-/' | '%'>
    unit?: string
    minimum?: number
  }
>

export type TableCell = {
  type: 'Cell' | 'Heading'
  text: string // HTML okey
  colSpan?: number
  rowSpan?: number
  test?: SimpleExpression
}

export type TableRow = TableCell[]

export type TableCells = TableRow[]

export type TableCellsRecord = Record<string, TableRow>

export type TableCellsValue = TableCells | TableCellsRecord

export type Table = PageNode<
  Content & {
    type: 'Table'
    cells?: TableCellsValue
  }
>

export type Information = PageNode<{
  id: string
  type: 'Information'
  heading: string
  text?: string // HTML
}>

export type Error = PageNode<{
  id: string
  type: 'Error'
  heading: string
  text?: string // HTML
}>

export type SimpleResult = {
  // Brukes i branches for å vise negative resultatsider etter errors
  id: string
  type: 'Result'
  heading: string
  lead?: string // HTML
}

export type Branch<Creation = false> = PageNode<{
  id: string
  type: 'Branch'
  preset: 'NegativeResult' | 'ExtraInformation' | 'NewQuestions'
  test: Expression
  /**
   * Should not refer to nodes of types other than Information, Error or SimpleResult
   */
  content: Creation extends true
    ? OrderedMap<{ node: DocumentReference }> | OptionalExcept<PageContent, 'type'>[]
    : OrderedMap<{ node: DocumentReference }>
}>

export type Intro = {
  id: string
  type: 'Intro'
  heading: string
  lead?: string // HTML
  /**
   * List of ids referencing Text nodes
   */
  content: OrderedMap<{ node: DocumentReference }>
}

export type Result = {
  id: string
  type: 'Result'
  heading: string
  lead?: string // HTML
  show?: Expression
  /**
   * List of ids referencing Text nodes
   */
  content: OrderedMap<{ node: DocumentReference }>
}

export type PageContent<Creation = false> =
  | Text
  | Radio
  | Checkbox
  | Select
  | Input
  | NumberInput
  | Sum
  | Table
  | Branch<Creation>
  | Error
  | Information
  | SimpleResult

export type Page = {
  id: string
  type: 'Page'
  heading: string
  lead?: string // HTML
  show?: Expression
  /**
   * List of ids referencing PageContent nodes
   */
  content: OrderedMap<{ node: DocumentReference }>
}

export type Wizard = {
  title?: string
  publishedVersion?: DocumentReference
  draftVersion?: DocumentReference
  isTemplate?: boolean
}

export type WizardVersion = {
  title?: string
  publishedFrom?: Timestamp
  publishedTo?: Timestamp
  pages?: OrderedMap<WizardPage>
  intro?: Intro
}

export type WizardPage = Page | Result

export type WizardIntro = {
  heading?: string | undefined
  lead?: string | undefined
  content: {
    id: string
    heading?: string
    text?: string
  }[]
}
