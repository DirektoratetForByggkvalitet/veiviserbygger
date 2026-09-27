import { DocumentReference } from 'firebase/firestore'
import { Intro, OptionalExcept, PageContent, WizardPage } from 'types'

export type Props = {
  /**
   * Unique id for a page content node on this page. This is NOT the id of
   * the node, but the id of the reference to the node on this page.
   */
  id: PageContent['id']
  nodeId: DocumentReference['id']
  allNodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
  page: WizardPage | Intro
  path: string[]
}

export type SourceRef = {
  doc: DocumentReference
  path: string[]
}

export type NodeProps = {
  allNodes: Props['allNodes']
  node: OptionalExcept<PageContent, 'id' | 'type'>
  page: WizardPage | Intro
  sourceRef: SourceRef
}

export type FieldProps = NodeProps & {
  id: Props['id']
  path: Props['path']
}

export function inRef(sourceRef: SourceRef, ...path: string[]): SourceRef {
  return {
    doc: sourceRef.doc,
    path: [...sourceRef.path, ...path],
  }
}
