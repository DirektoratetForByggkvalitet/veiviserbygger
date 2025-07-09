import { isEqual } from 'lodash'
import { WizardDefinition } from 'losen'
import { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'

function IntroPage({
  wizard,
  data,
  close,
}: {
  data: any
  wizard: WizardDefinition
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

  if (!hasData) {
    console.log(wizard)
  }

  return (
    <div>
      Introooo <button onClick={close}>Lukk meg!</button>
    </div>
  )
}

/**
 * Connect the component to the Redux store to access the wizard state. This allows
 * the component to receive the current wizard data from the store and react to changes.
 */
export default connect((state: any) => ({ data: state['@WIZARD_STATE'] }))(IntroPage)
