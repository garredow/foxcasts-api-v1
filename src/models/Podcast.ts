import { Episode } from './Episode';

export type Podcast = {
  podexId?: number;
  itunesId?: number;
  title: string;
  author: string;
  description?: string;
  artworkUrl: string;
  lastUpdated?: number;
  categories: string[];
  episodes?: Episode[];
};
