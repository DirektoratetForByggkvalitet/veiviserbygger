import type { DocumentReference, Timestamp } from 'firebase/firestore'

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type WrappedWithId<T> = { id: string; data: T }

/**
 * @deprecated Use OrderedMap instead
 */
export type Ordered<T> = T & { order: number }

export type OrderedMap<T> = { [key: string]: T & { order: number } }

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

/**
 * A generic that takes a type and returns a new type with all properties optional
 * except for the ones specified in the second argument.
 */
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>

/**
 * A generic that narrows the PageContent type to a specific type and returns a new
 * type that has all properties optional except for the type.
 */
export type PartialPageContent<T extends PageContent['type']> = OptionalExcept<
  Extract<PageContent, { type: T }>,
  'type' | 'id'
>

export type SimpleExpression = {
  field: string
  operator:
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte'
    | 'eq'
    | 'neq'
    | 'between'
    | 'is'
    | 'not'
    | 'isnot'
    | 'required'
  value?: string | number | boolean
  // errorMessage?: string Trenger vi denne?
}

export type ComplexExpression = {
  type: 'and' | 'or'
  clauses: Expression[]
  // errorMessage?: string Trenger vi denne?
}

export type Expression = SimpleExpression | ComplexExpression

type WithValidator = {
  // Denne er mer kompleks i losen, tror vi kan forenkle denne i første runde og kun bruke den for input
  validator?: {
    pattern: string // Regex som f.eks "^\\d+(,\\d+)?$"
    error: string
  }
}

export type Answer = {
  id: string
  type: 'Answer'
  heading: string
}

export type PageNode<T extends { type: string }> = T

export type Content = {
  id: string
  heading?: string
  text?: string // HTML
  summary?: string
  details?: string
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

export type PageContentWithOptions = Extract<PageContent, { options?: OrderedMap<Answer> }>

export type Input = PageNode<
  Content &
    WithValidator & {
      type: 'Input'
      optional?: boolean // By default all fields are required.
    }
>

export type NumberInput = PageNode<
  Content &
    WithValidator & {
      type: 'Number'
      minimum?: number
      maximum?: number
      step?: number // Defaults to 1
      optional?: boolean // By default all fields are required.
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

export type Branch = PageNode<{
  id: string
  type: 'Branch'
  preset: 'NegativeResult' | 'ExtraInformation' | 'NewQuestions'
  test: Expression
  /**
   * Should not refer to nodes of types other than Information, Error or SimpleResult
   */
  content: DocumentReference[]
}>

export type Intro = {
  id: string
  type: 'Intro'
  heading: string
  lead?: string // HTML
  /**
   * List of ids referencing Text nodes
   */
  content?: DocumentReference[]
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
  content?: DocumentReference[]
}

export type PageContent =
  | Text
  | Radio
  | Checkbox
  | Select
  | Input
  | NumberInput
  | Branch
  | Error
  | Information

export type Page = {
  id: string
  type: 'Page'
  heading: string
  lead?: string // HTML
  show?: Expression
  /**
   * List of ids referencing PageContent nodes
   */
  content?: DocumentReference[]
}

export type Wizard = {
  title?: string
  publishedVersionId?: string
  draftVersionId?: string
}

export type WizardVersion = {
  title?: string
  publishedFrom?: Timestamp
  publishedTo?: Timestamp
  pages?: OrderedMap<WizardPage>
}

export type WizardPage = Intro | Page | Result
