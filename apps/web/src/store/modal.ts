import { atom } from 'jotai'

export type ModalKey = 'rename' | 'delete'

export default atom<ModalKey>()
