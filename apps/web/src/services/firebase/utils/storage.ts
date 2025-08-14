import { getFile } from '@/services/api'
import { deleteObject, listAll, ref, StorageReference, uploadBytes } from 'firebase/storage'

export async function copyFiles(sourceRef: StorageReference, destinationRef: StorageReference) {
  const items = await listAll(sourceRef)

  if (items.items.length > 0) {
    console.log(
      `Copying ${items.items.length} files from ${sourceRef.fullPath} to ${destinationRef.fullPath}`,
    )

    for (const item of items.items) {
      const data = await getFile(item.fullPath)
      await uploadBytes(ref(destinationRef, item.name), data)
      console.log(`Copied file: ${item.fullPath} to ${destinationRef.fullPath}/${item.name}`)
    }
  }

  for (const prefix of items.prefixes) {
    const newDestinationRef = ref(destinationRef, prefix.name)
    await copyFiles(prefix, newDestinationRef)
  }
}

export async function deleteFiles(ref: StorageReference) {
  const items = await listAll(ref)

  if (items.items.length > 0) {
    console.log(`Deleting ${items.items.length} files in ${ref.fullPath}`)

    for (const item of items.items) {
      await deleteObject(item)
      console.log(`Deleted file: ${item.fullPath}`)
    }
  }

  for (const prefix of items.prefixes) {
    await deleteFiles(prefix)
  }

  console.log(`Deleting empty folder: ${ref.fullPath}`)
}
