import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  /**
   * Set a key-value pair in Redis
   * @param key - The key to set
   * @param value - The value to store
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.redisClient.setex(key, ttl, value);
    }
    return await this.redisClient.set(key, value);
  }

  /**
   * Set a key-value pair in Redis with JSON serialization
   * @param key - The key to set
   * @param value - The value to store (will be JSON stringified)
   * @param ttl - Time to live in seconds (optional)
   */
  async setJson<T>(key: string, value: T, ttl?: number): Promise<'OK'> {
    const jsonValue = JSON.stringify(value);
    return await this.set(key, jsonValue, ttl);
  }

  /**
   * Get a value from Redis by key
   * @param key - The key to retrieve
   */
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * Get a JSON value from Redis by key
   * @param key - The key to retrieve
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing JSON from Redis:', error);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   * @param key - The key to delete
   */
  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  /**
   * Delete multiple keys from Redis
   * @param keys - Array of keys to delete
   */
  async delMultiple(keys: string[]): Promise<number> {
    return await this.redisClient.del(...keys);
  }

  /**
   * Check if a key exists in Redis
   * @param key - The key to check
   */
  async exists(key: string): Promise<number> {
    return await this.redisClient.exists(key);
  }

  /**
   * Set expiration time for a key
   * @param key - The key to set expiration for
   * @param ttl - Time to live in seconds
   */
  async expire(key: string, ttl: number): Promise<number> {
    return await this.redisClient.expire(key, ttl);
  }

  /**
   * Get the time to live for a key
   * @param key - The key to check
   */
  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  /**
   * Increment a counter
   * @param key - The key to increment
   */
  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  /**
   * Decrement a counter
   * @param key - The key to decrement
   */
  async decr(key: string): Promise<number> {
    return await this.redisClient.decr(key);
  }

  /**
   * Add a value to a set
   * @param key - The set key
   * @param value - The value to add
   */
  async sadd(key: string, value: string): Promise<number> {
    return await this.redisClient.sadd(key, value);
  }

  /**
   * Get all members of a set
   * @param key - The set key
   */
  async smembers(key: string): Promise<string[]> {
    return await this.redisClient.smembers(key);
  }

  /**
   * Check if a value is a member of a set
   * @param key - The set key
   * @param value - The value to check
   */
  async sismember(key: string, value: string): Promise<number> {
    return await this.redisClient.sismember(key, value);
  }

  /**
   * Remove a value from a set
   * @param key - The set key
   * @param value - The value to remove
   */
  async srem(key: string, value: string): Promise<number> {
    return await this.redisClient.srem(key, value);
  }

  /**
   * Add a value to a hash
   * @param key - The hash key
   * @param field - The field name
   * @param value - The value to set
   */
  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.redisClient.hset(key, field, value);
  }

  /**
   * Get a value from a hash
   * @param key - The hash key
   * @param field - The field name
   */
  async hget(key: string, field: string): Promise<string | null> {
    return await this.redisClient.hget(key, field);
  }

  /**
   * Get all fields and values from a hash
   * @param key - The hash key
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hgetall(key);
  }

  /**
   * Delete a field from a hash
   * @param key - The hash key
   * @param field - The field name
   */
  async hdel(key: string, field: string): Promise<number> {
    return await this.redisClient.hdel(key, field);
  }

  /**
   * Flush all data from Redis (use with caution!)
   */
  async flushall(): Promise<'OK'> {
    return await this.redisClient.flushall();
  }

  /**
   * Get Redis client instance (for advanced operations)
   */
  getClient(): Redis {
    return this.redisClient;
  }
} 