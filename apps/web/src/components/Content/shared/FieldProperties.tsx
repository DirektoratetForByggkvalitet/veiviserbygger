import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Help from '@/components/Help'
import Form from '@/components/Form'
import Modal from '@/components/Modal'
import { getValuesBadge } from '@/lib/utils'
import { ReactNode, useState } from 'react'

export default function FieldProperties({
  children,
  label,
  description,
  values = [],
}: {
  children: ReactNode
  label: string
  description?: string
  values?: Parameters<typeof getValuesBadge>[0]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <Button
        type="button"
        list
        size="small"
        icon="Settings"
        badge={getValuesBadge(values)}
        onClick={() => setExpanded(true)}
      >
        {label}
      </Button>
      <Modal title={label} expanded={expanded} onClose={() => setExpanded(false)}>
        <Form.Presentational marginBottom={!!description}>{children}</Form.Presentational>
        {description && <Help description={description} />}
        <ButtonBar>
          <Button type="button" onClick={() => setExpanded(false)}>
            Lukk
          </Button>
        </ButtonBar>
      </Modal>
    </>
  )
}
