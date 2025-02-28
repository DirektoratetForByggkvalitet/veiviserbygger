import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function Loader() {
  return (
    <div {...bem()}>
      <span {...bem('box1')}></span>
      <span {...bem('box2')}></span>
      <span {...bem('label')}>Laster</span>
    </div>
  )
}
