import { Helmet } from 'react-helmet'

interface Props {
  title?: string
}

export default function Meta({ title }: Props) {
  return <Helmet titleTemplate="%s | Losen" title={title} defaultTitle="Hjem" />
}
