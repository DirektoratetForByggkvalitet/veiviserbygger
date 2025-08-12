import { EditorEvents, EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Icon from '@/components/Icon'

import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useEditable } from '@/hooks/useEditable'
import { useValue } from '@/hooks/useValue'
import BEMHelper from '@/lib/bem'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Image from '@tiptap/extension-image'
import { v4 as uuid } from 'uuid'

import { useRef } from 'react'
import styles from './Styles.module.scss'
import { DocumentReference } from 'firebase/firestore'
import useFirebase from '@/hooks/useFirebase'
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

  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),

        // extend the image with a storage reference attribute
        // this is used to store the firebase storage path of the image
        storageRef: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-firebase-storage'),
          renderHTML: (attributes) => {
            if (!attributes.storageRef) return {}
            return {
              'data-firebase-storage': attributes.storageRef,
            }
          },
        },
      }
    },
  }),
]

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
}

export default function Editor({ label, value, onChange, sourceRef }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const v = useValue(value, onChange)
  const { storage } = useFirebase()
  const isEditable = useEditable()

  const handleLabelClick = () => {
    if (isEditable) {
      const input = wrapperRef.current?.querySelector('div[contenteditable="true"]') as HTMLElement

      if (input) {
        input.focus()
      }
    }
  }

  /**
   * Clean up the image from firebase storage when the image node is deleted
   */
  const handleNodeDelete = async (props: EditorEvents['delete']) => {
    if (props.type !== 'node') return
    if (props.node.type.name !== 'image') return

    if (!props.node.attrs.storageRef) return

    const imageRef = storageRef(storage, props.node.attrs.storageRef)

    try {
      await deleteObject(imageRef)
      console.log('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  if (isEditable) {
    return (
      <section {...bem('')} ref={wrapperRef}>
        <h3 {...bem('label')} onClick={handleLabelClick}>
          {label}
        </h3>

        <EditorProvider
          slotBefore={<MenuBar sourceRef={sourceRef} />}
          extensions={extensions}
          content={v.value}
          editorContainerProps={{ ...bem('input') }}
          onUpdate={(content) => v.onChange(content.editor.getHTML())}
          onDelete={handleNodeDelete}
        />
      </section>
    )
  } else {
    if (!v.value) {
      return null
    }
    return (
      <section {...bem('', 'read-only')}>
        <label {...bem('label')}>{label}</label>
        <div dangerouslySetInnerHTML={{ __html: v.value }} {...bem('input', '', 'tiptap')}></div>
      </section>
    )
  }
}

function MenuBar({ sourceRef }: { sourceRef: Props['sourceRef'] }) {
  const { storage } = useFirebase()
  const { editor } = useCurrentEditor()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      label: 'Tekst',
      icon: 'Text',
      value: 'p',
    },
    {
      label: 'Overskrift',
      icon: 'Heading2',
      value: 'h2',
    },
    {
      label: 'Underoverskrift',
      icon: 'Heading3',
      value: 'h3',
    },
  ] as DropdownOptions

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const storageRefPath = storageRef(
        storage,
        `${sourceRef.doc.path}/${sourceRef.path.join('/')}/${uuid()}`,
      )

      // Upload the file to Firebase Storage
      await uploadBytes(storageRefPath, file)

      // Get the download URL for the uploaded file
      const url = await getDownloadURL(storageRefPath)

      // Insert the image into the editor
      editor.commands.insertContent({
        type: 'image',
        attrs: {
          storageRef: storageRefPath.fullPath,
          src: url,
        },
      })
      editor.commands.focus()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Clear the file input after upload
      }
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
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

      <button type="button" onClick={handleImageUpload} {...bem('control')}>
        <Icon name="ImagePlus" />
      </button>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <hr {...bem('separator')} />

      <Dropdown value={textStyle} options={textStyles} onChange={handleStyleChange} simple />
    </div>
  )
}
