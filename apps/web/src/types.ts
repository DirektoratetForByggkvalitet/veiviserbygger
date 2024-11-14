export type Answer = {
  id: string
  type: 'Answer'
  heading: string
  value: string
}

export type QuestionBase = {
  id: string
  heading: string
  text?: string // HTML
  summary?: string
  details?: string
  options?: Answer[]
  flow: 'stop' | 'continue' | null
}

export type Radio = QuestionBase & {
  type: 'Radio'
}

export type Text = QuestionBase & {
  type: 'Text'
}

export type Expression = {
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
  errorMessage?: string
}

export type Page = {
  id: string
  type: 'Page' | 'Result'
  heading: string
  lead?: string // HTML
  show?: Expression
  children?: (Radio | Text)[]
}

export type Wizard = Page[]
