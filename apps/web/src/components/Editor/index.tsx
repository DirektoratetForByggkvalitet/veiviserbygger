import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Dropdown from '@/components/Dropdown'
import Icon from '@/components/Icon'

import { useEditable } from '@/hooks/useEditable'
import { useValue } from '@/hooks/useValue'
import BEMHelper from '@/lib/bem'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { useRef } from 'react'
import styles from './Styles.module.scss'
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
  Superscript,
  Subscript,
]

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function Editor({ label, value, onChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const v = useValue(value, onChange)
  const isEditable = useEditable()

  const handleLabelClick = () => {
    if (isEditable) {
      const input = wrapperRef.current?.querySelector('div[contenteditable="true"]') as HTMLElement

      if (input) {
        input.focus()
      }
    }
  }

  if (isEditable) {
    return (
      <section {...bem('')} ref={wrapperRef}>
        <h3 {...bem('label')} onClick={handleLabelClick}>
          {label}
        </h3>

        <EditorProvider
          slotBefore={<MenuBar />}
          extensions={extensions}
          content={v.value}
          editorContainerProps={{ ...bem('input') }}
          onUpdate={(content) => v.onChange(content.editor.getHTML())}
        />
      </section>
    )
  } else {
    return (
      <section {...bem('', 'read-only')}>
        <label {...bem('label')}>{label}</label>
        <div dangerouslySetInnerHTML={{ __html: v.value }} {...bem('input', '', 'tiptap')}></div>
      </section>
    )
  }
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
      case 'superscript':
        return editor.chain().focus().toggleSuperscript().run()
      case 'subscript':
        return editor.chain().focus().toggleSubscript().run()
      default:
        console.log(value)
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

      <button
        type="button"
        onClick={toggle('superscript')}
        disabled={!editor.can().chain().focus().toggleSuperscript().run()}
        {...bem('control', { active: editor.isActive('superscript') })}
      >
        <Icon name="Superscript" />
      </button>

      <button
        type="button"
        onClick={toggle('subscript')}
        disabled={!editor.can().chain().focus().toggleSubscript().run()}
        {...bem('control', { active: editor.isActive('subscript') })}
      >
        <Icon name="Subscript" />
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
