import { WizardDefinition } from 'losen'
import { z, ZodType } from 'zod'

export type Floppo = { a: 1 }

export const wizard = z.object<WizardDefinition>({
  meta: z.object<ZodType<WizardDefinition['meta']>>({
    name: z.string(),
    title: z.string(),
    footer: z.string().optional(),
    localStorageKey: z.string().optional(),
    pdfServiceUrl: z.string().optional(),
  }),
})
