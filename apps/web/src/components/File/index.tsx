import { ChangeEvent, useRef, useState } from 'react'
import BEMHelper from '@/lib/bem'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import styles from './Styles.module.scss'
import { useEditable } from '@/hooks/useEditable'

const bem = BEMHelper(styles)

type FileUploadProps = {
  label: string
  image?: string
  alt?: string
  accept?: string
  onFileUpload: (file: File) => void
  removeFile: () => void
  onAltChange: (v: string) => void
}

export default function FileUpload({
  label,
  image,
  alt,
  accept = 'image/*',
  onFileUpload,
  removeFile,
  onAltChange,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditable = useEditable()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      setIsUploading(true)
      onFileUpload(selectedFile)

      // Generate a preview URL
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreview(fileReader.result as string)
      }
      fileReader.readAsDataURL(selectedFile)
    }
  }

  const triggerFileDialog = () => {
    fileInputRef.current?.click()
  }

  const triggerRemoveFile = () => {
    setIsUploading(false)
    removeFile()
  }

  const handleAltChange = (event: ChangeEvent<HTMLInputElement>) => {
    const alt = event.target.value as HTMLInputElement['value']
    onAltChange(alt)
  }

  if (!isEditable && !image && !preview) {
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
          {!image ? (
            <Button size="small" onClick={triggerFileDialog} loading={isUploading}>
              {isUploading ? 'Laster opp...' : 'Legg til'}
            </Button>
          ) : (
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
          )}
        </div>
      )}
      {preview || image ? (
        <>
          <div {...bem('preview-container')}>
            <img src={preview || image} alt={alt} {...bem('preview')} />
          </div>
          <label {...bem('alt-input')}>
            Alternativ tekst:
            <input type="text" onChange={handleAltChange} value={alt} />
          </label>
        </>
      ) : null}
    </label>
  )
}
