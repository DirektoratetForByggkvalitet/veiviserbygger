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

export function IconStop({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...bem('', '', className)}>
      <path
        d="M1.39363 5.65685L6.34338 0.707107L11.2931 5.65685L6.34338 10.6066L1.39363 5.65685Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function IconContinue({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...bem('', '', className)}>
      <path
        d="M9.5 5C9.5 7.48528 7.48528 9.5 5 9.5C2.51472 9.5 0.5 7.48528 0.5 5C0.5 2.51472 2.51472 0.5 5 0.5C7.48528 0.5 9.5 2.51472 9.5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function IconStopDouble({ className }: { className?: string }) {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" {...bem('', '', className)}>
      <path
        d="M4.39363 6.65685L9.34338 1.70711L14.2931 6.65685L9.34338 11.6066L4.39363 6.65685Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M6.65685 1.00037L1 6.65723L6.65685 12.3141" stroke="currentColor" />
    </svg>
  )
}

export function IconMenu({ className }: { className?: string }) {
  return (
    <svg width="22" height="9" viewBox="0 0 22 9" fill="none" {...bem('', '', className)}>
      <line y1="0.5" x2="22" y2="0.5" stroke="currentColor" strokeWidth="1.5" />
      <line y1="8.5" x2="22" y2="8.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
