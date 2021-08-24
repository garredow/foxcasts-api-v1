import { RawEpisode } from './RawEpisode';

export type RawPodcast = {
  title: string;
  author: string;
  summary?: string;
  artworkUrl: string;
  episodes?: RawEpisode[];
};
