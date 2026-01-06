import { atom } from 'jotai'

export type ModalState =
  | { key: null }
  | { key: 'rename' }
  | { key: 'delete' }
  | { key: 'delete-draft' }
  | { key: 'draft' }
  | { key: 'publish' }
  | { key: 'versions' }
  | { key: 'duplicate' }
  | { key: 'make-template' }
  | { key: 'embed' }
  | { key: 'move-node'; data: { nodeId: string } }

export default atom<ModalState>()
