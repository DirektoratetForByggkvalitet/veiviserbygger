import { isEqual } from 'lodash'
import { Primitives, WizardDefinition } from 'losen'
import { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { WizardIntro } from 'types'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)
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
      <div {...bem('')}>
        <Primitives.Grid.Main>
          <Primitives.Heading.H1>
            <span {...bem('sub-title')}>Veiviser </span>
            {wizard.intro?.heading}
          </Primitives.Heading.H1>
          {wizard.intro?.lead ? (
            <Primitives.Paragraphs.Lead>{wizard.intro?.lead}</Primitives.Paragraphs.Lead>
          ) : null}
          {wizard?.intro?.content.map((content, index) => {
            return (
              <>
                {content.heading && (
                  <Primitives.Heading.H2 key={`intro-content-${index}`}>
                    {content.heading}
                  </Primitives.Heading.H2>
                )}
                <Primitives.Block.TextBlock
                  style={{ flexDirection: 'column' }}
                  dangerouslySetInnerHTML={{ __html: content.text }}
                  key={`intro-text-${index}`}
                />
              </>
            )
          })}
          <div style={{ marginTop: '24px' }}>
            <Primitives.Button.MainButton type="button" onClick={close}>
              Sett i gang
            </Primitives.Button.MainButton>
          </div>
        </Primitives.Grid.Main>
      </div>
    </Primitives.Wizard>
  )
}

/**
 * Connect the component to the Redux store to access the wizard state. This allows
 * the component to receive the current wizard data from the store and react to changes.
 */
export default connect((state: any) => ({ data: state['@WIZARD_STATE'] }))(IntroPage)
