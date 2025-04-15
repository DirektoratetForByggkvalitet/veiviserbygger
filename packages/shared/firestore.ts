import { OptionalExcept, PageContent, Wizard, WizardVersion } from 'types'

/**
 * A generic type for references to Firestore data points. Can be either a doc or a collection.
 * The `path` property is an array of strings or numbers that represents the path to the data point,
 * and the `converter` property is a function that converts the data point to and from Firestore format.
 */
export type DataPoint<T> = {
  path: string[] & { toString: () => string }
  converter: ReturnType<typeof converter<T>>
}

function path(...args: string[]) {
  const path = [...args]
  path.toString = () => path.join('/')
  return path
}

export function converter<T>() {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snap: { data: () => any }) => snap.data() as T,
  }
}

export function wizardsRef(): DataPoint<Wizard> {
  return {
    path: path('wizards'),
    converter: converter<Wizard>(),
  }
}

export function wizardRef(wizardId: string): DataPoint<Wizard> {
  return {
    path: path('wizards', wizardId),
    converter: converter<Wizard>(),
  }
}

const a = [1, 2, 3].toString()

export function wizardVersionsRef(wizardId: string): DataPoint<WizardVersion> {
  return {
    path: path('wizards', wizardId, 'versions'),
    converter: converter<WizardVersion>(),
  }
}

export function wizardVersionRef(wizardId: string, versionId: string): DataPoint<WizardVersion> {
  return {
    path: path('wizards', wizardId, 'versions', versionId),
    converter: converter<WizardVersion>(),
  }
}

export function nodesRef(
  wizardId: string,
  versionId: string,
): DataPoint<OptionalExcept<PageContent, 'type'>> {
  return {
    path: path('wizards', wizardId, 'versions', versionId, 'nodes'),
    converter: converter<OptionalExcept<PageContent, 'type'>>(),
  }
}

export function nodeRef(
  wizardId: string,
  versionId: string,
  nodeId: string,
): DataPoint<OptionalExcept<PageContent, 'type'>> {
  return {
    path: path('wizards', wizardId, 'versions', versionId, 'nodes', nodeId),
    converter: converter<OptionalExcept<PageContent, 'type'>>(),
  }
}
