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
  value: string
}

export type Content = {
  id: string
  heading?: string
  text?: string // HTML
  summary?: string
  details?: string
  show?: Expression // Vi har også hide, men tenker vi kan forenkle det til kun vis i første runde.
  flow?: 'stop' | 'continue' | null
}

export type Text = Content & {
  type: 'Text'
}

export type Radio = Content & {
  type: 'Radio'
  options?: Answer[]
}

export type Select = Content & {
  type: 'Select'
  optional?: boolean // By default all fields are required.
  options?: Answer[]
}

export type Checkbox = Content & {
  type: 'Checkbox'
  allMandatory?: boolean // Required user to check all the options in the list, in order for it to be "valid".
  grid: boolean // Display options in a three column grid.
  optional?: boolean // By default all fields are required.
  options?: Answer[]
}

export type Input = Content &
  WithValidator & {
    type: 'Input'
    optional?: boolean // By default all fields are required.
  }

export type NumberInput = Content &
  WithValidator & {
    type: 'Number'
    minimum?: number
    maximum?: number
    step?: number // Defaults to 1
    optional?: boolean // By default all fields are required.
  }

export type Information = {
  id: string
  type: 'Information'
  heading: string
  text?: string // HTML
}

export type Error = {
  id: string
  type: 'Error'
  heading: string
  text?: string // HTML
}

export type SimpleResult = {
  // Brukes i branches for å vise negative resultatsider etter errors
  id: string
  type: 'Result'
  heading: string
  lead?: string // HTML
}

export type Branch = {
  id: string
  type: 'Branch'
  test: Expression
  children: (Information | Error | SimpleResult)[]
}

export type Intro = {
  id: string
  type: 'Intro'
  heading: string
  lead?: string // HTML
  children?: Text[]
}

export type Result = {
  id: string
  type: 'Result'
  heading: string
  lead?: string // HTML
  show?: Expression
  children?: Text[]
}

export type PageChildren = Text | Radio | Checkbox | Select | Input | NumberInput | Branch

export type Page = {
  id: string
  type: 'Page'
  heading: string
  lead?: string // HTML
  show?: Expression
  children?: PageChildren[]
}

export type Wizard = (Intro | Page | Result)[]
