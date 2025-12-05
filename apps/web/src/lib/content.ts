import { PageContent, Branch } from 'types'
import { icons } from 'lucide-react'

const typeMap: Record<
  PageContent['type'] | Branch['preset'],
  { title: string; icon: keyof typeof icons; description: string }
> = {
  Text: {
    title: 'Tekst',
    icon: 'Text',
    description: 'Tekst, lister og bilder brukt for tilleggsinfo.',
  },
  Radio: {
    title: 'Ettvalg',
    icon: 'CircleDot',
    description:
      'Et spørsmål hvor brukeren svarer ved å velge ett av alternativene. Avhengig av hva de svarer kan vi respondere med resultater eller informasjon.',
  },
  Checkbox: {
    title: 'Flervalg',
    icon: 'SquareCheck',
    description:
      'Et spørsmål hvor brukeren svarer ved å velge ett eller flere alternativer. Avhengig av hva de svarer kan vi respondere med resultater eller informasjon.',
  },
  Select: {
    title: 'Nedtrekksmeny',
    icon: 'Rows3',
    description:
      'Dette er et flervalgspørsmål vi stiller brukeren hvor de svarer ved å velge ett alternativ. Avhengig av hva de svarer kan vi respondere med resultater eller informasjon.',
  },
  Input: {
    title: 'Tekstfelt',
    icon: 'PenLine',
    description: 'Et felt der brukeren skriver inn tekstverdier',
  },
  Number: {
    title: 'Tallfelt',
    icon: 'Hash',
    description:
      'Et tallfelt der brukeren skriver inn numeriske verdier. Man kan begrense hva brukeren kan skrive i feltet ved hjelp av minimums-, maksimums- og stegverdier. Steg på 1 betyr at tallet må være heltall, 0.1 betyr at en desimal er tilgjengelig, osv. La felt stå tomt for ingen begrensning.',
  },
  Sum: {
    title: 'Summering',
    icon: 'Sigma',
    description: 'Et felt som kan summerer verdiene fra andre tallfelt i veiviseren.',
  },
  Branch: { title: 'Egendefinert gren', icon: 'Split', description: '' },
  Error: { title: 'Feil', icon: 'TriangleAlert', description: '' },
  Information: { title: 'Informasjon', icon: 'Info', description: '' },
  NegativeResult: {
    title: 'Negativt resultat',
    icon: 'OctagonX',
    description:
      'Gir et negativt resultat hvor brukeren ikke kan fortsette i veiviseren, men går videre til en resultatside. Informasjonen blir gjentatt på resultatsiden.',
  },
  ExtraInformation: {
    title: 'Tilleggsinfo',
    icon: 'Info',
    description:
      'Gir ekstra informasjon til brukeren basert på valg de har gjort, mens brukeren får mulighet til å fortsette veiviseren. Tilleggsinfo blir gjentatt på resultatsider.',
  },
  NewQuestions: {
    title: 'Nye spørsmål',
    icon: 'ListPlus',
    description: 'Viser et nytt spørsmål som ikke tidligere var synlig.',
  },
  Result: {
    title: 'Resultatside',
    icon: 'FileCheck',
    description:
      'En resultatside som viser et resultat basert på svarene brukeren har gitt. Resultatsiden kan også inneholde tilleggsinformasjon.',
  },
}

export function getTypeText(type: PageContent['type'] | Branch['preset']) {
  return typeMap[type].title || type
}
export function getTypeIcon(type: PageContent['type'] | Branch['preset']) {
  return typeMap[type].icon || 'Diamond'
}

export function getTypeDescription(type: PageContent['type'] | Branch['preset']) {
  return typeMap[type].description || ''
}
