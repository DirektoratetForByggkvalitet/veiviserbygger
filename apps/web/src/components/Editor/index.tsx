import { useState } from 'react'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Dropdown from '@/components/Dropdown'
import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { useValue } from '@/hooks/useValue'
const bem = BEMHelper(styles)

const extensions = [
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
]

interface Props {
  label: string
  value: string
  hideIfEmpty?: boolean
  onChange: (value: string) => void
}

export default function Editor({ label, value, hideIfEmpty, onChange }: Props) {
  const v = useValue(value, () => console.log('Editor value changed'))
  const [showInput, setShowInput] = useState<boolean>(!!value || false)

  if (hideIfEmpty && !value && !showInput) {
    // Shows a small trigger for the input field when empty
    return (
      <button {...bem('button-label')} type="button" onClick={() => setShowInput(true)}>
        {label}
      </button>
    )
  }

  return (
    <section {...bem('')}>
      <h3 {...bem('label')}>{label}</h3>

      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={v.value}
        editorContainerProps={{ ...bem('input') }}
        autofocus={hideIfEmpty && !value && showInput}
        onBlur={hideIfEmpty && !value ? () => setShowInput(false) : undefined}
        onUpdate={(content) => v.onChange(content.editor.getHTML())}
      />
    </section>
  )
}

function MenuBar() {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  const textStyle =
    (editor.isActive('paragraph') && 'p') ||
    (editor.isActive('heading', { level: 2 }) && 'h2') ||
    (editor.isActive('heading', { level: 3 }) && 'h3') ||
    undefined
  const textStyles = [
    {
      value: 'p',
      label: 'Paragraf',
    },
    {
      label: 'Overskrift',
      value: 'h2',
    },
    {
      label: 'Underoverskrift',
      value: 'h3',
    },
  ]

  const handleStyleChange = (value: string) => {
    switch (value) {
      case 'p':
        return editor.chain().focus().setParagraph().run()
      case 'h1':
        return editor.chain().focus().toggleHeading({ level: 1 }).run()
      case 'h2':
        return editor.chain().focus().toggleHeading({ level: 2 }).run()
      case 'h3':
        return editor.chain().focus().toggleHeading({ level: 3 }).run()
    }
  }

  const toggle = (value: string) => () => {
    switch (value) {
      case 'bold':
        return editor.chain().focus().toggleBold().run()
      case 'italic':
        return editor.chain().focus().toggleItalic().run()
      case 'bulletList':
        return editor.chain().focus().toggleBulletList().run()
      case 'orderedList':
        return editor.chain().focus().toggleOrderedList().run()
    }
  }

  return (
    <div {...bem('menu')}>
      <button
        type="button"
        onClick={toggle('bold')}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        {...bem('control', { active: editor.isActive('bold') })}
      >
        <Icon name="Bold" />
      </button>
      <button
        type="button"
        onClick={toggle('italic')}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        {...bem('control', { active: editor.isActive('italic') })}
      >
        <Icon name="Italic" />
      </button>

      <hr {...bem('separator')} />

      <button
        type="button"
        onClick={toggle('bulletList')}
        {...bem('control', { active: editor.isActive('bulletList') })}
      >
        <Icon name="List" />
      </button>
      <button
        type="button"
        onClick={toggle('orderedList')}
        {...bem('control', { active: editor.isActive('orderedList') })}
      >
        <Icon name="ListOrdered" />
      </button>

      <hr {...bem('separator')} />

      <Dropdown value={textStyle} options={textStyles} onChange={handleStyleChange} simple />
    </div>
  )
}
