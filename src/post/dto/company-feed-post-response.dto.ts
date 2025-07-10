export class CompanyFeedPostMediaResponseDto {
  url: string;
  type: string;
  order: number;
}

export class CompanyFeedPostCompanyResponseDto {
  name: string;
  avatar: string;
}

export class CompanyFeedPostResponseDto {
  id: number;
  caption: string;
  created_at: Date;
  media: CompanyFeedPostMediaResponseDto[];
  company: CompanyFeedPostCompanyResponseDto;
} 