import Meta from '@/components/Meta'
import Page from '@/components/Page'
import Dashboard from '@/components/Dashboard'
import { siteName } from '@/constants'

export default function Overview() {
  return (
    <>
      <Page title={siteName} hideMenu light>
        <Meta title={siteName} />
        <Dashboard />
      </Page>
    </>
  )
}
