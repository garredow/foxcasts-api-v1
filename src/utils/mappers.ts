import {
  PIApiEpisodeInfo,
  PIApiFeed,
  PIApiPodcast,
} from 'podcastdx-client/dist/src/types';
import { Episode, Podcast, SearchResult } from '../models';
import formatDate from './formatDate';

export function toSearchResult(source: PIApiFeed): SearchResult {
  return {
    podexId: source.id,
    title: source.title,
    author: source.author,
    feedUrl: source.url,
    artworkUrl: source.artwork,
  };
}

export function toPodcast(source: PIApiPodcast): Podcast {
  return {
    podexId: source.id,
    itunesId: source.itunesId || undefined,
    title: source.title,
    author: source.author,
    description: source.description,
    artworkUrl: source.artwork,
    lastUpdated: source.lastUpdateTime,
    categories: source.categories ? Object.values(source.categories) : [],
  };
}

export function toEpisode(source: PIApiEpisodeInfo): Episode {
  return {
    date: formatDate.toISOString(source.datePublished),
    title: source.title,
    description: source.description,
    duration: source.duration,
    fileSize: source.enclosureLength,
    fileType: source.enclosureType,
    fileUrl: source.enclosureUrl,
    chaptersUrl: source.chaptersUrl || undefined,
    transcriptUrl: source.transcriptUrl || undefined,
  };
}
