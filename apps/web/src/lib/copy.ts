export const copy: Record<string, Record<string, string>> = {
  login: {
    title: 'Logg inn',
    description: 'Et verktøy for å lage og administrere veivisere.',
  },
  dashboard: {
    description:
      'Dette verktøyet lar deg opprette og redigere veivisere for nettstedet dibk.no. Du kan definere spørsmål, sette opp svarlogikk og bestemme hvilke resultater brukerne skal få basert på sine valg. Når en veiviser er klar for publisering, må den legges inn i Enonic ved hjelp av blokken "Veiviser" for å bli synlig på nettsiden.',
    permissionDenied:
      'Du har ikke tilgang til å se veiviserne. Sjekk at sikkerhetsreglene i Firestore gir innloggede brukere lesetilgang.',
    loadError: 'Klarte ikke å hente veiviserne. Prøv å laste siden på nytt.',
  },
}
