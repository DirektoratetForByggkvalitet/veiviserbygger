import { PageContent, Answer } from '@/types'
import Input from '@/components/Input'
import Editor from '@/components/Editor'
import Button from '@/components/Button'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

type Props = {
  type: PageContent['type']
  data: PageContent
}

export default function Content({ type, data }: Props) {
  if (!data) return null

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
          <h2 {...bem('title')}>Radio</h2>
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
        </>
      )
    },
    Branch: (data: any) => {
      return (
        <>
          <h2 {...bem('title')}>Branch</h2>
          {data?.children?.map((child: PageContent) => (
            <>{(nodes[child.type] || nodes.Fallback)(child)}</>
          ))}
        </>
      )
    },
    Error: (data: any) => {
      return (
        <>
          <h2 {...bem('title')}>Error</h2>
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
    Fallback: (data: any) => {
      return <p style={{ color: 'red' }}>Unknown node type: {data?.type}</p>
    },
  }

  return <section {...bem('')}>{(nodes[type] || nodes.Fallback)(data)}</section>
}
