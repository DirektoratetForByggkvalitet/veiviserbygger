import { ReactNode, useState } from 'react'
import { Branch, OptionalExcept, PageContent } from 'types'
import { DocumentReference } from 'firebase/firestore'

import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'
import ValidateDeps from '@/components/ValidateDeps'
import { useModal } from '@/hooks/useModal'
import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import { getTypeIcon, getTypeText } from '@/lib/content'

import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

type Props = {
  id: PageContent['id']
  path: string[]
  /**
   * The node/branch-preset type this section renders content for. Lets the
   * layout (grid areas, spacing, etc.) vary per node type via a BEM modifier.
   */
  type?: PageContent['type'] | Branch['preset']
  children: ReactNode
}

export default function NodeSection({ id, path, type, children }: Props) {
  return (
    <section {...bem('', type ? { [type]: true } : undefined)} id={id} data-path={path.join('.')}>
      {children}
    </section>
  )
}

type HeaderProps = {
  type: PageContent['type'] | Branch['preset']
  node: OptionalExcept<PageContent, 'id' | 'type'>
  title?: string
  /**
   * The document in which the node is referenced, and the path inside
   * the document where this refrence is located.
   */
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
}

NodeSection.Header = function Header({ type, title, node, sourceRef }: HeaderProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { deleteNode } = useVersion()
  const { setModal } = useModal()

  const contentActions: DropdownOptions = [
    {
      value: '0',
      icon: 'ArrowRight',
      label: 'Flytt til annen side',
      onClick: () => setModal({ key: 'move-node', data: { nodeId: node.id } }),
    },
    /* TODO
    {
      value: '0',
      icon: 'Copy',
      label: 'Dupliser',
      onClick: () => console.log('Dupliser direkte og legg under med "[Header] (kopi)"')
    }*/
    {
      value: '0',
      icon: 'Trash',
      label: 'Fjern innhold',
      onClick: () => setShowConfirmDelete(true),
      styled: 'delete',
    },
  ]

  return (
    <header {...bem('header', { negative: type === 'NegativeResult' })}>
      <Icon name={getTypeIcon(type)} size="20" {...bem('header-icon')} />
      <h2 {...bem('title')}>{title || 'Uten tittel'}</h2>
      <Dropdown
        icon="Ellipsis"
        direction="right"
        options={contentActions}
        label="Flytt eller fjern"
        iconOnly
      />

      <Modal
        title="Fjern innhold"
        expanded={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
      >
        <ValidateDeps node={node} sourceRef={sourceRef} title={title || getTypeText(type)}>
          <ButtonBar>
            <Button
              type="button"
              warning
              onClick={async () => {
                await deleteNode(node.id, sourceRef)
                setShowConfirmDelete(false)
              }}
            >
              Slett
            </Button>

            <Button type="button" onClick={() => setShowConfirmDelete(false)}>
              Avbryt
            </Button>
          </ButtonBar>
        </ValidateDeps>
      </Modal>
    </header>
  )
}

NodeSection.Main = function Main({
  children,
  full,
  branch,
}: {
  children: ReactNode
  full?: boolean
  branch?: boolean
}) {
  return <div {...bem('main', { full, branch })}>{children}</div>
}

NodeSection.Sidebar = function Sidebar({ children }: { children: ReactNode }) {
  return <div {...bem('aside')}>{children}</div>
}
