import { get } from 'lodash'

type ModifierValue = string | boolean | number | null | undefined

export default function BEMHelper(styles: { [style: string]: string } = {}) {
  const block: string = (get(Object.keys(styles), '[0]', '') || '').replace(/__.*/, '')

  return function bem(
    element?: string,
    modifiers?: Array<ModifierValue> | ModifierValue | { [mod: string]: ModifierValue },
    extra?: string,
  ) {
    const elementBase = element ? `${block}__${element}` : block
    const extraArr = !extra ? [] : (Array.isArray(extra) && extra) || [extra]
    const modifiersArray: string[] = []

    if (!modifiers) {
      // ...
    } else if (Array.isArray(modifiers)) {
      modifiersArray.push(...(modifiers.filter(Boolean) as string[]))
    } else if (typeof modifiers === 'object') {
      Object.keys(modifiers).forEach((mod) => {
        if (!modifiers[mod]) {
          return
        }
        modifiersArray.push(mod)
      })
    } else {
      modifiersArray.push(`${modifiers}`)
    }

    // Build classes array
    const classes = [
      ...(styles[elementBase] ? [styles[elementBase]] : []),
      ...(modifiersArray || []).map((mod) => styles[`${elementBase}--${mod}`]),
      ...(extraArr || []),
    ]

    // Build list of classes referred to that doesn't exist in stylesheets
    const classesMissingInStylesheet = [
      ...(!styles[elementBase] ? [elementBase] : []),
      ...(modifiersArray || [])
        .map((mod) => `${elementBase}--${mod}`)
        .filter((selector) => !styles[selector]),
    ]

    // For debugging
    if (classesMissingInStylesheet.length) {
      // console.log('missing classes:', classesMissingInStylesheet)
    }

    return {
      className: classes.length ? classes.join(' ') : undefined,
    }
  }
}
