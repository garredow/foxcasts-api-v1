import {
  PIApiCategory,
  PIApiEpisodeInfo,
  PIApiFeed,
  PIApiPodcast,
} from 'podcastdx-client/dist/src/types';
import { Category, Episode, PIApiTrendingFeed, Podcast, SearchResult } from '../models';
import formatDate from './formatDate';

export function toSearchResult(source: PIApiFeed): SearchResult {
  return {
    podexId: source.id,
    title: source.title,
    author: source.author,
    feedUrl: source.url,
    artworkUrl: source.artwork || source.image,
    imageUrlHash: source.imageUrlHash,
  };
}

export function toTrendPodcast(source: PIApiTrendingFeed): Podcast {
  return {
    podexId: source.id,
    itunesId: source.itunesId || undefined,
    title: source.title,
    author: source.author,
    description: source.description,
    artworkUrl: source.image,
    feedUrl: source.url,
    categories: source.categories ? Object.keys(source.categories).map((a) => Number(a)) : [],
    trendScore: source.trendScore,
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
    feedUrl: source.url,
    lastUpdated: source.lastUpdateTime,
    categories: source.categories ? Object.keys(source.categories).map((a) => Number(a)) : [],
    imageUrlHash: source.imageUrlHash,
  };
}

export function toEpisode(source: PIApiEpisodeInfo): Episode {
  return {
    podexId: source.id,
    guid: source.guid,
    date: formatDate.toISOString(source.datePublished),
    title: source.title,
    description: source.description,
    duration: source.duration,
    fileSize: source.enclosureLength,
    fileType: source.enclosureType,
    fileUrl: source.enclosureUrl,
    chaptersUrl: source.chaptersUrl || undefined,
    transcriptUrl: source.transcriptUrl || undefined,
    season: source.season || undefined,
    episode: source.episode || undefined,
    episodeType: source.episodeType || undefined,
    soundbite: source.soundbite,
    soundbites: source.soundbites || [],
    imageUrl: source.image || undefined,
  };
}

export function toCategory(source: PIApiCategory): Category {
  return {
    id: source.id,
    name: source.name,
  };
}
