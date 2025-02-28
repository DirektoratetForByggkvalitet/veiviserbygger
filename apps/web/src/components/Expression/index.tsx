import {
  Expression as ExpressionType,
  OptionalExcept,
  PageContent,
  Patch,
  SimpleExpression,
} from 'types'
import Dropdown from '@/components/Dropdown'
import Input from '@/components/Input'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { getOrdered, getWithIds } from '@/lib/ordered'
import { useVersion } from '@/hooks/useVersion'
import { unset } from '@/lib/merge'
import { v4 as uuid } from 'uuid'

const bem = BEMHelper(styles)

interface Props {
  expression?: ExpressionType
  nodeId: string
  /**
   * Only used when the expression is a clause in a complex expression
   */
  clauseId?: string
  nodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
  child?: boolean
  first?: boolean
  type?: 'or' | 'and'
}

type Operators = 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'between' | 'is' | 'not' | 'required'

const OPERATORS: { value: Operators; label: string }[] = [
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

const COMPLEX_ACTIONS = [
  {
    value: '0',
    label: 'Slett',
    onClick: () => console.log('Fjern'),
  },
]

const inputTypeMap: {
  [K in PageContent['type']]?: {
    operators: Operators[]
    type: 'single' | 'multi' | 'number' | 'text'
  }
} = {
  Radio: {
    operators: ['gt', 'eq', 'neq', 'is', 'not', 'required'],
    type: 'single',
  },
  Checkbox: {
    operators: ['is', 'not', 'required'],
    type: 'multi',
  },
}

export default function Expression({
  expression,
  nodes,
  child,
  first,
  type,
  nodeId,
  clauseId,
}: Props) {
  const { getNodeRef, patchNode } = useVersion()

  const handleAddClause = () => {
    if (!expression) {
      return
    }

    // new clause in complex expression
    if (clauseId || 'clauses' in expression) {
      return patchNode(nodeId, {
        type: 'Branch',
        test: {
          clauses: {
            [uuid()]: {} as Patch<SimpleExpression>,
          },
        },
      })
    }

    // turn simple expression into complex expression
    patchNode(nodeId, {
      type: 'Branch',
      test: {
        field: unset,
        operator: unset,
        value: unset,
        type: 'and',
        clauses: {
          [uuid()]: expression as SimpleExpression,
          [uuid()]: {} as Patch<SimpleExpression>,
        },
      },
    })
  }

  const handleExpressionChange = (key: string) => (value: any) => {
    const val = key === 'field' ? getNodeRef(value) : value

    if (clauseId) {
      return patchNode(nodeId, {
        test: {
          clauses: {
            [clauseId]: {
              [key]: val,
              ...(key === 'field' ? { operator: unset, value: unset } : {}),
            },
          },
        },
      })
    }

    patchNode(nodeId, {
      test: {
        [key]: val,
        ...(key === 'field' ? { operator: unset, value: unset } : {}),
      },
    })
  }

  const fieldOptions =
    getWithIds(nodes)
      .filter((node) => inputTypeMap[node.type])
      .map((node) => ({
        value: node.id,
        label: node.heading || 'Uten navn',
        type: node.type,
        options: getOrdered(node.options)?.map((o) => ({ label: o.heading, value: o.id })),
      })) || []

  if (expression && 'clauses' in expression) {
    // Expression of type ComplexExpression
    return (
      <div {...bem('', { clauses: true })}>
        <div {...bem('head')}>
          <div {...bem('string')}>
            {!child && !type && 'Hvis'}
            {child && !first && type == 'or' && 'Eller hvis'}
            {child && !first && type == 'and' && 'Og hvis'}
            <Dropdown
              options={TYPES}
              value={expression.type}
              label="Vekting"
              hideLabel
              sentence
              onChange={handleExpressionChange('type')}
            />
          </div>
          <Dropdown icon="Ellipsis" direction="right" options={COMPLEX_ACTIONS} iconOnly />
        </div>
        <ul {...bem('clauses')}>
          {getOrdered(expression.clauses).map((clause, index) => (
            <li key={index} {...bem('clause')}>
              <Expression
                clauseId={clause.id}
                nodeId={nodeId}
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

  const activeField =
    expression?.field && fieldOptions.find((option) => option.value === expression?.field?.id) // TODO: Type

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
            value={expression?.field?.id}
            label="Felt"
            hideLabel
            sentence
            onChange={handleExpressionChange('field')}
          />

          <Dropdown
            options={OPERATORS}
            value={expression?.operator}
            label="Velg betingelse"
            hideLabel
            sentence
            onChange={handleExpressionChange('operator')}
          />

          {activeField?.type === 'Radio' && (
            <Dropdown
              options={activeField.options}
              label="Alternativ"
              value={expression?.value || 'Velg alternativ'}
              hideLabel
              sentence
              onChange={handleExpressionChange('value')}
            />
          )}

          {activeField?.type === 'Input' && (
            <Input
              label="Verdi"
              placeholder="Verdi"
              value={expression?.value as string}
              onChange={handleExpressionChange('value')}
              hideLabel
              sentence
            />
          )}
        </div>

        <Dropdown
          icon="Ellipsis"
          direction="right"
          options={[
            {
              value: '0',
              label: 'Legg til flere vilkår',
              onClick: handleAddClause,
            },
            {
              value: '0',
              label: 'Slett',
              onClick: () => console.log('Fjern'),
            },
          ]}
          iconOnly
        />
      </div>
    </div>
  )
}
