import { ChangeEvent, MouseEventHandler, useRef, useState } from 'react'
import BEMHelper from '@/lib/bem'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import styles from './Styles.module.scss'
import { useEditable } from '@/hooks/useEditable'
import { deleteField, DocumentReference } from 'firebase/firestore'
import { StorageReference, ref as storageRef } from 'firebase/storage'
import useFirebase from '@/hooks/useFirebase'
import useFile from '@/hooks/useFile'
import { useVersion } from '@/hooks/useVersion'

const bem = BEMHelper(styles)

type FileProps = {
  label: string
  value?: {
    alt?: string
    /**
     * Firebase Storage path
     */
    file?: string
  }
  type?: 'image' | 'file'
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
  accept?: string
}

export default function File({
  label,
  value,
  sourceRef,
  type,
  accept = 'image/*',
}: FileProps) {
  const { file, alt = '' } = value || {}

  const { storage, } = useFirebase()
  const { patch } = useVersion()
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditable = useEditable()
  const { url, state, upload, remove } = useFile(file)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]

      // Generate a preview URL while uploading...
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreview(fileReader.result as string)
      }
      fileReader.readAsDataURL(selectedFile)

      // Perform the upload
      try {
        if (!value?.file) {
          await patch(sourceRef.doc, sourceRef.path, {
            file: storageRef(storage, `${sourceRef.doc.path}/${sourceRef.path.join('/')}`).fullPath,
          })
        }

        await upload(selectedFile)
        fileReader.onload = null
        setPreview(null)
      } catch (error) {
        console.error('Error uploading file:', error)
        setPreview(null)
      }
    }
  }

  const triggerFileDialog = () => {
    // fileInputRef.current?.click()
    console.log('asdlkj')
  }

  const triggerRemoveFile = async () => {
    await remove()

    await patch(sourceRef.doc, sourceRef.path, {
      file: deleteField(),
    })
  }

  const handleAltChange = (event: ChangeEvent<HTMLInputElement>) => {
    const alt = event.target.value as HTMLInputElement['value']
    // onAltChange(alt)
  }

  if (!isEditable && !value && !preview) {
    return null
  }

  return (
    <label {...bem('', { 'read-only': !isEditable })}>
      {isEditable && (
        <div {...bem('wrapper')}>
          <span {...bem('label')}>{label}</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            {...bem('file-input')}
            accept={accept}
          />
        </div>
      )}

      <span {...bem('options')}>
        {state === 'ready' ? (
          <Dropdown
            icon="Ellipsis"
            direction="right"
            options={[
              {
                value: '0',
                label: 'Fjern bilde',
                onClick: triggerRemoveFile,
                styled: 'delete',
              },
            ]}
            label="Valg"
            iconOnly
          />
        ) : (
          <Button size="small" onClick={triggerFileDialog} loading={state === 'uploading'}>
            {state === 'uploading' ? 'Laster opp...' : 'Legg til'}
          </Button>
        )}
      </span>

      {preview || value ? (
        <>
          <div {...bem('preview-container')}>
            <img src={preview || url || ''} alt={alt} {...bem('preview')} />
          </div>

          <label {...bem('alt-input')}>
            Alternativ tekst:
            <input type="text" onChange={handleAltChange} value={alt} placeholder="Legg til" />
          </label>
        </>
      ) : null}
    </label>
  )
}
