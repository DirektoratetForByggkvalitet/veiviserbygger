import { WizardPage } from 'types'
import { icons } from 'lucide-react'

const typeMap: Record<
  WizardPage['type'],
  { title: string; icon: keyof typeof icons; description: string; add: string }
> = {
  Intro: {
    title: 'Intro',
    icon: 'FileInput',
    description:
      'Introsiden er en obligatorisk start på veiviseren. Her bør man fortelle besøkende kort hva man kan få svar på ved å bruke veiviseren. Introsiden vil avsluttes med en "Start veiviseren" knapp som starter veiviseren. Prøv å hold innholdet på siden kort slik at besøkende ikke trenger å scrolle ned til denne knappen.',
    add: 'Legg først til tekst eller bilder som introduserer besøkende til hva man kan få svar på ved å gjennomføre denne veiviseren.',
  },
  Page: {
    title: 'Side',
    icon: 'File',
    description:
      'Sider inneholder spørsmål og innhold brukeren skal svare på. En veiviser er ofte bygget opp av flere sider som grupperer spørsmålene på en ryddig måte. Siden dukker opp som et steg i navigasjonen til veiviseren.',
    add: 'Legg først til spørsmål, tekst eller andre elementer som skal vises på denne siden i veiviseren.',
  },
  Result: {
    title: 'Resultat',
    icon: 'FileCheck',
    description:
      'Resultatsiden er en avsluttende side i veiviseren med en oppsummering av svarene brukeren har gitt. Man kan ha flere resultatsider avhengig av hva brukeren har oppgitt av svar i veiviseren.',
    add: 'Legg først til tekst eller bilder som gir besøkende svar på hva svarene de gav i veiviseren betydde.',
  },
}

export function getPageTypeTitle(type: WizardPage['type']) {
  return typeMap[type].title || type
}
export function getPageTypeIcon(type: WizardPage['type']) {
  return typeMap[type].icon || 'Diamond'
}
export function getPageTypeDescription(type: WizardPage['type']) {
  return typeMap[type].description || ''
}
export function getPageTypeAdd(type: WizardPage['type']) {
  return typeMap[type].add || ''
}
