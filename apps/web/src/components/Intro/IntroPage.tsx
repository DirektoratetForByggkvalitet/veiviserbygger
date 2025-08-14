import { isEqual } from 'lodash'
import { Primitives, WizardDefinition } from 'losen'
import { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { WizardIntro } from 'types'

function IntroPage({
  wizard,
  data,
  close,
}: {
  data: any
  wizard: WizardDefinition & { intro?: WizardIntro }
  close: () => void
}) {
  const hasData = useMemo(() => {
    return !isEqual(data, {}) && !isEqual(data, { $computed: {} })
  }, [data])

  /**
   * Close the intro if there is data in the state to avoid showing the intro
   * to users who have already started the wizard, meaning that they have already
   * seen the intro.
   */
  useEffect(() => {
    hasData && close()
  }, [hasData, close])

  return (
    <Primitives.Wizard>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Primitives.Heading.H1>{wizard.intro?.heading}</Primitives.Heading.H1>
        {wizard.intro?.lead ? (
          <Primitives.Paragraphs.Lead>{wizard.intro?.lead}</Primitives.Paragraphs.Lead>
        ) : null}
        {wizard?.intro?.content.map((content, index) => {
          return (
            <>
              <Primitives.Heading.H2 key={`intro-content-${index}`}>
                {content.heading}
              </Primitives.Heading.H2>
              <Primitives.Block.TextBlock
                dangerouslySetInnerHTML={{ __html: content.text }}
                key={`intro-text-${index}`}
              />
            </>
          )
        })}
        <Primitives.Button.MainButton type="button" onClick={close}>
          Sett i gang
        </Primitives.Button.MainButton>
      </div>
    </Primitives.Wizard>
  )
}

/**
 * Connect the component to the Redux store to access the wizard state. This allows
 * the component to receive the current wizard data from the store and react to changes.
 */
export default connect((state: any) => ({ data: state['@WIZARD_STATE'] }))(IntroPage)
