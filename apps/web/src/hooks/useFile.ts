import { getDownloadURL, ref, StorageReference, uploadBytes, deleteObject } from 'firebase/storage'
import { useEffect, useMemo, useState } from 'react'
import useFirebase from './useFirebase'

type State = 'loading' | 'empty' | 'ready' | 'uploading'

export default function useFile(
  /**
   * Full path to firebase storage file
   */
  path?: string,
) {
  const { storage } = useFirebase()
  const [state, setState] = useState<State>()
  const [url, setUrl] = useState<string | null>()
  const storageRef = useMemo(() => {
    if (!path) return null
    return ref(storage, path) as StorageReference
  }, [path])

  useEffect(() => {
    if (!storageRef) {
      setUrl(null)
      setState('empty')
      return
    }

    setState('loading')

    getDownloadURL(storageRef)
      .then((downloadURL) => {
        setUrl(downloadURL)
        setState('ready')
      })
      .catch((error) => {
        if (error.code === 'storage/object-not-found') {
          setUrl(null)
          setState('empty')
        }
      })
  }, [path])

  async function remove() {
    if (!storageRef) {
      console.error('No storage reference provided for removal.')
      return
    }

    setState('loading')

    try {
      await deleteObject(storageRef)
      setUrl(null)
      setState('empty')
    } catch (error) {
      console.error('Error removing file:', error)
      setState('ready') // Revert to ready state if deletion fails
    }
  }

  async function upload(file: File) {
    if (!storageRef) {
      console.error('No storage reference provided for upload.')
      return
    }

    setState('uploading')

    const snapshot = await uploadBytes(storageRef, file)

    setState('ready')
    setUrl(await getDownloadURL(snapshot.ref))
  }

  return { state, upload, remove, url }
}
