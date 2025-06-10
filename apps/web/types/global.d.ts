import { DocumentReference } from 'firebase/firestore'
import 'react'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | undefined
  }
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeReferenceTo(expected: DocumentReference): R
    }

    interface Expect {
      toBeReferenceTo(expected: DocumentReference): R
    }
  }
}
