// import type { Pool } from 'pg'
// import type { RedisClientType } from '@redis/client'
import { Requests } from 'types'
import { RequestHandler } from 'express'

declare global {
  /**
   * Dependency container containing all the base dependencies
   */
  type DependencyContainer = {
    /**
     * Middleware to check if the request has a valid JWT
     */
    // checkJwt: RequestHandler
    // postgres: Pool
    // redis?: RedisClientType
  }

  interface Window {
    config: Requests['/config']['GET']['response'] | undefined
  }
}
