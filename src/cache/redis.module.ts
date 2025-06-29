import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global() // This makes the Redis module globally available in your app
@Module({
  imports: [ConfigModule], // Import ConfigModule to access environment variables
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        // Retrieve Redis configuration from environment variables using ConfigService
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        if (!redisHost || !redisPort || !redisPassword) {
          throw new Error('Redis configuration is missing');
        }

        // Create a new Redis client with the configuration
        const redis = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
        });

        // Optional: You can listen to events like connection success and errors
        redis.on('connect', () => {
          console.log('Successfully connected to Redis');
        });

        redis.on('error', (err) => {
          console.error('Redis error:', err);
        });

        return redis;
      },
      inject: [ConfigService], // Inject ConfigService to access the environment variables
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService], // Export Redis client for use in other modules
})
export class RedisModule {}
