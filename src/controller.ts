import { FastifyReply, FastifyRequest } from 'fastify';
import jsmediatags from 'jsmediatags';
import fetch from 'node-fetch';
import Vibrant from 'node-vibrant';
import PodcastIndexClient from 'podcastdx-client';
import sharp from 'sharp';
import { Episode, PIApiTrendingFeed, Podcast, SearchResult } from './models';
import { cleanUrl } from './utils/cleanUrl';
import { config } from './utils/config';
import { getEpisodesFromFeed } from './utils/getEpisodesFromFeed';
import { getPodcastFromFeed } from './utils/getPodcastFromFeed';
import { toCategory, toEpisode, toPodcast, toSearchResult, toTrendPodcast } from './utils/mappers';
import { tryParseChapters } from './utils/tryParseChapters';
const { version: apiVersion } = require('../package.json');

console.log('Booted with config', config);

const client = new PodcastIndexClient({
  key: config.podcastIndex.apiKey,
  secret: config.podcastIndex.apiSecret,
  // opt-out of analytics collection
  disableAnalytics: true,
});

interface SearchQuery {
  query: string;
  count: number;
}

export async function search(request: FastifyRequest<{ Querystring: SearchQuery }>) {
  const result: SearchResult[] = await client
    .search(request.query.query, { max: request.query.count })
    .then((res) => res.feeds.map((a) => toSearchResult(a)));

  return result;
}

interface GetTrendingQuery {
  categories?: string;
  since: number;
}
interface GetTrendingResponse {
  feeds: PIApiTrendingFeed[];
  count: number;
}

export async function getTrending(request: FastifyRequest<{ Querystring: GetTrendingQuery }>) {
  let url = `/podcasts/trending?since=${request.query.since}`;
  if (request.query.categories) {
    url = url + `&cat=${request.query.categories}`;
  }
  const result: Podcast[] = await client
    .raw<GetTrendingResponse>(url)
    .then((res) => res.feeds.map((a) => toTrendPodcast(a)));

  return result;
}

interface GetPodcastQuery {
  id?: number;
  feedUrl?: string;
}

export async function getPodcast(request: FastifyRequest<{ Querystring: GetPodcastQuery }>) {
  let podcast: Podcast | undefined;

  // Try Podcast Index ID
  if (request.query.id) {
    await client.podcastById(request.query.id).then((res) => {
      if (res.feed?.id) {
        podcast = toPodcast(res.feed);
      }
    });
  }

  // Try Feed URL
  if (!podcast) {
    await client.podcastByUrl(request.query.feedUrl!).then((res) => {
      if (res.feed?.id) {
        podcast = toPodcast(res.feed);
      }
    });
  }

  // Manually parse the feed XML
  if (!podcast) {
    podcast = await getPodcastFromFeed(request.query.feedUrl!);
  }

  return podcast;
}

interface GetEpisodesQuery {
  podcastId?: number;
  feedUrl?: string;
  since?: number;
  count: number;
}

export async function getEpisodes(request: FastifyRequest<{ Querystring: GetEpisodesQuery }>) {
  let episodes: Episode[] | null = null;

  // Try Podcast Index ID
  if (request.query.podcastId) {
    await client
      .episodesByFeedId(request.query.podcastId, {
        max: request.query.count,
        since: request.query.since,
      })
      .then((res) => {
        if (res.items) {
          episodes = res.items.map((a) => toEpisode(a));
        }
      });
  }

  // Try Feed URL
  if (episodes === null) {
    await client
      .episodesByFeedUrl(request.query.feedUrl!, {
        max: request.query.count,
        since: request.query.since,
      })
      .then((res) => {
        if (res.items) {
          episodes = res.items.map((a) => toEpisode(a));
        }
      });
  }

  // Manually parse the feed XML
  if (episodes === null) {
    episodes = await getEpisodesFromFeed(request.query.feedUrl!, {
      episodeLimit: request.query.count,
      since: request.query.since ? new Date(request.query.since).toISOString() : undefined,
    });
  }

  return episodes;
}

interface ChaptersQuery {
  episodeId?: number;
  fileUrl?: string;
}

export async function getChapters(request: FastifyRequest<{ Querystring: ChaptersQuery }>) {
  if (request.query.episodeId === 0 && !request.query.fileUrl) {
    return [];
  }

  const episode = request.query.episodeId
    ? (await client.episodeById(request.query.episodeId)).episode
    : null;

  if (episode?.chaptersUrl) {
    const result = await fetch(episode.chaptersUrl).then((res) => res.json());
    return result?.chapters || [];
  }

  // jsmediatags doesn't seem to like a lot of redirects, so let's
  // try to clean up this URL a bit
  const url = episode?.enclosureUrl || request.query.fileUrl;
  if (!url) {
    return [];
  }
  const cleanerUrl = cleanUrl(url);
  const id3Obj = await new Promise((resolve, reject) => {
    new jsmediatags.Reader(cleanerUrl).setTagsToRead(['CHAP']).read({
      onSuccess: resolve,
      onError: reject,
    });
  });
  const chapters = tryParseChapters(id3Obj);
  return chapters;
}

interface GetArtworkQuery {
  imageUrl: string;
  size: number;
  blur?: number;
  greyscale: boolean;
}

export async function getArtwork(
  request: FastifyRequest<{ Querystring: GetArtworkQuery }>,
  reply: FastifyReply
) {
  try {
    const image = await fetch(request.query.imageUrl).then((res) => res.buffer());

    const artwork = sharp(image).resize(request.query.size);

    if (request.query.blur) {
      artwork.blur(request.query.blur);
    }
    if (request.query.greyscale) {
      artwork.greyscale(request.query.greyscale);
    }

    const result = await artwork.png().toBuffer();

    reply.status(200).header('Content-Type', 'image/png').send(result);
  } catch (err) {
    request.log.error((err as Error)?.message);
    reply.status(500).send({ statusCode: 500, error: 'API Error', message: '' });
  }
}

interface GetArtworkWithPaletteRequest {
  imageUrl: string;
  size: number;
  blur?: number;
  greyscale: boolean;
}

export async function getArtworkWithPalette(
  request: FastifyRequest<{ Querystring: GetArtworkWithPaletteRequest }>,
  reply: FastifyReply
) {
  try {
    const image = await fetch(request.query.imageUrl).then((res) => res.buffer());

    const artwork = sharp(image).resize(request.query.size);

    if (request.query.blur) {
      artwork.blur(request.query.blur);
    }
    if (request.query.greyscale) {
      artwork.greyscale(request.query.greyscale);
    }

    const result = await artwork.png().toBuffer();
    const palette = await Vibrant.from(result).getPalette();

    reply.status(200).send({
      imageData: `data:image/png;base64,${await result.toString('base64')}`,
      darkMuted: palette.DarkMuted?.hex,
      darkVibrant: palette.DarkVibrant?.hex,
      lightMuted: palette.LightMuted?.hex,
      lightVibrant: palette.LightVibrant?.hex,
      muted: palette.Muted?.hex,
      vibrant: palette.Vibrant?.hex,
    });
  } catch (err) {
    request.log.error((err as Error)?.message);
    reply.status(500).send({ statusCode: 500, error: 'API Error', message: '' });
  }
}

interface GetArtworkColorsQuery {
  imageUrl: string;
}

export async function getArtworkPalette(
  request: FastifyRequest<{ Querystring: GetArtworkColorsQuery }>,
  reply: FastifyReply
) {
  try {
    const image = await fetch(request.query.imageUrl).then((res) => res.buffer());
    const palette = await Vibrant.from(image).getPalette();
    reply.status(200).send({
      darkMuted: palette.DarkMuted?.hex,
      darkVibrant: palette.DarkVibrant?.hex,
      lightMuted: palette.LightMuted?.hex,
      lightVibrant: palette.LightVibrant?.hex,
      muted: palette.Muted?.hex,
      vibrant: palette.Vibrant?.hex,
    });
  } catch (err) {
    request.log.error((err as Error)?.message);
    reply.status(500).send({ statusCode: 500, error: 'API Error', message: '' });
  }
}

export async function getCategories(request: FastifyRequest<{ Querystring: GetArtworkQuery }>) {
  const categories = await client.categories().then((res) => res.feeds.map((a) => toCategory(a)));

  return categories;
}

export function getPIStats() {
  return client.stats().then((res) => res.stats);
}

export function health() {
  return Promise.resolve({
    version: apiVersion,
    uptime: process.uptime(),
    date: new Date().toISOString(),
  });
}
