import { WizardDefinition } from 'losen'
import { WizardIntro } from '.'

export type Requests = {
  '/config': {
    GET: {
      response: { flags?: Record<string, boolean>; constants?: Record<string, string> }
      query: {
        // query?: string
      }
    }
  }
  '/wizard/:wizardId/:versionId?': {
    GET: {
      response: WizardDefinition & {
        intro?: WizardIntro
      }
    }
  }
  '/storage/:path': {
    GET: {
      response: Blob
    }
  }
}
