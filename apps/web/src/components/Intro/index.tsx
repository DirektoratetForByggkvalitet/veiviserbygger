import { StyleProvider, track, WizardDefinition } from 'losen'
import { ReactNode, useEffect, useState } from 'react'
import IntroPage from './IntroPage'

export default function IntroWrapper({
  wizard,
  render,
}: {
  wizard: WizardDefinition
  render: ({ toggleIntro }: { toggleIntro: (showIntro: boolean) => () => void }) => ReactNode
}) {
  const [intro, setIntro] = useState(true)

  useEffect(() => {
    if (intro) {
      return track(wizard.meta.name, 'intro', wizard.meta.title)
    }

    track(wizard.meta.name, 'close-intro')
  }, [intro])

  const toggleIntro = (state: boolean) => () => {
    setIntro(state)
    window.scrollTo(0, 0)
  }

  if (intro) {
    return (
      <StyleProvider>
        <IntroPage close={toggleIntro(false)} wizard={wizard} />
      </StyleProvider>
    )
  }

  return render({ toggleIntro })
}
