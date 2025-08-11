import { useAtom } from 'jotai'
import modalState, { ModalState } from '@/store/modal'

export function useModal() {
  const [modal, setModal] = useAtom(modalState)

  return {
    setModal: (modal?: ModalState) => {
      if (!modal) {
        setModal({ key: null })
        return
      }

      setModal(modal)
    },
    modal,
  }
}
