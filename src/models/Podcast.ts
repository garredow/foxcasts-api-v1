export type Podcast = {
  podexId?: number;
  itunesId?: number;
  title: string;
  author: string;
  description?: string;
  artworkUrl: string;
  feedUrl: string;
  lastUpdated?: number;
  categories?: number[];
  trendScore?: number;
  imageUrlHash?: number;
};
