import {
  Expression as ExpressionType,
  OptionalExcept,
  PageContent,
  Patch,
  SimpleExpression,
} from 'types'
import Dropdown from '@/components/Dropdown'
import Input from '@/components/Input'
import { icons } from 'lucide-react'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { getOrdered, getWithIds } from 'shared/utils'
import { useVersion } from '@/hooks/useVersion'
import { unset } from '@/lib/merge'
import { v4 as uuid } from 'uuid'
import Range from '../Range'
import { cloneDeep, get } from 'lodash'

const bem = BEMHelper(styles)

export type ExpressionProps = {
  expression?: ExpressionType
  /**
   * Only used when the expression is a clause in a complex expression
   */
  clauseId?: string
  /**
   * Whether or not the clause is the only clause in a complex expression
   */
  onlyClause?: boolean
  nodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
  child?: boolean
  first?: boolean
  type?: 'or' | 'and'
  property?: string
  nodeId?: string
  pageId?: string
  allowComplex?: boolean
  onChange?: (expression?: ExpressionType) => void
}

type FieldType = {
  value: string
  label: any
  type: PageContent['type']
  options: {
    label: any
    value: string
  }[]
}

type Operators = 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'between' | 'is' | 'not' | 'required'

export const OPERATORS: { value: Operators; icon: keyof typeof icons; label: string }[] = [
  { value: 'gt', icon: 'ChevronLeft', label: 'er større enn' },
  { value: 'lt', icon: 'ChevronRight', label: 'er mindre enn' },
  { value: 'gte', icon: 'ChevronsLeft', label: 'er lik eller større enn' },
  { value: 'lte', icon: 'ChevronsRight', label: 'er lik eller mindre enn' },
  { value: 'eq', icon: 'Equal', label: 'er lik' },
  { value: 'neq', icon: 'EqualNot', label: 'er ikke lik' },
  { value: 'between', icon: 'EqualNot', label: 'er mellom' },
  { value: 'is', icon: 'SquareCheck', label: 'har en verdi' },
  { value: 'not', icon: 'Square', label: 'ikke har en verdi' },
  { value: 'required', icon: 'SquarePen', label: 'er utfylt' },
]

const TYPES = [
  { value: 'and', label: 'alle av følgende' },
  { value: 'or', label: 'en av følgende' },
]

const inputTypeMap: {
  [K in PageContent['type']]?: {
    operators: Operators[]
    type: 'single' | 'multi' | 'number' | 'text'
  }
} = {
  Radio: {
    operators: ['eq', 'neq', 'is', 'not', 'required'],
    type: 'single',
  },
  Checkbox: {
    operators: ['eq', 'neq', 'is', 'not', 'required'],
    type: 'multi',
  },
  Select: {
    operators: ['eq', 'neq', 'is', 'not', 'required'],
    type: 'single',
  },
  Input: {
    operators: ['eq', 'neq', 'required'],
    type: 'text',
  },
  Number: {
    operators: ['gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'between', 'required'],
    type: 'number',
  },
  Sum: {
    operators: ['gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'between', 'required'],
    type: 'number',
  },
}

function getInputOperators(type?: PageContent['type']) {
  if (!type) {
    return []
  }

  return (
    inputTypeMap[type]?.operators.reduce<typeof OPERATORS>((res, operator) => {
      const op = OPERATORS.find((o) => o.value === operator)

      if (!op) {
        return res
      }

      return [...res, op]
    }, []) || []
  )
}

function FieldValue({
  fieldValueType,
  activeField,
  expression,
  handleExpressionChange,
}: {
  activeField?: FieldType
  fieldValueType?: NonNullable<(typeof inputTypeMap)[PageContent['type']]>['type']
  expression?: SimpleExpression
  handleExpressionChange: (key: string) => (value: any) => void
}) {
  if (!activeField || !expression) {
    return null
  }

  if (['not', 'is', 'isnot', 'required'].includes(expression?.operator)) {
    return null
  }

  if (fieldValueType === 'single' || fieldValueType === 'multi') {
    return (
      <Dropdown
        options={activeField.options}
        label="Alternativ"
        value={expression?.value as string}
        placeholder="Velg alternativ"
        hideLabel
        sentence
        onChange={handleExpressionChange('value')}
      />
    )
  }

  if (fieldValueType === 'text') {
    return (
      <Input
        label="Verdi"
        placeholder="Verdi"
        value={expression?.value as string}
        onChange={handleExpressionChange('value')}
        hideLabel
        sentence
      />
    )
  }

  if (fieldValueType === 'number' && expression?.operator === 'between') {
    return (
      <Range
        label="Mellom"
        value={expression?.value as { from?: number; to?: number }}
        onChange={handleExpressionChange('value')}
        hideLabel
      />
    )
  }

  if (fieldValueType === 'number' && expression.operator !== 'between') {
    return (
      <Input
        label="Verdi"
        placeholder="Verdi"
        type="number"
        value={expression?.value as number}
        onChange={handleExpressionChange('value')}
        hideLabel
        sentence
      />
    )
  }

  return null
}

export default function Expression({
  expression,
  nodes,
  child,
  first,
  type,
  nodeId,
  pageId,
  property = 'test',
  clauseId,
  onlyClause,
  allowComplex = true,
  onChange,
}: ExpressionProps) {
  const { patch, getVersionRef, getNodeRef, removeExpressionClause } = useVersion()
  const isControlled = typeof onChange === 'function'

  const patchDocRef = nodeId ? getNodeRef(nodeId) : getVersionRef()
  const path = pageId ? `pages.${pageId}.${property}` : property

  const runLocalChange = (updater: (current?: ExpressionType) => ExpressionType | undefined) => {
    if (!isControlled) {
      return false
    }

    const next = updater(expression)
    onChange?.(next)
    return true
  }

  const handleAddClause = () => {
    if (!expression) {
      return
    }

    if (runLocalChange((current) => current)) {
      return
    }

    // new clause in complex expression
    if (clauseId || 'clauses' in expression) {
      return patch(patchDocRef, path, {
        clauses: {
          [uuid()]: {} as Patch<SimpleExpression>,
        },
      } satisfies Patch<ExpressionType>)
    }

    patch(patchDocRef, path, {
      field: unset,
      operator: unset,
      value: unset,
      type: 'and',
      clauses: {
        [uuid()]: expression as SimpleExpression,
        [uuid()]: {} as Patch<SimpleExpression>,
      },
    } satisfies Patch<ExpressionType>)
  }

  const handleDeleteClause = (id: string) => {
    if (runLocalChange((current) => current)) {
      return
    }

    removeExpressionClause(patchDocRef, path, id)
  }

  const handleExpressionChange = (key: string) => (value: any) => {
    const val = key === 'field' ? getNodeRef(value) : value

    if (
      runLocalChange((current) => {
        if (clauseId) {
          if (!current || !('clauses' in current) || !current.clauses?.[clauseId]) {
            return current
          }

          const next = cloneDeep(current)
          const clause = next.clauses?.[clauseId]

          if (!clause) {
            return current
          }

          if (key === 'field') {
            clause.field = val
            ;(clause as Record<string, any>).operator = undefined
            ;(clause as Record<string, any>).value = undefined
          } else if (key === 'operator') {
            clause.operator = val
          } else if (key === 'value') {
            clause.value = val
          }

          return next
        }

        if (!current || 'clauses' in current) {
          const simple: SimpleExpression = {} as SimpleExpression

          if (key === 'field') {
            simple.field = val
            return simple
          }

          return {
            ...simple,
            [key]: val,
          } as SimpleExpression
        }

        const next = cloneDeep(current) as SimpleExpression

        if (key === 'field') {
          next.field = val
          ;(next as Record<string, any>).operator = undefined
          ;(next as Record<string, any>).value = undefined
          return next
        }

        if (key === 'operator') {
          next.operator = val

          if (val === 'between') {
            next.value = { from: undefined, to: undefined }
          }

          return next
        }

        if (key === 'value') {
          next.value = val
        }
        return next
      })
    ) {
      return
    }

    if (clauseId) {
      return patch(patchDocRef, path, {
        clauses: {
          [clauseId]: {
            [key]: val,
            ...(key === 'field' ? { operator: unset, value: unset } : {}),
          },
        },
      })
    }

    patch(patchDocRef, path, {
      [key]: val,
      ...(key === 'field' ? { operator: unset, value: unset } : {}),
    })
  }

  const fieldOptions =
    getWithIds(nodes)
      .filter((node) => inputTypeMap[node.type])
      .map((node) => ({
        value: node.id,
        label: get(node, 'heading', 'Uten navn'),
        type: node.type,
        options: getOrdered(get(node, 'options'))?.map((o) => ({ label: o.heading, value: o.id })),
      })) || []

  if (expression && 'clauses' in expression) {
    const clauses = getOrdered(expression.clauses)

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
        </div>

        <ul {...bem('clauses')}>
          {clauses.map((clause, index) => (
            <li key={index} {...bem('clause')}>
              <Expression
                clauseId={clause.id}
                nodeId={nodeId}
                pageId={pageId}
                expression={clause}
                nodes={nodes}
                child
                first={index === 0}
                onlyClause={clauses.length <= 1}
                type={expression.type}
                property={property}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const activeField: FieldType | undefined =
    expression?.field && fieldOptions.find((option) => option.value === expression?.field?.id)

  const activeFieldValueType = activeField && inputTypeMap[activeField?.type]?.type

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
            placeholder="Velg felt"
            hideLabel
            sentence
            onChange={handleExpressionChange('field')}
          />

          {activeField ? (
            <Dropdown
              options={getInputOperators(activeField?.type)}
              value={expression?.operator}
              label="Betingelse"
              placeholder="Velg betingelse"
              hideLabel
              sentence
              onChange={handleExpressionChange('operator')}
            />
          ) : null}

          <FieldValue
            activeField={activeField}
            fieldValueType={activeFieldValueType}
            expression={expression}
            handleExpressionChange={handleExpressionChange}
          />
        </div>

        {allowComplex && !isControlled && (
          <Dropdown
            icon="Ellipsis"
            direction="right"
            options={[
              {
                value: '0',
                icon: 'Plus',
                label: 'Legg til flere vilkår',
                onClick: handleAddClause,
              },
              ...(clauseId && !onlyClause
                ? [
                    {
                      value: '0',
                      label: 'Slett',
                      onClick: () => handleDeleteClause(clauseId),
                    },
                  ]
                : []),
            ]}
            iconOnly
          />
        )}
      </div>
    </div>
  )
}
