import { useState } from 'react'
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
import { getOrdered, getWithId } from '@/lib/ordered'

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const { wizardId, versionId } = useParams<{ wizardId?: string; versionId?: string }>()
  const { wizard, versions, version } = useWizard(wizardId, versionId)
  const { patchPage, deletePage, addNode } = useVersion()
  const showFrontpage = !wizardId
  const setOpenMenu = useSetAtom(menuState)

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = () => {
    setSelected(null)
  }

  const handleDelete = (pageId?: string) => () => {
    if (!pageId) {
      return
    }

    deletePage(pageId)
    handleClose()
  }

  // const dataIndex = selected ? version?.pages?.find(p => p.id === selected) || DUMMY_DATA.findIndex((item) => item.id === selected) : undefined
  const data = getWithId(version?.pages, selected)

  const panelTitle = data?.heading ?? 'Uten tittel'

  if (showFrontpage) {
    setOpenMenu(true) // Open menu if no wizards is selected
  }

  const addContentActions: DropdownOptions = data?.id ? [
    {
      group: 'Innhold',
    },
    {
      value: '0',
      label: 'Tekst',
      onClick: () => addNode(data.id, { type: 'Text' })
    },
    {
      group: 'Spørsmål',
    },
    {
      value: '0',
      label: 'Radiovalg',
      onClick: () => addNode(data.id, { type: 'Radio' }),
    },
    {
      value: '0',
      label: 'Sjekkbokser',
      onClick: () => addNode(data.id, { type: 'Checkbox' }),
    },
    {
      value: '0',
      label: 'Tekstfelt',
      onClick: () => addNode(data.id, { type: 'Input' }),
    },
    {
      value: '0',
      label: 'Nummerfelt',
      onClick: () => addNode(data.id, { type: 'Number' }),
    },
    {
      group: 'Hendelser',
    },
    {
      value: '0',
      label: 'Vis ekstra informasjon',
      onClick: () => addNode(data.id, { type: 'Branch', preset: 'ExtraInformation' })
    },
    {
      value: '0',
      label: 'Vis ekstra spørsmål',
      onClick: () => addNode(data.id, { type: 'Branch', preset: 'NewQuestions' }),
      disabled: true,
    },
    {
      value: '0',
      label: 'Negativt resultat',
      onClick: () => addNode(data.id, { type: 'Branch', preset: 'NegativeResult' }),
    },
  ] : []

  return (
    <>
      <Page title={wizard?.data?.title} versions={versions} wizard={wizard}>
        <Meta title="Losen Veiviserbygger" />

        <Panel
          open={!!data}
          onClose={handleClose}
          backdrop={false}
          optionsLabel="Sidevalg"
          options={[
            {
              value: '1',
              label: 'Flytt siden',
              onClick: handleDelete(data?.id),
            },
            {
              value: '1',
              label: 'Fjern siden',
              styled: 'delete',
              onClick: handleDelete(data?.id),
            },
          ]}
          title={panelTitle}
        >
          {data?.id ? (
            <>
              <Form>
                <Input
                  label="Sidetittel"
                  value={data?.heading || ''}
                  onChange={(v) => patchPage(data.id, { heading: v })}
                  header
                />
                {data?.type === 'Intro' && (
                  <>
                    <Help description="Introsiden er en obligatorisk start på veiviseren. Her bør man fortelle besøkende kort hva man kan få svar på ved å bruke veiviseren." />
                  </>
                )}

                {data.content?.map((nodeId) => {
                  if (!version?.nodes?.[nodeId]) { return null }

                  return <Content
                    key={nodeId}
                    node={{ ...version?.nodes?.[nodeId], id: nodeId }}
                  // nodeId={nodeId}
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

                {data?.type === 'Intro' && (
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
