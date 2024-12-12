import { useState } from "react"
import BEMHelper from "@/lib/bem"
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

type Props = {
  message?: string
}

const messages = [
  'Laster',
  'Loading',
  'Cargando',
  'Chargement',
  'Laden',
  'Caricamento',
  'Laddar',
  'Indlæser',
  'Ladataan',
  'Ładowanie',
  'Загрузка',
  '加载中',
  'Läser in',
  'Yükleniyor',
  'Carregando',
  'Încărcare',
  'Načítání',
  'Lataus',
  'Kargante',
  'Ielādē',
  'Laddning',
  'Uppfläds',
  'Φόρτωση',
  'Učitavanje',
  'Лоадинг'
]

export default function Loader({ message = messages[Math.floor(Math.random() * messages.length)] }: Props) {
  const [index, setIndex] = useState(0)

  const msPrLetter = Math.floor(Math.max(50, 100 / message.length))
  const messageLength = message.length

  setInterval(() => {
    setIndex(i => (i + 1) % messageLength)
  }, msPrLetter)

  return <div {...bem()} style={{ '--duration': `${message.length * 20}ms` }}><span {...bem('rotate')}>{message[index]}</span></div>
}
