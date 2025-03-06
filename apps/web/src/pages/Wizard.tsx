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
import ButtonBar from '@/components/ButtonBar'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import useWizard from '@/hooks/useWizard'
import { useParams } from 'react-router'
import Page from '@/components/Page'
import { PageContent, Branch, DeepPartial } from 'types'
import { getTypeIcon, getTypeText } from '@/lib/content'
import { useVersion } from '@/hooks/useVersion'
import { getOrdered } from '@/lib/ordered'
import { siteName } from '@/constants'
import { v4 as uuid } from 'uuid'

export default function Wizard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showConfirmDeletePage, setShowConfirmDeletePage] = useState(false)
  const { wizardId, versionId } = useParams<{ wizardId?: string; versionId?: string }>()
  const { wizard, versions, version, nodes } = useWizard(wizardId, versionId)
  const { patchPage, deletePage, addNodes } = useVersion()

  const page = useMemo(() => {
    if (!selected || !version || !version.pages?.[selected]) {
      return null
    }
    return { ...version?.pages?.[selected], id: selected }
  }, [version, selected])

  const nodeIds = useMemo(() => {
    return page?.content?.map((node) => node.id) || []
  }, [page])

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  useEffect(() => {
    console.log('HomePage rendered')
  })

  const handleClose = useCallback(() => {
    setSelected(null)
  }, [selected])

  const handleDelete = useCallback(
    (pageId?: string) => () => {
      if (!pageId) {
        return
      }

      deletePage(pageId)
      handleClose()
    },
    [deletePage, handleClose],
  )

  const handleNext = useCallback(() => {
    if (version?.pages && selected) {
      const ordered = getOrdered(version.pages)
      console.log({ ordered, selected, version })
      const index = ordered.findIndex(({ id }) => id === selected)
      const newSelected = ordered[index + 1]?.id || null
      if (newSelected !== null) {
        setSelected(newSelected)
      }
    }
  }, [version?.pages, selected])

  const handlePrevious = useCallback(() => {
    if (version?.pages && selected) {
      const ordered = getOrdered(version.pages)
      console.log({ ordered, selected, version })
      const currentIndex = ordered.findIndex(({ id }) => id === selected)
      const newSelected = ordered[currentIndex - 1]?.id || null
      if (newSelected !== null) {
        setSelected(newSelected)
      }
    }
  }, [version?.pages, selected])

  const panelTitle = page?.heading ?? 'Uten tittel'
  const wizardTitle = !wizard ? siteName : (wizard?.data?.title ?? 'Uten tittel')

  function contentAction<T extends PageContent['type']>({
    pageId,
    type,
    preset,
    disabled,
    defaultContent,
  }: {
    pageId: string
    type: T
    preset?: Branch['preset']
    disabled?: boolean
    defaultContent?: Omit<DeepPartial<Extract<PageContent, { type: T }>>, 'id' | 'type'>
  }) {
    return {
      value: preset || type,
      label: getTypeText(preset || type),
      icon: getTypeIcon(preset || type),
      onClick: () => addNodes(pageId, [{ type, ...defaultContent }]),
      disabled: disabled,
    }
  }

  const addContentActions: DropdownOptions = page?.id
    ? [
      {
        group: 'Innhold',
      },
      contentAction({ pageId: page.id, type: 'Text' }),
      {
        group: 'Spørsmål',
      },
      contentAction({
        pageId: page.id,
        type: 'Radio',
        defaultContent: {
          options: {
            [uuid()]: { heading: '', order: 0 }
          }
        },
      }),
      contentAction({
        pageId: page.id, type: 'Select', disabled: true, defaultContent: {
          options: {
            [uuid()]: { heading: '', order: 0 }
          }
        }
      }),
      contentAction({
        pageId: page.id, type: 'Checkbox', defaultContent: {
          [uuid()]: { heading: '', order: 0 }
        }
      }),
      contentAction({ pageId: page.id, type: 'Input', disabled: true }),
      contentAction({ pageId: page.id, type: 'Number', disabled: true }),
      {
        group: 'Hendelser',
      },
      contentAction({
        pageId: page.id,
        type: 'Branch',
        preset: 'ExtraInformation',
        defaultContent: { preset: 'ExtraInformation', test: {} },
      }),
      contentAction({
        pageId: page.id,
        type: 'Branch',
        preset: 'NegativeResult',
        defaultContent: { preset: 'NegativeResult', test: {} },
      }),
      contentAction({
        pageId: page.id,
        type: 'Branch',
        preset: 'NewQuestions',
        defaultContent: { preset: 'NewQuestions', test: {} },
      }),
      contentAction({ pageId: page.id, type: 'Branch', disabled: true }),
    ]
    : []

  return (
    <>
      <Page title={wizardTitle} versions={versions} wizard={wizard}>
        <Meta title={wizardTitle} />

        <Panel
          open={!!page}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
          backdrop={false}
          optionsLabel="Sidevalg"
          options={[
            {
              value: '1',
              label: 'Dupliser siden',
              onClick: () => console.log('Dupliser siden og gi den navnet "[Heading] (kopi)"'),
              disabled: true,
            },
            {
              value: '1',
              label: 'Fjern siden',
              styled: 'delete',
              onClick: () => setShowConfirmDeletePage(true),
            },
          ]}
          title={panelTitle}
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
              <Button type="button" warning onClick={() => handleDelete(page?.id)}>
                Slett siden
              </Button>
              <Button type="button" onClick={() => setShowConfirmDeletePage(false)}>
                Avbryt
              </Button>
            </ButtonBar>
          </Modal>
          {page?.id ? (
            <>
              <Form>
                <Input
                  label="Sidetittel"
                  value={page?.heading || ''}
                  placeholder="Uten tittel"
                  onChange={(v) => patchPage(page.id, { heading: v })}
                  header
                />

                {page?.type === 'Intro' && (
                  <>
                    <Help description="Introsiden er en obligatorisk start på veiviseren. Her bør man fortelle besøkende kort hva man kan få svar på ved å bruke veiviseren." />
                  </>
                )}

                {(nodeIds?.length > 0 &&
                  nodeIds.map((nodeId) => {
                    return (
                      <Content
                        key={nodeId}
                        nodeId={nodeId}
                        allNodes={nodes}
                        pageId={page.id}
                      // allNodes={version?.nodes}
                      />
                    )
                  })) || (
                    <Help
                      description="Legg til spørsmål, tekst eller andre elementer som skal vises på denne siden i
                    veiviseren."
                    />
                  )}

                <Dropdown
                  options={addContentActions}
                  trigger={({ onClick }) => (
                    <Button type="button" primary icon="Plus" onClick={onClick}>
                      Legg til innhold
                    </Button>
                  )}
                />

                {page?.type === 'Intro' && (
                  <>
                    <Help description='Introsiden vil avsluttes med en "Start veiviseren" knapp som starter veiviseren. Prøv å hold innholdet på siden kort slik at besøkende ikke trenger å scrolle ned til denne knappen.' />
                  </>
                )}
              </Form>
            </>
          ) : null}
        </Panel>

        {wizardId ? (
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
    </>
  )
}
