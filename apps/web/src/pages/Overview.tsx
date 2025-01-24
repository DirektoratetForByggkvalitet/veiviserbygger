import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSetAtom } from 'jotai'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'
import Button from '@/components/Button'
import Content from '@/components/Content'
import Help from '@/components/Help'
import menuState from '@/store/menu'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import useWizard from '@/hooks/useWizard'
import { useParams } from 'react-router'
import Page from '@/components/Page'
import { useVersion } from '@/hooks/useVersion'

export default function Overview() {
  const [selected, setSelected] = useState<string | null>(null)
  const { wizardId, versionId } = useParams<{ wizardId?: string; versionId?: string }>()
  const { wizard, versions, version } = useWizard(wizardId, versionId)
  const { patchPage, deletePage, addNode } = useVersion()
  const showFrontpage = !wizardId
  const setOpenMenu = useSetAtom(menuState)

  const page = useMemo(() => {
    if (!selected || !version || !version.pages?.[selected]) { return null }
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

  const handleDelete = useCallback((pageId?: string) => () => {
    if (!pageId) {
      return
    }

    deletePage(pageId)
    handleClose()
  }, [deletePage, handleClose])

  const panelTitle = page?.heading ?? 'Uten tittel'

  if (showFrontpage) {
    setOpenMenu(true) // Open menu if no wizards is selected
  }

  const addContentActions: DropdownOptions = page?.id ? [
    {
      group: 'Innhold',
    },
    {
      value: '0',
      label: 'Tekst',
      onClick: () => addNode(page.id, { type: 'Text' })
    },
    {
      group: 'Spørsmål',
    },
    {
      value: '0',
      label: 'Radiovalg',
      onClick: () => addNode(page.id, { type: 'Radio' }),
    },
    {
      value: '0',
      label: 'Sjekkbokser',
      onClick: () => addNode(page.id, { type: 'Checkbox' }),
    },
    {
      value: '0',
      label: 'Tekstfelt',
      onClick: () => addNode(page.id, { type: 'Input' }),
    },
    {
      value: '0',
      label: 'Nummerfelt',
      onClick: () => addNode(page.id, { type: 'Number' }),
    },
    {
      group: 'Hendelser',
    },
    {
      value: '0',
      label: 'Vis ekstra informasjon',
      onClick: () => addNode(page.id, { type: 'Branch', preset: 'ExtraInformation' })
    },
    {
      value: '0',
      label: 'Vis ekstra spørsmål',
      onClick: () => addNode(page.id, { type: 'Branch', preset: 'NewQuestions' }),
      disabled: true,
    },
    {
      value: '0',
      label: 'Negativt resultat',
      onClick: () => addNode(page.id, { type: 'Branch', preset: 'NegativeResult' }),
    },
  ] : []

  console.log('ludo', { pageId: page?.id })

  return (
    <>
      <Page title={wizard?.data?.title} versions={versions} wizard={wizard}>
        <Meta title="Losen Veiviserbygger" />

        <Panel
          open={!!page}
          onClose={handleClose}
          backdrop={false}
          optionsLabel="Sidevalg"
          options={[
            {
              value: '1',
              label: 'Flytt siden',
              onClick: handleDelete(page?.id),
            },
            {
              value: '1',
              label: 'Fjern siden',
              styled: 'delete',
              onClick: handleDelete(page?.id),
            },
          ]}
          title={panelTitle}
        >
          {page?.id ? (
            <>
              <Form>
                <Input
                  label="Sidetittel"
                  value={page?.heading || ''}
                  onChange={(v) => patchPage(page.id, { heading: v })}
                  header
                />

                {page?.type === 'Intro' && (
                  <>
                    <Help description="Introsiden er en obligatorisk start på veiviseren. Her bør man fortelle besøkende kort hva man kan få svar på ved å bruke veiviseren." />
                  </>
                )}

                {nodeIds.map((nodeId) => {
                  return <Content
                    key={nodeId}
                    nodeId={nodeId}
                  // allNodes={version?.nodes}
                  />
                }) || (
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
              pages: version?.pages
            }}
          />
        ) : null}
      </Page>
    </>
  )
}
