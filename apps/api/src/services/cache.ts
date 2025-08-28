import { createClient, type RedisClientType } from '@redis/client'
import { IS_JEST } from '../constants'

export async function getCache() {
  if (!process.env.REDIS_URL) {
    console.warn('⛔️ REDIS_URL is not set, skipping redis connection')
    return
  }

  const redis = createClient({
    url: process.env.REDIS_URL,
  })

  redis.on('error', (err) => {
    !IS_JEST && console.error('Redis Client Error', err)
  })

  await redis.connect()
  !IS_JEST && console.log('Connected to redis')

  return redis
}

export async function set(
  redis: RedisClientType | undefined,
  key: string,
  value: any,
  /**
   * Cache item TTL in seconds. Default is 60 seconds.
   */
  ttl = 60,
) {
  if (!redis) {
    console.warn('🧠 Redis is not initialized, nothing is cached')
    return
  }

  await redis.setEx(key, ttl, JSON.stringify(value))
}

export async function get(
  redis: RedisClientType | undefined,
  key: string,
  raw: true,
): Promise<string | undefined>

export async function get<T = any>(
  redis: RedisClientType | undefined,
  key: string,
  raw?: false,
): Promise<T | undefined>

export async function get<T = any>(
  redis: RedisClientType | undefined,
  key: string,
  raw?: boolean,
): Promise<T | string | undefined> {
  if (!redis) return undefined

  const data = await redis.get(key)
  if (!data) return undefined

  if (raw) {
    return data
  }

  return JSON.parse(data) as T
}
