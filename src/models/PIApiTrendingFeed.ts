export interface PIApiTrendingFeed {
  id: number;
  url: string;
  title: string;
  description: string;
  author: string;
  image: string;
  newestItemPublishTime: number;
  itunesId: number | null;
  trendScore: number;
  language: string;
  categories: {
    [k: string]: string;
  } | null;
}
