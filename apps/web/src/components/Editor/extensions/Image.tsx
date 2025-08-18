import Image from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewProps, ReactNodeViewRenderer } from '@tiptap/react'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import Icon from '@/components/Icon'
import Button from '@/components/Button'

const bem = BEMHelper(styles)

// Extend Tiptap's core Image node to add custom attributes and attach the React NodeView
export const CustomImage = Image.extend({
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

  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent)
  },
})

function CustomImageComponent({ node, selected, updateAttributes, editor }: ReactNodeViewProps) {
  const { alt, src } = node.attrs

  return (
    <NodeViewWrapper>
      <figure {...bem('', { active: selected })}>
        <img src={src} alt={node.attrs.alt || ''} />

        {selected && (
          <>
            <label {...bem('alt-text')}>
              Alternativ tekst:
              <input
                type="text"
                name="alt"
                placeholder="Mangler alternativ tekst for bildet"
                value={alt || ''}
                contentEditable
                suppressContentEditableWarning
                onChange={(e) => {
                  const newAlt = e.target.value || ''
                  updateAttributes({ alt: newAlt })
                }}
              />
            </label>

            <Button
              size="small"
              {...bem('remove')}
              onClick={() => editor.chain().focus().deleteSelection().run()}
            >
              Fjern bilde <Icon name="Trash" />
            </Button>
          </>
        )}
      </figure>
    </NodeViewWrapper>
  )
}
