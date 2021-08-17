import { RawEpisode } from './RawEpisode';

export type RawPodcast = {
  title: string;
  author: string;
  summary: string;
  categories: string[];
  artworkUrl: string;
  artworkSmall?: string;
  artworkLarge?: string;
  episodes: RawEpisode[];
};