import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Button from '@/components/Button'
import Expression from '@/components/Expression'
import Modal from '@/components/Modal'
import { useEditable } from '@/hooks/useEditable'
import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import type {
  Expression as ExpressionType,
  OptionalExcept,
  PageContent,
  SimpleExpression,
  TableCell as TableCellType,
  TableCells,
  TableCellsRecord,
  TableCellsValue,
} from 'types'

import Dropdown from '@/components/Dropdown'
import styles from './Styles.module.scss'

type StoredTableCells = TableCellsValue | undefined

type Props = {
  nodeId: string
  pageId?: string
  cells?: StoredTableCells
  nodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
}

type CellCoords = { row: number; column: number }

type GridCell = {
  id: string
  type: TableCellType['type']
  text: string
  test?: SimpleExpression
  colSpan: number
  rowSpan: number
}

type CellSlot = {
  cell: GridCell
  isMaster: boolean
  masterRow: number
  masterColumn: number
}

type CellGrid = Array<Array<CellSlot | undefined>>

const bem = BEMHelper(styles)
const EMPTY_PARAGRAPH = '<p></p>'

const DEFAULT_TABLE: TableCells = [
  [
    { type: 'Heading', text: '<p>Overskrift</p>' },
    { type: 'Heading', text: '<p>Overskrift</p>' },
  ],
  [
    { type: 'Cell', text: '<p>Innhold</p>' },
    { type: 'Cell', text: '<p>Innhold</p>' },
  ],
]

export default function TableEditor({ nodeId, pageId, cells, nodes }: Props) {
  const isEditable = useEditable()
  const { overwriteNodeField } = useVersion()
  const [grid, setGrid] = useState<CellGrid>(() => ensureMinimumGrid(tableCellsToGrid(cells)))
  const [selected, setSelected] = useState<CellCoords | null>(null)
  const [expressionTarget, setExpressionTarget] = useState<CellCoords | null>(null)
  const persistTimer = useRef<ReturnType<typeof setTimeout>>()
  const gridRef = useRef<CellGrid>(grid)

  useEffect(() => {
    gridRef.current = grid
  }, [grid])

  useEffect(() => {
    return () => {
      if (persistTimer.current) {
        clearTimeout(persistTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!cells) {
      return
    }
    const normalized = normalizeCells(cells)
    const incomingGrid = ensureMinimumGrid(tableCellsToGrid(normalized))
    const currentCells = gridToTableCells(gridRef.current)
    if (!areCellsEqual(normalized, currentCells)) {
      setGrid(incomingGrid)
    }
  }, [cells])

  const queuePersist = useCallback(
    (nextGrid: CellGrid) => {
      if (!isEditable) {
        return
      }
      if (persistTimer.current) {
        clearTimeout(persistTimer.current)
      }
      persistTimer.current = setTimeout(() => {
        const serialized = serializeTableCells(gridToTableCells(nextGrid))
        overwriteNodeField(nodeId, 'cells', serialized)
      }, 500)
    },
    [isEditable, nodeId, overwriteNodeField],
  )

  const applyGridChange = useCallback(
    (updater: (grid: CellGrid) => CellGrid) => {
      setGrid((prev) => {
        const next = ensureMinimumGrid(updater(prev))
        queuePersist(next)
        return next
      })
    },
    [queuePersist],
  )

  const selectedSlot = selected ? grid[selected.row]?.[selected.column] : null
  const selectedCell = selectedSlot?.cell ?? null
  const columnCount = useMemo(() => getColumnCount(grid), [grid])

  const currentExpression = useMemo(() => {
    if (!expressionTarget) {
      return undefined
    }
    return grid[expressionTarget.row]?.[expressionTarget.column]?.cell.test
  }, [expressionTarget, grid])

  const handleCellSelection = useCallback((coords: CellCoords) => {
    setSelected(coords)
  }, [])

  const handleCellContentChange = useCallback(
    (coords: CellCoords, value: string) => {
      const nextValue = value && value.trim() ? value : EMPTY_PARAGRAPH
      applyGridChange((prev) => updateCellText(prev, coords, nextValue))
    },
    [applyGridChange],
  )

  const handleExpressionChange = useCallback(
    (value?: ExpressionType) => {
      if (!expressionTarget) {
        return
      }
      const nextValue =
        value && 'clauses' in value ? undefined : (value as SimpleExpression | undefined)
      applyGridChange((prev) => updateCellTest(prev, expressionTarget, nextValue))
    },
    [applyGridChange, expressionTarget],
  )

  const handleAddRow = useCallback(
    (placement: 'before' | 'after') => {
      if (!isEditable) {
        return
      }
      applyGridChange((prev) => {
        const slot = selected ? prev[selected.row]?.[selected.column] : undefined
        const span = slot?.cell.rowSpan ?? 1
        if (!selected) {
          const index = placement === 'before' ? 0 : prev.length
          return insertRow(prev, index)
        }
        const index = placement === 'before' ? selected.row : selected.row + span
        return insertRow(prev, index)
      })
    },
    [applyGridChange, isEditable, selected],
  )

  const handleDeleteRow = useCallback(() => {
    if (!isEditable || grid.length <= 1) {
      return
    }
    applyGridChange((prev) => {
      const index = selected ? selected.row : prev.length - 1
      return removeRow(prev, index)
    })
  }, [applyGridChange, grid.length, isEditable, selected])

  const handleAddColumn = useCallback(
    (placement: 'left' | 'right') => {
      if (!isEditable) {
        return
      }
      applyGridChange((prev) => {
        const totalColumns = getColumnCount(prev)
        if (!selected) {
          const index = placement === 'left' ? 0 : totalColumns
          return insertColumn(prev, index)
        }
        const slot = prev[selected.row]?.[selected.column]
        const span = slot?.cell.colSpan ?? 1
        const index = placement === 'left' ? selected.column : selected.column + span
        return insertColumn(prev, index)
      })
    },
    [applyGridChange, isEditable, selected],
  )

  const handleDeleteColumn = useCallback(() => {
    if (!isEditable || columnCount <= 1) {
      return
    }
    applyGridChange((prev) => {
      const totalColumns = getColumnCount(prev)
      const index = selected ? selected.column : totalColumns - 1
      return removeColumn(prev, index)
    })
  }, [applyGridChange, columnCount, isEditable, selected])

  const handleToggleHeader = useCallback(() => {
    if (!isEditable || !selectedCell || !selected) {
      return
    }
    const nextType = selectedCell.type === 'Heading' ? 'Cell' : 'Heading'
    applyGridChange((prev) => updateCellType(prev, selected, nextType))
  }, [applyGridChange, isEditable, selected, selectedCell])

  const handleMergeRight = useCallback(() => {
    if (!isEditable || !selected) {
      return
    }
    applyGridChange((prev) => mergeRight(prev, selected))
  }, [applyGridChange, isEditable, selected])

  const handleMergeDown = useCallback(() => {
    if (!isEditable || !selected) {
      return
    }
    applyGridChange((prev) => mergeDown(prev, selected))
  }, [applyGridChange, isEditable, selected])

  const handleClearExpression = useCallback(() => {
    if (!expressionTarget) {
      return
    }
    handleExpressionChange(undefined)
  }, [expressionTarget, handleExpressionChange])

  const canMergeRight = useMemo(() => {
    if (!selected || !selectedCell) {
      return false
    }
    const targetColumn = selected.column + selectedCell.colSpan
    const neighbor = grid[selected.row]?.[targetColumn]
    return Boolean(
      neighbor && neighbor.isMaster && neighbor.cell.rowSpan === selectedCell.rowSpan && isEditable,
    )
  }, [grid, isEditable, selected, selectedCell])

  const canMergeDown = useMemo(() => {
    if (!selected || !selectedCell) {
      return false
    }
    const targetRow = selected.row + selectedCell.rowSpan
    const neighbor = grid[targetRow]?.[selected.column]
    return Boolean(
      neighbor && neighbor.isMaster && neighbor.cell.colSpan === selectedCell.colSpan && isEditable,
    )
  }, [grid, isEditable, selected, selectedCell])

  return (
    <section {...bem('')}>
      <div {...bem('table-wrapper')}>
        <table {...bem('table')}>
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((slot, columnIndex) => {
                  if (!slot || !slot.isMaster) {
                    return null
                  }
                  const Tag = slot.cell.type === 'Heading' ? 'th' : 'td'
                  const isSelected = selected?.row === rowIndex && selected?.column === columnIndex
                  return (
                    <Tag
                      key={slot.cell.id}
                      rowSpan={slot.cell.rowSpan > 1 ? slot.cell.rowSpan : undefined}
                      colSpan={slot.cell.colSpan > 1 ? slot.cell.colSpan : undefined}
                      {...bem('cell', {
                        selected: isSelected,
                        heading: slot.cell.type === 'Heading',
                      })}
                      onClick={() => handleCellSelection({ row: rowIndex, column: columnIndex })}
                    >
                      {isEditable && (
                        <div {...bem('cell-actions')}>
                          <Dropdown
                            options={[
                              { group: 'Celle' },
                              {
                                label: currentExpression
                                  ? 'Endre vilkår for celle'
                                  : 'Vilkår for celle',
                                value: 'rules',
                                icon: 'FlaskRound',
                                onClick: () => {
                                  setSelected({ row: rowIndex, column: columnIndex })
                                  setExpressionTarget({ row: rowIndex, column: columnIndex })
                                },
                              },
                              {
                                label:
                                  selectedCell?.type === 'Heading'
                                    ? 'Gjør til vanlig innhold'
                                    : 'Gjør til overskrift',
                                value: 'toggle-type',
                                icon: selectedCell?.type === 'Heading' ? 'Type' : 'Heading',
                                onClick: handleToggleHeader,
                              },
                              {
                                label: 'Slå sammen (høyre)',
                                value: 'merge-right',
                                onClick: handleMergeRight,
                                disabled: !canMergeRight,
                                icon: 'PanelRightClose',
                              },
                              {
                                label: 'Slå sammen (under)',
                                value: 'merge-down',
                                onClick: handleMergeDown,
                                disabled: !canMergeDown,
                                icon: 'PanelBottomClose',
                              },
                              { group: 'Rad', icon: 'Rows3' },
                              {
                                label: 'Rad over',
                                value: 'row-before',
                                icon: 'PanelTop',
                                onClick: () => handleAddRow('before'),
                              },
                              {
                                label: 'Rad under',
                                value: 'row-after',
                                icon: 'PanelBottom',
                                onClick: () => handleAddRow('after'),
                              },
                              {
                                label: 'Slett rad',
                                value: 'row-delete',
                                icon: 'Trash2',
                                onClick: handleDeleteRow,
                              },
                              { group: 'Kolonne', icon: 'Columns3' },
                              {
                                label: 'Kolonne til venstre',
                                value: 'column-left',
                                icon: 'PanelLeft',
                                onClick: () => handleAddColumn('left'),
                              },
                              {
                                label: 'Kolonne til høyre',
                                value: 'column-right',
                                icon: 'PanelRight',
                                onClick: () => handleAddColumn('right'),
                              },
                              {
                                label: 'Slett kolonne',
                                value: 'column-delete',
                                icon: 'Trash2',
                                onClick: handleDeleteColumn,
                              },
                            ]}
                            icon="EllipsisVertical"
                            direction="right"
                            iconOnly
                          />
                        </div>
                      )}

                      <CellContent
                        value={slot.cell.text}
                        editable={isEditable}
                        onChange={(value) =>
                          handleCellContentChange({ row: rowIndex, column: columnIndex }, value)
                        }
                      />
                    </Tag>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        title="Rediger vilkår for celle"
        expanded={Boolean(expressionTarget)}
        onClose={() => setExpressionTarget(null)}
        preventClickOutside
      >
        {expressionTarget && (
          <div {...bem('modal')}>
            <div {...bem('modal-header')}>
              <strong>
                Celle ({expressionTarget.row + 1} , {expressionTarget.column + 1})
              </strong>
              {currentExpression && (
                <Button size="small" subtle onClick={handleClearExpression}>
                  Fjern vilkår
                </Button>
              )}
            </div>
            <Expression
              expression={currentExpression}
              nodes={nodes}
              nodeId={nodeId}
              pageId={pageId}
              allowComplex={false}
              onChange={handleExpressionChange}
            />
          </div>
        )}
      </Modal>
    </section>
  )
}

function CellContent({
  value,
  editable,
  onChange,
}: {
  value: string
  editable: boolean
  onChange: (value: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editable) {
      return
    }
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
  }, [editable, value])

  if (!editable) {
    return <div {...bem('cell-content')} dangerouslySetInnerHTML={{ __html: value }} />
  }

  return (
    <div
      ref={ref}
      {...bem('cell-content', { editable: true })}
      contentEditable
      suppressContentEditableWarning
      onInput={(event) => onChange(event.currentTarget.innerHTML || EMPTY_PARAGRAPH)}
    />
  )
}

function normalizeCells(cells?: StoredTableCells): TableCells {
  if (!cells) {
    return DEFAULT_TABLE
  }

  const sourceRows = Array.isArray(cells)
    ? cells
    : Object.keys(cells)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => cells[key] ?? [])

  if (!sourceRows.length) {
    return DEFAULT_TABLE
  }

  const normalized = sourceRows.map((row) =>
    row.map((cell) => ({
      type: cell.type,
      text: cell.text || EMPTY_PARAGRAPH,
      colSpan: cell.colSpan,
      rowSpan: cell.rowSpan,
      test: cell.test,
    })),
  )

  return normalized.length ? normalized : DEFAULT_TABLE
}

function generateCellId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `cell-${Math.random().toString(36).slice(2)}`
}

function createDefaultGridCell(type: TableCellType['type'] = 'Cell'): GridCell {
  return {
    id: generateCellId(),
    type,
    text: EMPTY_PARAGRAPH,
    colSpan: 1,
    rowSpan: 1,
  }
}

function tableCellsToGrid(cells?: StoredTableCells): CellGrid {
  const normalized = normalizeCells(cells)
  const grid: CellGrid = []

  normalized.forEach((row, rowIndex) => {
    if (!grid[rowIndex]) {
      grid[rowIndex] = []
    }
    let columnIndex = 0
    row.forEach((cell) => {
      while (grid[rowIndex][columnIndex]) {
        columnIndex += 1
      }
      const gridCell: GridCell = {
        id: generateCellId(),
        type: cell.type,
        text: cell.text || EMPTY_PARAGRAPH,
        test: cell.test,
        colSpan: cell.colSpan ?? 1,
        rowSpan: cell.rowSpan ?? 1,
      }
      for (let rowOffset = 0; rowOffset < gridCell.rowSpan; rowOffset += 1) {
        const targetRow = rowIndex + rowOffset
        grid[targetRow] = grid[targetRow] ?? []
        for (let colOffset = 0; colOffset < gridCell.colSpan; colOffset += 1) {
          const targetColumn = columnIndex + colOffset
          grid[targetRow][targetColumn] = {
            cell: gridCell,
            isMaster: rowOffset === 0 && colOffset === 0,
            masterRow: rowIndex,
            masterColumn: columnIndex,
          }
        }
      }
      columnIndex += gridCell.colSpan
    })
  })

  return grid
}

function gridToTableCells(grid: CellGrid): TableCells {
  return grid.map((row) => {
    const result: TableCellType[] = []
    let columnIndex = 0
    while (columnIndex < row.length) {
      const slot = row[columnIndex]
      if (slot && slot.isMaster) {
        result.push({
          type: slot.cell.type,
          text: slot.cell.text,
          test: slot.cell.test,
          colSpan: slot.cell.colSpan > 1 ? slot.cell.colSpan : undefined,
          rowSpan: slot.cell.rowSpan > 1 ? slot.cell.rowSpan : undefined,
        })
        columnIndex += slot.cell.colSpan
      } else {
        columnIndex += 1
      }
    }
    return result
  })
}

function serializeTableCells(cells: TableCells): TableCellsRecord {
  return cells.reduce<TableCellsRecord>((acc, row, index) => {
    acc[String(index)] = row.map((cell) => sanitizeCell(cell))
    return acc
  }, {})
}

function sanitizeCell(cell: TableCellType): TableCellType {
  const sanitized: TableCellType = {
    type: cell.type,
    text: cell.text || EMPTY_PARAGRAPH,
  }

  if (cell.test) {
    sanitized.test = cell.test
  }

  if (cell.colSpan && cell.colSpan > 1) {
    sanitized.colSpan = cell.colSpan
  }

  if (cell.rowSpan && cell.rowSpan > 1) {
    sanitized.rowSpan = cell.rowSpan
  }

  return sanitized
}

function cloneGrid(grid: CellGrid) {
  const cellMap = new Map<GridCell, GridCell>()
  const cloned: CellGrid = grid.map((row) =>
    row.map((slot) => {
      if (!slot) {
        return undefined
      }
      let clonedCell = cellMap.get(slot.cell)
      if (!clonedCell) {
        clonedCell = { ...slot.cell }
        cellMap.set(slot.cell, clonedCell)
      }
      return {
        cell: clonedCell,
        isMaster: slot.isMaster,
        masterRow: slot.masterRow,
        masterColumn: slot.masterColumn,
      }
    }),
  )

  return { grid: cloned, cellMap }
}

function refreshMasterMetadata(grid: CellGrid) {
  const masterMap = new Map<GridCell, { row: number; column: number }>()
  grid.forEach((row, rowIndex) => {
    row.forEach((slot, columnIndex) => {
      if (slot?.isMaster) {
        masterMap.set(slot.cell, { row: rowIndex, column: columnIndex })
      }
    })
  })

  grid.forEach((row, rowIndex) => {
    row.forEach((slot, columnIndex) => {
      if (!slot) {
        return
      }
      const master = masterMap.get(slot.cell)
      if (master) {
        slot.masterRow = master.row
        slot.masterColumn = master.column
        slot.isMaster = master.row === rowIndex && master.column === columnIndex
      }
    })
  })
}

function ensureMinimumGrid(grid: CellGrid): CellGrid {
  if (!grid.length || !grid[0]?.length) {
    return tableCellsToGrid(DEFAULT_TABLE)
  }
  return grid
}

function getColumnCount(grid: CellGrid) {
  return grid.reduce((max, row) => Math.max(max, row.length), 0)
}

function insertRow(grid: CellGrid, index: number) {
  const normalizedIndex = Math.max(0, Math.min(index, grid.length))
  const { grid: next, cellMap } = cloneGrid(grid)
  const columnCount = getColumnCount(next)
  const newRow: Array<CellSlot | undefined> = Array(columnCount).fill(undefined)
  const extendedCells = new Set<GridCell>()

  for (let column = 0; column < columnCount; column += 1) {
    const slot = grid[normalizedIndex]?.[column]
    if (slot && slot.masterRow < normalizedIndex) {
      const targetCell = cellMap.get(slot.cell)
      if (!targetCell) {
        continue
      }
      if (!extendedCells.has(targetCell)) {
        targetCell.rowSpan += 1
        extendedCells.add(targetCell)
      }
      newRow[column] = {
        cell: targetCell,
        isMaster: false,
        masterRow: slot.masterRow,
        masterColumn: slot.masterColumn,
      }
    } else {
      if (!newRow[column]) {
        const cell = createDefaultGridCell()
        assignCellToRow(newRow, column, cell, normalizedIndex, true)
        column += cell.colSpan - 1
      }
    }
  }

  next.splice(normalizedIndex, 0, newRow)
  refreshMasterMetadata(next)
  return next
}

function removeRow(grid: CellGrid, index: number) {
  if (grid.length <= 1 || index < 0 || index >= grid.length) {
    return grid
  }
  const { grid: next } = cloneGrid(grid)
  const referenceRow = grid[index]
  const adjustedCells = new Set<GridCell>()

  referenceRow.forEach((slot, columnIndex) => {
    if (!slot) {
      return
    }
    const targetSlot = next[index]?.[columnIndex]
    const targetCell = targetSlot?.cell
    if (!targetCell) {
      return
    }

    if (slot.masterRow < index) {
      if (!adjustedCells.has(targetCell)) {
        targetCell.rowSpan = Math.max(1, targetCell.rowSpan - 1)
        adjustedCells.add(targetCell)
      }
    } else if (slot.isMaster) {
      if (targetCell.rowSpan > 1) {
        targetCell.rowSpan -= 1
        const followingRow = next[index + 1]
        if (followingRow) {
          let promoted = false
          for (let offset = 0; offset < targetCell.colSpan; offset += 1) {
            const candidate = followingRow[columnIndex + offset]
            if (candidate && candidate.cell === targetCell) {
              candidate.masterColumn = columnIndex
              if (!promoted) {
                candidate.isMaster = true
                promoted = true
              } else {
                candidate.isMaster = false
              }
            }
          }
        }
      }
    } else if (!adjustedCells.has(targetCell)) {
      targetCell.rowSpan = Math.max(1, targetCell.rowSpan - 1)
      adjustedCells.add(targetCell)
    }
  })

  next.splice(index, 1)
  refreshMasterMetadata(next)
  return next
}

function insertColumn(grid: CellGrid, index: number) {
  const normalizedIndex = Math.max(0, index)
  const { grid: next, cellMap } = cloneGrid(grid)
  const extendedCells = new Set<GridCell>()

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
    const referenceRow = grid[rowIndex] ?? []
    const slot = referenceRow[normalizedIndex]
    const nextRow = next[rowIndex] ?? []
    if (slot && slot.masterColumn < normalizedIndex) {
      const targetCell = cellMap.get(slot.cell)
      if (!targetCell) {
        continue
      }
      if (!extendedCells.has(targetCell)) {
        targetCell.colSpan += 1
        extendedCells.add(targetCell)
      }
      nextRow.splice(normalizedIndex, 0, {
        cell: targetCell,
        isMaster: false,
        masterRow: slot.masterRow,
        masterColumn: slot.masterColumn,
      })
    } else {
      const cell = createDefaultGridCell()
      nextRow.splice(normalizedIndex, 0, undefined)
      assignCellToRow(nextRow, normalizedIndex, cell, rowIndex, true)
    }
    next[rowIndex] = nextRow
  }

  refreshMasterMetadata(next)
  return next
}

function removeColumn(grid: CellGrid, index: number) {
  if (getColumnCount(grid) <= 1) {
    return grid
  }
  const { grid: next } = cloneGrid(grid)
  const adjustedCells = new Set<GridCell>()

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
    const referenceRow = grid[rowIndex] ?? []
    const slot = referenceRow[index]
    const targetRow = next[rowIndex] ?? []
    if (!targetRow.length) {
      continue
    }

    if (!slot) {
      targetRow.splice(index, 1)
      continue
    }

    const targetSlot = targetRow[index]
    const targetCell = targetSlot?.cell
    if (!targetCell) {
      targetRow.splice(index, 1)
      continue
    }

    if (slot.masterColumn < index) {
      if (!adjustedCells.has(targetCell)) {
        targetCell.colSpan = Math.max(1, targetCell.colSpan - 1)
        adjustedCells.add(targetCell)
      }
      targetRow.splice(index, 1)
    } else if (slot.isMaster) {
      if (targetCell.colSpan > 1) {
        targetCell.colSpan -= 1
        let promoted = false
        for (let offset = 1; offset <= targetCell.colSpan; offset += 1) {
          const neighbor = targetRow[index + offset]
          if (neighbor && neighbor.cell === targetCell) {
            neighbor.masterRow = rowIndex
            neighbor.masterColumn = index
            if (!promoted) {
              neighbor.isMaster = true
              promoted = true
            } else {
              neighbor.isMaster = false
            }
          }
        }
        targetRow.splice(index, 1)
      } else {
        targetRow.splice(index, 1)
      }
    } else {
      if (!adjustedCells.has(targetCell)) {
        targetCell.colSpan = Math.max(1, targetCell.colSpan - 1)
        adjustedCells.add(targetCell)
      }
      targetRow.splice(index, 1)
    }
  }

  refreshMasterMetadata(next)
  return next
}

function updateCellText(grid: CellGrid, coords: CellCoords, value: string) {
  const { grid: next } = cloneGrid(grid)
  const slot = next[coords.row]?.[coords.column]
  if (!slot) {
    return grid
  }
  slot.cell.text = value
  return next
}

function updateCellType(grid: CellGrid, coords: CellCoords, type: TableCellType['type']) {
  const { grid: next } = cloneGrid(grid)
  const slot = next[coords.row]?.[coords.column]
  if (!slot) {
    return grid
  }
  slot.cell.type = type
  return next
}

function updateCellTest(grid: CellGrid, coords: CellCoords, test?: SimpleExpression) {
  const { grid: next } = cloneGrid(grid)
  const slot = next[coords.row]?.[coords.column]
  if (!slot) {
    return grid
  }
  slot.cell.test = test
  return next
}

function mergeRight(grid: CellGrid, coords: CellCoords) {
  const { grid: next } = cloneGrid(grid)
  const slot = next[coords.row]?.[coords.column]
  if (!slot || !slot.isMaster) {
    return grid
  }
  const cell = slot.cell
  const targetColumn = coords.column + cell.colSpan
  const neighbor = next[coords.row]?.[targetColumn]
  if (!neighbor || !neighbor.isMaster || neighbor.cell.rowSpan !== cell.rowSpan) {
    return grid
  }
  const neighborCell = neighbor.cell
  cell.colSpan += neighborCell.colSpan
  cell.text = mergeHtml(cell.text, neighborCell.text)

  for (let rowOffset = 0; rowOffset < cell.rowSpan; rowOffset += 1) {
    const rowIndex = coords.row + rowOffset
    for (let colOffset = 0; colOffset < neighborCell.colSpan; colOffset += 1) {
      const columnIndex = targetColumn + colOffset
      const targetSlot = next[rowIndex]?.[columnIndex]
      if (targetSlot && targetSlot.cell === neighborCell) {
        next[rowIndex][columnIndex] = {
          cell,
          isMaster: false,
          masterRow: coords.row,
          masterColumn: coords.column,
        }
      }
    }
  }

  refreshMasterMetadata(next)
  return next
}

function mergeDown(grid: CellGrid, coords: CellCoords) {
  const { grid: next } = cloneGrid(grid)
  const slot = next[coords.row]?.[coords.column]
  if (!slot || !slot.isMaster) {
    return grid
  }
  const cell = slot.cell
  const targetRow = coords.row + cell.rowSpan
  const neighbor = next[targetRow]?.[coords.column]
  if (!neighbor || !neighbor.isMaster || neighbor.cell.colSpan !== cell.colSpan) {
    return grid
  }
  const neighborCell = neighbor.cell
  cell.rowSpan += neighborCell.rowSpan
  cell.text = mergeHtml(cell.text, neighborCell.text)

  for (let rowOffset = 0; rowOffset < neighborCell.rowSpan; rowOffset += 1) {
    const rowIndex = targetRow + rowOffset
    for (let colOffset = 0; colOffset < cell.colSpan; colOffset += 1) {
      const columnIndex = coords.column + colOffset
      const targetSlot = next[rowIndex]?.[columnIndex]
      if (targetSlot && targetSlot.cell === neighborCell) {
        next[rowIndex][columnIndex] = {
          cell,
          isMaster: false,
          masterRow: coords.row,
          masterColumn: coords.column,
        }
      }
    }
  }

  refreshMasterMetadata(next)
  return next
}

function assignCellToRow(
  row: Array<CellSlot | undefined>,
  startColumn: number,
  cell: GridCell,
  masterRow: number,
  makeMaster: boolean,
) {
  for (let offset = 0; offset < cell.colSpan; offset += 1) {
    const columnIndex = startColumn + offset
    row[columnIndex] = {
      cell,
      isMaster: makeMaster && offset === 0,
      masterRow,
      masterColumn: startColumn,
    }
  }
}

function mergeHtml(primary: string, secondary: string) {
  if (!secondary || secondary === EMPTY_PARAGRAPH) {
    return primary
  }
  if (!primary || primary === EMPTY_PARAGRAPH) {
    return secondary
  }
  return `${primary}<p><br /></p>${secondary}`
}

function areCellsEqual(a: TableCells, b: TableCells) {
  if (a.length !== b.length) {
    return false
  }

  return a.every((row, rowIndex) => {
    if (row.length !== b[rowIndex]?.length) {
      return false
    }

    return row.every((cell, columnIndex) => {
      const other = b[rowIndex]?.[columnIndex]
      return (
        other?.text === cell.text &&
        other?.type === cell.type &&
        other?.colSpan === cell.colSpan &&
        other?.rowSpan === cell.rowSpan &&
        JSON.stringify(other?.test) === JSON.stringify(cell.test)
      )
    })
  })
}
