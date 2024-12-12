import { PageContent, Answer } from '@/types'
import Input from '@/components/Input'
import Editor from '@/components/Editor'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import Checkbox from '@/components/Checkbox'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

type Props = {
  type: PageContent['type']
  data: PageContent
}

export default function Content({ type, data }: Props) {
  if (!data) return null

  const contentActions = [
    {
      value: '0',
      label: 'Flytt til annen side',
      onClick: () => console.log('Flytt'),
    },
    {
      value: '0',
      label: 'Dupliser',
      onClick: () => console.log('Flytt'),
    },
    {
      value: '0',
      label: 'Fjern spørsmål',
      onClick: () => console.log('Fjern'),
    },
  ]

  const nodes: any = {
    Text: (data: any) => {
      return (
        <>
          <h2 {...bem('title')}>Tekst</h2>
          <Input
            label="Tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
          <Editor label="Innhold" value={data?.text} />
          {/* TODO: summary, details, show */}
        </>
      )
    },
    Radio: (data: any) => {
      return (
        <>
          <div {...bem('header')}>
            <h2 {...bem('title')}>Spørsmål </h2>
            <Dropdown icon="Ellipsis" direction="right" options={contentActions} simple />
          </div>
          <Input
            label="Tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
          <Editor label="Innhold" value={data?.text} />
          <h3 {...bem('sub-title')}>Svaralternativ</h3>
          <ul {...bem('options')}>
            {data?.options &&
              data?.options.map((option: Answer) => (
                <li key={option.id} {...bem('option')}>
                  <Input
                    label="Svar"
                    value={option?.heading || ''}
                    onChange={() => {
                      console.log('Hej')
                    }}
                  />
                  {/* TODO: Dropdown menu with actions "Slett", "Avslutt veiviseren ved valg", "Gi informasjon ved valg"  */}
                </li>
              ))}
          </ul>
          <Button type="button">Legg til svaralternativ</Button>
          {/* TODO: summary, details, show */}
          <h3 {...bem('sub-title')}>Valg</h3>
          <div {...bem('grid')}>
            <Dropdown
              value={'Radio'}
              options={[
                {
                  value: 'Radio',
                  label: 'Radioknapper',
                },
                {
                  value: 'Checkbox',
                  label: 'Sjekkbokser',
                },
                {
                  value: 'Select',
                  label: 'Nedtrekksmeny',
                },
              ]}
            />
            <Checkbox
              label="Grid"
              checked={data?.grid}
              onChange={() => {
                console.log('Hej')
              }}
            />
            <Checkbox
              label="Valgfritt"
              checked={data?.optional}
              onChange={() => {
                console.log('Hej')
              }}
            />
            <Checkbox
              label="Alle påkrevd"
              checked={data?.allMandatory}
              onChange={() => {
                console.log('Hej')
              }}
            />
          </div>
        </>
      )
    },
    Branch: (data: any) => {
      return (
        <>
          <div {...bem('header')}>
            <h2 {...bem('title')}>Branch </h2>
            <Dropdown icon="Ellipsis" direction="right" options={contentActions} simple />
          </div>
          {data?.content?.map((child: PageContent) => (
            <>{(nodes[child.type] || nodes.Fallback)(child)}</>
          ))}
        </>
      )
    },
    Error: (data: any) => {
      return (
        <>
          <h2 {...bem('title')}>Resultatboks </h2>
          <Input
            label="Tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
          <Editor label="Innhold" value={data?.text} />
        </>
      )
    },
    Information: (data: any) => {
      return (
        <>
          <div {...bem('header')}>
            <h2 {...bem('title')}>Gi informasjon </h2>
            <Dropdown icon="Ellipsis" direction="right" options={contentActions} simple />
          </div>
          <Input
            label="Tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
          <Editor label="Innhold" value={data?.text} />
        </>
      )
    },
    Result: (data: any) => {
      return (
        <>
          <h2 {...bem('title')}>Resultat </h2>
          <Input
            label="Tittel"
            value={data?.title || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
        </>
      )
    },
    Fallback: (data: any) => {
      return <p style={{ color: 'red' }}>Unknown node type: {data?.type}</p>
    },
  }

  return <section {...bem('')}>{(nodes[type] || nodes.Fallback)(data)}</section>
}
