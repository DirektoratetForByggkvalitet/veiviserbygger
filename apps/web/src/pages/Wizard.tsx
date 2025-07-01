import { useCallback, useEffect, useMemo, useState } from 'react'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'
import Button from '@/components/Button'
import Content from '@/components/Content'
import Help from '@/components/Help'
import Modal from '@/components/Modal'
import Message from '@/components/Message'
import PageExpression from '@/components/PageExpression'
import ButtonBar from '@/components/ButtonBar'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import useWizard from '@/hooks/useWizard'
import { Navigate, useParams } from 'react-router'
import Page from '@/components/Page'
import { PageContent, Branch, DeepPartial, WizardPage, WithOrder, Intro } from 'types'
import { getTypeIcon, getTypeText } from '@/lib/content'
import { getPageTypeDescription, getPageTypeTitle } from '@/lib/page'
import { useVersion } from '@/hooks/useVersion'
import { getOrdered } from 'shared/utils'
import { siteName } from '@/constants'
import { v4 as uuid } from 'uuid'
import { EditableContext } from '@/context/EditableContext'
import { useEditable } from '@/hooks/useEditable'
import { deleteField } from 'firebase/firestore'

function contentAction<T extends PageContent['type']>({
  pageId,
  type,
  preset,
  disabled,
  defaultContent,
  addNodes,
}: {
  pageId: string
  type: T
  preset?: Branch['preset']
  disabled?: boolean
  defaultContent?: Omit<DeepPartial<Extract<PageContent, { type: T }>>, 'id' | 'type'>
  addNodes: ReturnType<typeof useVersion>['addNodes']
}) {
  return {
    value: preset || type,
    label: getTypeText(preset || type),
    icon: getTypeIcon(preset || type),
    onClick: () => addNodes({ pageId }, [{ type, ...defaultContent }]),
    disabled: disabled,
  }
}

export const addResultContentActions = (
  pageId: string,
  addNodes: ReturnType<typeof useVersion>['addNodes'],
): DropdownOptions =>
  pageId
    ? [
        {
          group: 'Innhold',
        },
        contentAction({ addNodes, pageId, type: 'Text' }),
        {
          group: 'Hendelser',
        },
        contentAction({
          addNodes,
          pageId,
          type: 'Branch',
          preset: 'ExtraInformation',
          defaultContent: { preset: 'ExtraInformation', test: {} },
        }),
      ]
    : []

export const addPageContentActions = (
  pageId: string,
  addNodes: ReturnType<typeof useVersion>['addNodes'],
): DropdownOptions =>
  pageId
    ? [
        {
          group: 'Innhold',
        },
        contentAction({ addNodes, pageId, type: 'Text' }),
        {
          group: 'Spørsmål',
        },
        contentAction({
          addNodes,
          pageId,
          type: 'Radio',
          defaultContent: {
            options: {
              [uuid()]: { heading: '', order: 0 },
            },
          },
        }),
        contentAction({
          addNodes,
          pageId,
          type: 'Select',
          disabled: true,
          defaultContent: {
            options: {
              [uuid()]: { heading: '', order: 0 },
            },
          },
        }),
        contentAction({
          addNodes,
          pageId,
          type: 'Checkbox',
          defaultContent: {
            [uuid()]: { heading: '', order: 0 },
          },
        }),
        contentAction({ addNodes, pageId, type: 'Input', disabled: false }),
        contentAction({ addNodes, pageId, type: 'Number', disabled: false }),
        {
          group: 'Hendelser',
        },
        contentAction({
          addNodes,
          pageId,
          type: 'Branch',
          preset: 'ExtraInformation',
          defaultContent: { preset: 'ExtraInformation', test: {} },
        }),
        contentAction({
          addNodes,
          pageId,
          type: 'Branch',
          preset: 'NegativeResult',
          defaultContent: { preset: 'NegativeResult', test: {} },
        }),
        contentAction({
          addNodes,
          pageId,
          type: 'Branch',
          preset: 'NewQuestions',
          defaultContent: { preset: 'NewQuestions', test: {} },
        }),
        contentAction({ addNodes, pageId, type: 'Branch', disabled: true }),
      ]
    : []

export default function Wizard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showConfirmDeletePage, setShowConfirmDeletePage] = useState(false)
  const { wizardId, versionId } = useParams<{ wizardId?: string; versionId?: string }>()
  const { loading, wizard, versions, version, nodes } = useWizard(wizardId, versionId)
  const { patchPage, deletePage, addNodes } = useVersion()

  // When the wizardId or versionId changes, reset the selected page
  // to null to ensure that the user is not stuck on a page that belongs
  // to a different wizard or version, and make sure to close the delete
  // confirmation modal
  useEffect(() => {
    setShowConfirmDeletePage(false)
    setSelected(null)
  }, [wizardId, versionId])

  const page = useMemo<WithOrder<WizardPage> | Intro | null>(() => {
    if (!selected || !version) {
      return null
    }

    if (selected === 'intro') {
      return {
        ...(version.intro || {}),
        id: 'intro',
        type: 'Intro',
        heading: '',
        content: version.intro?.content || {},
      }
    }

    const page = version.pages?.[selected]

    if (!page) {
      return null
    }

    return {
      ...page,
      id: selected,
    }
  }, [version, selected])

  const orderedNodes = useMemo(() => {
    return getOrdered(page?.content) || []
  }, [page])

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = useCallback(() => {
    setSelected(null)
  }, [selected])

  const handleDelete = useCallback(
    (pageId?: string) => () => {
      if (!pageId) {
        return
      }

      deletePage(pageId)
      setShowConfirmDeletePage(false)
      handleClose()
    },
    [deletePage, handleClose],
  )

  const addPageConditional = useCallback(
    (pageId: string) => {
      patchPage(pageId, {
        show: {},
      })
    },
    [patchPage],
  )

  /**
   * Returns a bool indicating whether or not there's a page in the given direction
   */
  const has = useCallback(
    (direction: 'prev' | 'next') => {
      if (!version?.pages || !selected) {
        return false
      }

      const ordered = getOrdered(version.pages)
      const index = ordered.findIndex(({ id }) => id === selected)

      const move = direction === 'prev' ? -1 : 1

      if (ordered[index + move]?.id) {
        return true
      }

      // if we're not on the intro page and the index is greater than or equal to 0, there's always the intro page
      if (direction === 'prev' && selected !== 'intro' && index >= 0) {
        return true
      }

      if (direction === 'next' && selected === 'intro' && ordered.length > 0) {
        return true
      }

      return false
    },
    [version?.pages, selected],
  )

  const handleNext = useCallback(() => {
    if (version?.pages && selected) {
      const ordered = getOrdered(version.pages)
      const index = ordered.findIndex(({ id }) => id === selected)
      const newSelected = ordered[index + 1]?.id || null

      if (selected === 'intro' && ordered.length > 0) {
        setSelected(ordered[0].id)
        return
      }

      if (newSelected !== null) {
        setSelected(newSelected)
      }
    }
  }, [version?.pages, selected])

  const handlePrevious = useCallback(() => {
    if (version?.pages && selected) {
      const ordered = getOrdered(version.pages)
      const currentIndex = ordered.findIndex(({ id }) => id === selected)
      const newSelected = ordered[currentIndex - 1]?.id || null

      if (currentIndex === 0) {
        setSelected('intro')
        return
      }

      if (newSelected !== null) {
        setSelected(newSelected)
      }
    }
  }, [version?.pages, selected])

  const pagesOrdered = version ? getOrdered(version.pages) : []
  const pageCount = pagesOrdered?.length
  const currentPageIndex = pagesOrdered.findIndex(({ id }) => id === selected)
  const isEditable = useEditable()
  const panelTitle =
    page?.type === 'Page'
      ? `${getPageTypeTitle('Page')} ${currentPageIndex + 1} av ${pageCount}`
      : (getPageTypeTitle(page?.type) ?? 'Uten tittel')
  const wizardTitle = !wizard ? siteName : (wizard?.data?.title ?? 'Uten tittel')

  if (!loading && !wizard) {
    return <Navigate to="/" />
  }

  return (
    <EditableContext.Provider value={!version?.publishedFrom}>
      <Page title={wizardTitle} versions={versions} wizard={wizard}>
        <Meta title={wizardTitle} />

        <Panel
          open={!!page}
          onClose={handleClose}
          onPrevious={has('prev') ? handlePrevious : undefined}
          onNext={has('next') ? handleNext : undefined}
          backdrop={false}
          optionsLabel="Sidevalg"
          options={
            page?.id !== 'intro' && isEditable
              ? ([
                  // Show the button for adding show page clause only if the page is a regular Page type,
                  // is not the first page and does not already have a show condition.
                  ...(page?.type === 'Page' && !page?.show && currentPageIndex > 0
                    ? [
                        {
                          value: '0',
                          icon: 'EyeOff',
                          label: 'Vis siden hvis...',
                          onClick: () => addPageConditional(page.id),
                          disabled: false,
                        },
                      ]
                    : []),
                  {
                    value: '2',
                    icon: 'Trash',
                    label: 'Fjern siden',
                    styled: 'delete',
                    onClick: () => setShowConfirmDeletePage(true),
                  },
                ] as DropdownOptions)
              : undefined
          }
          title={panelTitle || 'Uten tittel'}
        >
          <Modal
            title="Fjern siden"
            expanded={showConfirmDeletePage}
            onClose={() => setShowConfirmDeletePage(false)}
          >
            <Help
              description={`Vil du slette ${page?.heading ? `siden "${page.heading}"` : 'denne siden'} med alt innhold? Handlingen kan ikke angres.`}
            />
            <ButtonBar>
              <Button type="button" warning onClick={handleDelete(page?.id)}>
                Slett siden
              </Button>
              <Button type="button" onClick={() => setShowConfirmDeletePage(false)}>
                Avbryt
              </Button>
            </ButtonBar>
          </Modal>

          {page?.id ? (
            <Form>
              <Input
                label="Sidetittel"
                value={page?.heading || ''}
                placeholder="Uten tittel"
                onChange={(v) => patchPage(page.id, { heading: v })}
                header
              />

              {page?.type !== 'Intro' && page.id && page?.show && (
                <PageExpression
                  label="Vis siden hvis"
                  expression={page?.show}
                  pageId={page.id}
                  nodes={nodes}
                  onRemove={() => patchPage(page.id, { show: deleteField() as any })}
                />
              )}

              {(orderedNodes?.length > 0 &&
                orderedNodes.map(({ id, node: { id: nodeId } = {} }) => {
                  if (!nodeId) {
                    return <Message key={id} title="Feil med lasting av innhold" subtle />
                  }

                  return (
                    <Content
                      id={id}
                      key={id}
                      nodeId={nodeId}
                      allNodes={nodes}
                      pageId={page.id}
                      path={
                        page.type === 'Intro'
                          ? ['intro', 'content', id]
                          : ['pages', page.id, 'content', id]
                      }
                    />
                  )
                })) || (
                <>
                  <Help description={getPageTypeDescription(page.type)} />
                  <Message title="Siden er tom" subtle />
                </>
              )}

              {isEditable && (
                <Dropdown
                  options={
                    page?.type === 'Page'
                      ? addPageContentActions(page.id, addNodes)
                      : addResultContentActions(page.id, addNodes)
                  }
                  trigger={({ onClick }) => (
                    <Button type="button" primary icon="Plus" onClick={onClick}>
                      Legg til innhold
                    </Button>
                  )}
                />
              )}
            </Form>
          ) : null}
        </Panel>
        {!loading && !version ? (
          <Message title="Fant ikke veiviseren">
            Det er noen tekniske problemer med å laste inn denne veiviseren. Er du sikker på at du
            har riktig lenke? Prøv å laste siden på nytt, eller kontakt administrator hvis problemet
            vedvarer.
          </Message>
        ) : null}
        {wizardId && versionId ? (
          <Minimap
            onClick={handleSelect}
            selected={selected}
            data={{
              ...version,
              pages: version?.pages,
            }}
            allNodes={nodes}
          />
        ) : null}
      </Page>
    </EditableContext.Provider>
  )
}
