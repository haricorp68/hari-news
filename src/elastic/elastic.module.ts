import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticService } from './elastic.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node:
        process.env.ELASTICSEARCH_NODE ||
        'https://my-elasticsearch-project-b15c6f.es.asia-south1.gcp.elastic.cloud:443',
      auth: {
        apiKey:
          process.env.ELASTIC_API_KEY ||
          'QkxYdVBwZ0J6MVFSNE9sXzVWXzQ6cWxpQ0g5MEFzc2RPRHdLSEtLU2EzQQ==', // chỉ cần cái này
      },
      // Optional: để xem log query
      // sniffOnStart: true,
      // ssl: { rejectUnauthorized: false }, // nếu dùng self-signed cert (cloud thường không cần)
    }),
  ],
  providers: [ElasticService],
  exports: [ElasticService],
})
export class ElasticModule {}
