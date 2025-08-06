import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { UserNewsPost } from '../entities/user_news_post.entity';
import { PostService } from './post.service';
import { CreateUserNewsPostDto } from '../dto/create-user-news-post.dto';
// Giả định UserNewsPostService đã tồn tại và được import đúng

export interface Block {
  type: 'text' | 'image';
  content: string;
  media_url?: string;
  order: number;
}

export interface ArticleDetail {
  title: string;
  summary: string;
  cover_image: string | null;
  blocks: Block[];
  categoryId?: string | null;
  tags?: string[];
}

@Injectable()
export class NewscrawlService {
  private readonly logger = new Logger(NewscrawlService.name);

  constructor(
    // Thêm UserNewsPostService vào constructor để sử dụng
    private readonly userNewsPostService: PostService,
  ) {}

  async crawlVnExpressCategory(
    userId: string, // Thêm userId vào tham số
    catePath: string,
    categoryId?: string,
    tags?: string[],
  ) {
    const url = `https://vnexpress.net/${catePath}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

    await this.autoScroll(page);

    const links = await page.$$eval('article', (nodes) =>
      nodes
        .map((article) => {
          const titleElement = article.querySelector(
            'h2.title-news, h3.title-news, h4.title-news',
          );
          const link =
            titleElement?.querySelector('a')?.getAttribute('href') || '';
          return link.startsWith('http')
            ? link
            : 'https://vnexpress.net' + link;
        })
        .filter((link) => link !== 'https://vnexpress.net'),
    );

    await browser.close();

    if (!links.length) {
      this.logger.warn(
        `Không tìm thấy đường link nào cho chuyên mục "${catePath}".`,
      );
      return [];
    } else {
      this.logger.log(
        `Đã crawl được ${links.length} đường link từ chuyên mục "${catePath}".`,
      );
    }

    const BATCH_SIZE = 5;
    const allFulfilledCrawlResults: ArticleDetail[] = [];
    const totalBatches = Math.ceil(links.length / BATCH_SIZE);

    this.logger.log(
      `Bắt đầu crawl chi tiết ${links.length} bài viết theo ${totalBatches} batches (kích thước batch: ${BATCH_SIZE}).`,
    );

    for (let i = 0; i < links.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batchLinks = links.slice(i, i + BATCH_SIZE);

      this.logger.log(
        `Bắt đầu crawl batch ${batchNumber}/${totalBatches} (${batchLinks.length} bài viết)...`,
      );

      const results = await Promise.allSettled(
        batchLinks.map((link) =>
          this.crawlArticleDetail(link, categoryId, tags),
        ),
      );

      const fulfilledResults = results.filter(
        (result) => result.status === 'fulfilled',
      );

      const rejectedResults = results.filter(
        (result) => result.status === 'rejected',
      );

      this.logger.log(
        `Hoàn thành batch ${batchNumber}/${totalBatches}: Thành công ${fulfilledResults.length}/${batchLinks.length}, Thất bại ${rejectedResults.length}/${batchLinks.length}.`,
      );

      if (rejectedResults.length > 0) {
        this.logger.error(`Chi tiết lỗi của batch ${batchNumber}:`);
        rejectedResults.forEach((result) =>
          this.logger.error(`    - ${result.reason}`),
        );
      }

      allFulfilledCrawlResults.push(
        ...fulfilledResults.map((result) => result.value),
      );
    }

    this.logger.log(
      `Đã hoàn thành toàn bộ quá trình crawl. Tổng số bài viết thành công: ${allFulfilledCrawlResults.length}/${links.length}.`,
    );

    // =======================================================================
    // Phần mới: Gọi hàm createUserNewsPost cho từng bài viết đã crawl thành công
    // =======================================================================
    if (allFulfilledCrawlResults.length > 0) {
      this.logger.log(
        `Bắt đầu tạo ${allFulfilledCrawlResults.length} bài viết mới...`,
      );

      const createResults = await Promise.allSettled(
        allFulfilledCrawlResults.map((dto) =>
          this.userNewsPostService.createUserNewsPost(
            userId,
            dto as CreateUserNewsPostDto,
          ),
        ),
      );

      const fulfilledCreateResults = createResults.filter(
        (result) => result.status === 'fulfilled',
      );
      const rejectedCreateResults = createResults.filter(
        (result) => result.status === 'rejected',
      );

      this.logger.log(`Hoàn thành tạo bài viết:`);
      this.logger.log(
        `  - Thành công: ${fulfilledCreateResults.length} bài viết.`,
      );
      this.logger.log(
        `  - Thất bại: ${rejectedCreateResults.length} bài viết.`,
      );

      if (rejectedCreateResults.length > 0) {
        this.logger.error(`Chi tiết lỗi khi tạo bài viết:`);
        rejectedCreateResults.forEach((result) =>
          this.logger.error(`    - ${result.reason}`),
        );
      }
    } else {
      this.logger.warn(
        `Không có bài viết nào được tạo vì quá trình crawl không thành công.`,
      );
    }

    return allFulfilledCrawlResults;
  }

  // Hàm scroll toàn trang để tránh lazy-loading
  private async autoScroll(page: puppeteer.Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
  }

  async crawlArticleDetail(
    link: string,
    categoryId?: string,
    tags?: string[],
  ): Promise<ArticleDetail> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const data = await page.evaluate(() => {
        let title = '';
        let summary = '';
        let cover_image: string | null = null;
        const blocks: Block[] = [];
        let order = 1;

        // Lấy tiêu đề từ meta hoặc title
        const metaTitle = document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute('content');
        title = metaTitle || document.title;

        // Lấy mô tả từ meta
        const metaDescription = document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute('content');
        summary = metaDescription || '';

        const contentElements = document.querySelectorAll(
          '.fck_detail > p, .fck_detail > figure',
        );

        contentElements.forEach((el) => {
          if (el.tagName === 'P') {
            const text = (el as HTMLParagraphElement).textContent?.trim() || '';
            if (text.length > 50) {
              if (!summary) {
                summary = text.substring(0, 200) + '...';
              }
              blocks.push({
                type: 'text',
                content: text,
                order: order++,
              });
            }
          } else if (el.tagName === 'FIGURE') {
            const img = el.querySelector('img');
            const imgSrc =
              img?.getAttribute('data-src') || img?.getAttribute('src');
            if (imgSrc) {
              if (!cover_image) {
                cover_image = imgSrc;
              }
              const caption =
                el.querySelector('figcaption')?.textContent?.trim() ||
                img?.alt ||
                '';
              blocks.push({
                type: 'image',
                content: caption,
                media_url: imgSrc,
                order: order++,
              });
            }
          }
        });

        if (!cover_image && blocks.length > 0) {
          const firstImg = blocks.find((b) => b.type === 'image');
          if (firstImg) {
            cover_image = (firstImg as any).media_url;
          }
        }

        return {
          title,
          summary,
          cover_image,
          blocks,
        };
      });

      await browser.close();

      return {
        ...data,
        categoryId: categoryId || null,
        tags: tags || [],
      };
    } catch (error) {
      await browser.close();
      throw new Error(`Crawl detail failed for ${link}: ${error}`);
    }
  }
}
