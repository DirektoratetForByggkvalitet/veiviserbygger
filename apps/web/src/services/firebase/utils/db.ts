import { collection, Firestore, QueryDocumentSnapshot } from 'firebase/firestore'

export function converter<T = any>() {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
  }
}

export function dataPoint<T extends object>(db: Firestore, ...collectionPath: string[]) {
  return collection(db, collectionPath[0], ...collectionPath.slice(1)).withConverter(converter<T>())
}
