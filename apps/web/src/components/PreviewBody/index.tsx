import { ReactNode, useEffect } from 'react'
import Meta from '@/components/Meta'

interface Props {
  children: ReactNode
  title?: string
  /**
   * Whether or not to apply global styles to the page. Defaults to true.
   */
  globalStyles?: boolean
}

export default function PreviewBody({ children, title }: Props) {
  useEffect(() => {
    import('./Styles.module.scss') // Simple body reset styling
  }, [])

  return (
    <>
      <Meta title={title} />
      {children}
    </>
  )
}
