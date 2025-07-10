import { useEffect } from 'react'

/**
 *
 */
export default function WithGlobalStyles() {
  useEffect(() => {
    import('../../styles/styles.scss')
  }, [])

  return null
}
