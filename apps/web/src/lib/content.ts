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
  Checkbox: { title: 'Avkrysningsbokser', icon: 'Text', description: '' },
  Select: { title: 'Nedtrekksmeny', icon: 'Text', description: '' },
  Input: { title: 'Tekstfelt', icon: 'Text', description: '' },
  Branch: { title: 'Gren', icon: 'Text', description: '' },
  Error: { title: 'Feil', icon: 'Text', description: '' },
  Information: { title: 'Informasjon', icon: 'Text', description: '' },
  Number: { title: 'Tallfelt', icon: 'Text', description: '' },
  NegativeResult: {
    title: 'Negativt resultat',
    icon: 'TriangleAlert',
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
    icon: 'Option',
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
  return typeMap[type].description || 'Diamond'
}
