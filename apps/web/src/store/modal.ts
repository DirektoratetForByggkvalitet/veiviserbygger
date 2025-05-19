import { atom } from 'jotai'

export type ModalKey = 'rename' | 'delete' | 'delete-draft' | 'draft' | 'publish'

export default atom<ModalKey>()
