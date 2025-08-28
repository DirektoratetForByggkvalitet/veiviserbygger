import type { RedisClientType } from '@redis/client'
import { Firestore } from 'firebase-admin/firestore'
import { Storage } from 'firebase-admin/storage'

declare global {
  /**
   * Dependency container containing all the base dependencies
   */
  type DependencyContainer = {
    db: Firestore
    storage: Storage
    redis?: RedisClientType
  }
}
