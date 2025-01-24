import { Expression as ExpressionType, PageContent, WizardVersion } from 'types'
// import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import Input from '@/components/Input'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  expression: ExpressionType
  nodes: WizardVersion['nodes']
  child?: boolean
  first?: boolean
  type?: 'or' | 'and'
}

const OPERATORS = [
  { value: 'gt', label: 'er større enn' },
  { value: 'lt', label: 'er mindre enn' },
  { value: 'gte', label: 'er lik eller større enn' },
  { value: 'lte', label: 'er lik eller mindre enn' },
  { value: 'eq', label: 'er lik' },
  { value: 'neq', label: 'er ikke lik' },
  { value: 'between', label: 'er mellom' },
  { value: 'is', label: 'er valgt' },
  { value: 'not', label: 'er ikke valgt' },
  /* { value: 'isnot', label: '?' }, Hva betyr denne? */
  { value: 'required', label: 'er utfylt' },
]

const TYPES = [
  { value: 'and', label: 'alle av følgende' },
  { value: 'or', label: 'en av følgende' },
]

const SIMPLE_ACTIONS = [
  {
    value: '0',
    label: 'Legg til flere vilkår',
    onClick: () => console.log('Ny undergruppe'),
  },
  {
    value: '0',
    label: 'Slett',
    onClick: () => console.log('Fjern'),
  },
]

const COMPLEX_ACTIONS = [
  {
    value: '0',
    label: 'Slett',
    onClick: () => console.log('Fjern'),
  },
]

export default function Expression({ expression, nodes, child, first, type }: Props) {
  const fieldOptions =
    (Array.isArray(nodes) &&
      nodes
        .filter((node) => node.type === 'Radio')
        .map((node) => ({
          value: node.id,
          label: node.heading || 'Uten navn',
          type: node.type,
          options: node.options?.map((option) => ({ value: option.id, label: option.heading })),
        }))) ||
    []

  if ('clauses' in expression) {
    // Expression of type ComplexExpression
    return (
      <div {...bem('', { clauses: true })}>
        <div {...bem('head')}>
          <div {...bem('string')}>
            {!child && !type && 'Hvis'}
            {child && !first && type == 'or' && 'Eller hvis'}
            {child && !first && type == 'and' && 'Og hvis'}
            <Dropdown options={TYPES} value={expression.type} label="Vekting" hideLabel sentence />
          </div>
          <Dropdown icon="Ellipsis" direction="right" options={COMPLEX_ACTIONS} iconOnly />
        </div>
        <ul {...bem('clauses')}>
          {expression.clauses.map((clause, index) => (
            <li key={index} {...bem('clause')}>
              <Expression
                expression={clause}
                nodes={nodes}
                child
                first={index === 0}
                type={expression.type}
              />
            </li>
          ))}
          <li>{/*<Button size="small">Legg til</Button>*/}</li>
        </ul>
      </div>
    )
  }

  const activeField: any =
    expression.field && fieldOptions.find((option) => option.value === expression.field) // TODO: Type

  // Expression of type SimpleExpression
  return (
    <div {...bem('')}>
      <div {...bem('item')}>
        <div {...bem('string')}>
          {!child && !type && 'Hvis'}
          {child && !first && type == 'or' && 'Eller hvis'}
          {child && !first && type == 'and' && 'Og hvis'}
          <Dropdown
            options={fieldOptions}
            value={expression.field}
            label="Felt"
            hideLabel
            sentence
          />
          <Dropdown
            options={OPERATORS}
            value={expression.operator}
            label="Oppfyller betingelse"
            hideLabel
            sentence
          />
          {activeField?.type === 'Radio' && (
            <Dropdown
              options={activeField.options}
              label="Alternativ"
              value={(expression.value as string) || 'Velg alternativ'}
              hideLabel
              sentence
            />
          )}
          {activeField?.type === 'Input' && (
            <Input
              label="Verdi"
              placeholder="Verdi"
              value={expression.value as string}
              onChange={() => {
                console.log('Input')
              }}
              hideLabel
              sentence
            />
          )}
        </div>
        <Dropdown icon="Ellipsis" direction="right" options={SIMPLE_ACTIONS} iconOnly />
      </div>
    </div>
  )
}
