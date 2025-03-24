import { atom } from 'jotai'

export type ModalKey = 'rename' | 'delete' | 'publish'

export default atom<ModalKey>()
