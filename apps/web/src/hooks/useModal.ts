import { useAtom } from 'jotai'
import modalState, { ModalKey } from '@/store/modal'

export function useModal() {
  const [modal, setModal] = useAtom(modalState)

  return {
    setModal: (modal?: ModalKey) => setModal(modal),
    modal,
  }
}
