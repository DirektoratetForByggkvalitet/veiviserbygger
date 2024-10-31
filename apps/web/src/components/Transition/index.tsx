import { ReactNode, useRef } from 'react'
import { Transition as ReactTransition, TransitionGroup } from 'react-transition-group'

interface Props {
  children: ReactNode
  updateKey: string | number
  className?: string
  enter?: number
  exit?: number
}

export default function Transition({
  children,
  updateKey,
  className,
  enter = 1200,
  exit = 600,
  ...props
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <TransitionGroup component={null}>
      <ReactTransition key={updateKey} timeout={{ enter, exit }} nodeRef={nodeRef}>
        {(status) => (
          <div className={className} ref={nodeRef} data-animation={status} {...props}>
            {children}
          </div>
        )}
      </ReactTransition>
    </TransitionGroup>
  )
}
