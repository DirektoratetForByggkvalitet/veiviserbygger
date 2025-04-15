// import type { Pool } from 'pg'
// import type { RedisClientType } from '@redis/client'
// import { RequestHandler } from 'express'
import { Firestore } from 'firebase-admin/firestore'

declare global {
  /**
   * Dependency container containing all the base dependencies
   */
  type DependencyContainer = {
    db: Firestore
    // postgres: Pool
    // redis?: RedisClientType
    // /**
    //  * Middleware to check if the request has a valid JWT
    //  */
    // checkJwt: RequestHandler
  }
}
