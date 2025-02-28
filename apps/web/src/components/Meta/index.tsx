import { Helmet } from 'react-helmet'
import { siteName } from '@/constants'
interface Props {
  title?: string
}

export default function Meta({ title }: Props) {
  return <Helmet titleTemplate={`%s | ${siteName}`} title={title} defaultTitle="Hjem" />
}
