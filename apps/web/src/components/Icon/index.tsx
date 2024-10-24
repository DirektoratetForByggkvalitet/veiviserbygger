import { get } from 'lodash'
import { icons, type LucideProps } from 'lucide-react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons
}

export default function Icon({ name, size = 18, stroke = '1.6', className }: IconProps) {
  const props = { size, strokeWidth: stroke, ...bem('', '', className) }
  if (!get(icons, name)) {
    console.warn('No icon:', name)
    return null
  }
  const LucideIcon = icons[name]

  return <LucideIcon {...props} />
}
