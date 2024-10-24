import { PortableTextBlock } from '@portabletext/types'
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '5y0yqmf0',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-20',
})

type FooterContent = {
  _key: string
  title: string
  text: PortableTextBlock[]
}

export const getFooter = async () =>
  client.fetch<{
    credit?: PortableTextBlock[]
    content: [FooterContent, FooterContent, FooterContent, FooterContent]
  }>(`*[_id == 'footer']{ credit, content }[0]`)

export const getPage = (id: string) => async () =>
  client.fetch<{
    title: string
    preamble?: string
    content?: Array<{ _key: string; _type: string; title?: string; content?: PortableTextBlock[] }>
  }>(`*[_id == '${id}']{
    title,
    preamble,
    content
  }[0]`)

export const getSystemMessages = async () =>
  client.fetch<
    {
      _id: string
      title: string
      from: string
      to: string
    }[]
  >(`*[
    _type == 'notification' &&
    from < now() &&
    to > now()
  ]{
    _id,
    title,
    from,
    to,
  }`)
