import { PageContent, Branch } from 'types'
import { icons } from 'lucide-react'

const typeMap: Record<
  PageContent['type'] | Branch['preset'],
  { title: string; icon: keyof typeof icons; description: string }
> = {
  Text: {
    title: 'Tekst',
    icon: 'Text',
    description: 'Tekst, lister og bilder brukt for ekstra informasjon.',
  },
  Radio: {
    title: 'Radioknapper',
    icon: 'CircleDot',
    description:
      'Dette er et flervalgspørsmål vi stiller brukeren som de kan svare på. Avhengig av hva de svarer kan vi respondere med resultater eller informasjon.',
  },
  Checkbox: { title: 'Avkrysningsbokser', icon: 'SquareCheck', description: '' },
  Select: { title: 'Nedtrekksmeny', icon: 'Rows3', description: '' },
  Input: { title: 'Tekstfelt', icon: 'PenLine', description: '' },
  Branch: { title: 'Egendefinert gren', icon: 'Split', description: '' },
  Error: { title: 'Feil', icon: 'TriangleAlert', description: '' },
  Information: { title: 'Informasjon', icon: 'Info', description: '' },
  Number: { title: 'Tallfelt', icon: 'Hash', description: '' },
  NegativeResult: {
    title: 'Negativt resultat',
    icon: 'OctagonX',
    description:
      'Gir et negativt resultat hvor brukeren ikke kan fortsette i veiviseren, men går videre til en resultatside.',
  },
  ExtraInformation: {
    title: 'Ekstra informasjon',
    icon: 'Info',
    description:
      'Gir ekstra informasjon til brukeren, mens brukeren får mulighet til å fortsette veiviseren. Ekstra informasjon blir gjentatt på resultatsider.',
  },
  NewQuestions: {
    title: 'Nye spørsmål',
    icon: 'ListPlus',
    description: 'Viser et nytt spørsmål som ikke tidligere var synlig.',
  },
}

export function getTypeText(type: PageContent['type'] | Branch['preset']) {
  return typeMap[type].title || type
}
export function getTypeIcon(type: PageContent['type'] | Branch['preset']) {
  return typeMap[type].icon || 'Diamond'
}

export function getTypeDescription(type: PageContent['type'] | Branch['preset']) {
  return typeMap[type].description || '🐝eeeskrivelse'
}
