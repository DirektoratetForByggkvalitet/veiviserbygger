import { Intro, WizardPage } from 'types'
import { icons } from 'lucide-react'

const typeMap: Record<
  WizardPage['type'] | Intro['type'],
  { title: string; icon: keyof typeof icons; description: string }
> = {
  Intro: {
    title: 'Introside',
    icon: 'FileInput',
    description:
      'Introsiden er en obligatorisk start på veiviseren. Her bør man fortelle besøkende kort hva man kan få svar på ved å bruke veiviseren. Introsiden vil avsluttes med en "Start veiviseren" knapp som starter veiviseren. Prøv å hold innholdet på siden kort slik at besøkende ikke trenger å scrolle ned til denne knappen.',
  },
  Page: {
    title: 'Side',
    icon: 'File',
    description:
      'Sider inneholder spørsmål og innhold brukeren skal svare på. En veiviser er ofte bygget opp av flere sider som grupperer spørsmålene på en ryddig måte. Siden dukker opp som et steg i navigasjonen til veiviseren.',
  },
  Result: {
    title: 'Resultatside',
    icon: 'FileCheck',
    description:
      'Resultatsiden er en avsluttende side i veiviseren med en oppsummering av svarene brukeren har gitt. Siden bør forklarer hva brukernes svar i veiviseren betyr, slik at de får en tydelig forståelse av resultatet. Man kan ha flere resultatsider avhengig av hva brukeren har oppgitt av svar i veiviseren.',
  },
}

export function getPageTypeTitle(type?: keyof typeof typeMap) {
  return (type && typeMap[type]?.title) || type
}
export function getPageTypeIcon(type?: keyof typeof typeMap) {
  return (type && typeMap[type]?.icon) || 'Diamond'
}
export function getPageTypeDescription(type?: keyof typeof typeMap) {
  return (type && typeMap[type]?.description) || ''
}
