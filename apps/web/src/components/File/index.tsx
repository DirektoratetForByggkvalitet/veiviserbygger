import { ChangeEvent, useMemo, useRef, useState } from 'react'
import BEMHelper from '@/lib/bem'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import styles from './Styles.module.scss'
import { useEditable } from '@/hooks/useEditable'
import { deleteField, DocumentReference, updateDoc } from 'firebase/firestore'
import { ref as storageRef } from 'firebase/storage'
import useFirebase from '@/hooks/useFirebase'
import useFile from '@/hooks/useFile'
import { useVersion } from '@/hooks/useVersion'
import { useValue } from '@/hooks/useValue'

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
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
  accept?: string
}

export default function File({ label, value, sourceRef, accept = 'image/*' }: FileProps) {
  const { storage } = useFirebase()
  const { patch } = useVersion()
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const altInputRef = useRef<HTMLInputElement>(null)
  const isEditable = useEditable()
  const storageRefPath = useMemo(
    () => storageRef(storage, `${sourceRef.doc.path}/${sourceRef.path.join('/')}`).fullPath,
    [sourceRef.doc.path, sourceRef.path],
  )
  const { url, state, upload, remove } = useFile(storageRefPath)

  const { value: alt, onChange: onAltChange } = useValue(
    value?.alt || '',
    (v) =>
      updateDoc(sourceRef.doc, {
        [`${sourceRef.path.join('.')}.alt`]: v,
      }),
    altInputRef,
  )

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
        await upload(selectedFile)
        await patch(sourceRef.doc, sourceRef.path, {
          file: storageRefPath,
        })

        fileReader.onload = null
        setPreview(null)
      } catch (error) {
        console.error('Error uploading file:', error)
        setPreview(null)
      }
    }
  }

  const triggerFileDialog = () => {
    fileInputRef.current?.click()
  }

  const triggerRemoveFile = async () => {
    await remove()

    await updateDoc(sourceRef.doc, {
      [`${sourceRef.path.join('.')}.file`]: deleteField(),
    })
  }

  const handleAltChange = (event: ChangeEvent<HTMLInputElement>) => {
    const alt = event.target.value as HTMLInputElement['value']
    onAltChange(alt)
  }

  if (!isEditable && !value && !preview) {
    return null
  }

  return (
    <div {...bem('', { 'read-only': !isEditable })}>
      {isEditable && (
        <label {...bem('wrapper')}>
          <span {...bem('label')}>{label}</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            {...bem('file-input')}
            accept={accept}
          />
        </label>
      )}

      <span {...bem('options')}>
        {state === 'ready' ? (
          <Dropdown
            icon="Ellipsis"
            direction="right"
            options={[
              {
                value: '0',
                label: 'Erstatt bilde',
                onClick: triggerFileDialog,
              },
              {
                value: '1',
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

      {preview || url ? (
        <>
          <div {...bem('preview-container')}>
            <img src={preview || url || ''} alt={alt} {...bem('preview')} />
          </div>

          <label {...bem('alt-input')}>
            Alternativ tekst:
            <input
              type="text"
              ref={altInputRef}
              onChange={handleAltChange}
              value={alt}
              placeholder="Legg til"
            />
          </label>
        </>
      ) : null}
    </div>
  )
}
