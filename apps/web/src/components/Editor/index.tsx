import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
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
]

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
`

interface Props {
  label: string
}

export default function Editor({ label }: Props) {
  return (
    <div {...bem('')}>
      <span {...bem('label')}>{label}</span>

      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
        editorContainerProps={{ ...bem('input') }}
      />
    </div>
  )
}

function MenuBar() {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return (
    <div {...bem('menu')}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        {...bem('control', { active: editor.isActive('bold') })}
      >
        <Icon name="Bold" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        {...bem('control', { active: editor.isActive('italic') })}
      >
        <Icon name="Italic" />
      </button>

      <hr {...bem('separator')} />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        {...bem('control', { active: editor.isActive('bulletList') })}
      >
        <Icon name="List" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        {...bem('control', { active: editor.isActive('orderedList') })}
      >
        <Icon name="ListOrdered" />
      </button>

      <hr {...bem('separator')} />

      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        {...bem('control', { active: editor.isActive('paragraph') })}
      >
        P
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        {...bem('control', { active: editor.isActive('heading', { level: 1 }) })}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        {...bem('control', { active: editor.isActive('heading', { level: 2 }) })}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        {...bem('control', { active: editor.isActive('heading', { level: 3 }) })}
      >
        H3
      </button>
    </div>
  )
}
