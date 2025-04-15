import { Firestore, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { DataPoint } from 'shared/firestore'

export function converter<T = any>() {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
  }
}

export function dataPoint<T extends object>(db: Firestore, dataPoint: DataPoint<T>) {
  return db.collection(dataPoint.path.toString()).withConverter(dataPoint.converter)
}
