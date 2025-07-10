import { atom } from 'jotai'

export type ModalKey =
  | 'rename'
  | 'delete'
  | 'delete-draft'
  | 'draft'
  | 'publish'
  | 'versions'
  | 'embed'

export default atom<ModalKey>()
