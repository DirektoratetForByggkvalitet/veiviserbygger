import { ChangeEvent, useRef, useState } from 'react'
import BEMHelper from '@/lib/bem'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

type FileUploadProps = {
  label: string
  image?: string
  alt?: string
  accept?: string
  onFileUpload: (file: File) => void
  removeFile: () => void
}

export default function FileUpload({
  label,
  image,
  alt,
  accept = 'image/*',
  onFileUpload,
  removeFile,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
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

  return (
    <label {...bem('')}>
      <div {...bem('wrapper')}>
        <span {...bem('label')}>{label}</span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          {...bem('input')}
          accept={accept}
        />
        {!image ? (
          <Button size="small" onClick={triggerFileDialog}>
            Legg til
          </Button>
        ) : (
          <Dropdown
            icon="Ellipsis"
            direction="right"
            options={[
              {
                value: '0',
                label: 'Fjern bilde',
                onClick: removeFile,
                styled: 'delete',
              },
            ]}
            label="Valg"
            iconOnly
          />
        )}
      </div>
      {preview || image ? (
        <div {...bem('preview-container')}>
          <img src={preview || image} alt={alt} {...bem('preview')} />
        </div>
      ) : null}
    </label>
  )
}
