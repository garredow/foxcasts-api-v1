import { FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import PodcastIndexClient from 'podcastdx-client';
import sharp from 'sharp';
import jsmediatags from 'jsmediatags';
import { Episode, PIApiTrendingFeed, Podcast, SearchResult } from './models';
import { getPodcastFromFeed } from './utils/getPodcastFromFeed';
import {
  toCategory,
  toEpisode,
  toPodcast,
  toSearchResult,
  toTrendPodcast,
} from './utils/mappers';
import formatDate from './utils/formatDate';
import { getEpisodesFromFeed } from './utils/getEpisodesFromFeed';
import { cleanUrl } from './utils/cleanUrl';
import { tryParseChapters } from './utils/tryParseChapters';
import { config } from './utils/config';
const { version: apiVersion } = require('../package.json');

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

export async function search(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply
) {
  try {
    const result: SearchResult[] = await client
      .search(request.query.query, { max: request.query.count })
      .then((res) => res.feeds.map((a) => toSearchResult(a)));

    reply.code(200).send(result);
  } catch (err) {
    console.error('Failed to search', err);
    reply
      .code(500)
      .send({ statusCode: 500, error: 'Failed to search', message: '' });
  }
}

interface GetTrendingQuery {
  categories: string;
}
interface GetTrendingResponse {
  feeds: PIApiTrendingFeed[];
  count: number;
}

export async function getTrending(
  request: FastifyRequest<{ Querystring: GetTrendingQuery }>,
  reply: FastifyReply
) {
  try {
    let url = `/podcasts/trending`;
    if (request.query.categories) {
      url = url + `?cat=${request.query.categories}`;
    }
    const result: Podcast[] = await client
      .raw<GetTrendingResponse>(url)
      .then((res) => res.feeds.map((a) => toTrendPodcast(a)));

    reply.code(200).send(result);
  } catch (err) {
    console.error('Failed to get trending podcasts', err);
    reply.code(500).send({
      statusCode: 500,
      error: 'Failed to get trending podcasts',
      message: '',
    });
  }
}

interface GetPodcastQuery {
  id?: number;
  feedUrl?: string;
}

export async function getPodcast(
  request: FastifyRequest<{ Querystring: GetPodcastQuery }>,
  reply: FastifyReply
) {
  try {
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

    reply.code(200).send(podcast);
  } catch (err) {
    console.error('Failed to get podcast', err);
    reply
      .code(500)
      .send({ statusCode: 500, error: 'Failed to get podcast', message: '' });
  }
}

interface GetEpisodesQuery {
  podcastId?: number;
  feedUrl?: string;
  since?: string;
  count: number;
}

export async function getEpisodes(
  request: FastifyRequest<{ Querystring: GetEpisodesQuery }>,
  reply: FastifyReply
) {
  try {
    let episodes: Episode[] | null = null;

    // Try Podcast Index ID
    if (request.query.podcastId) {
      await client
        .episodesByFeedId(request.query.podcastId, {
          max: request.query.count,
          since: request.query.since
            ? formatDate.toNumeric(request.query.since)
            : undefined,
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
          since: request.query.since
            ? formatDate.toNumeric(request.query.since)
            : undefined,
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
        since: request.query.since,
      });
    }

    reply.code(200).send(episodes);
  } catch (err) {
    console.error('Failed to get episodes', err);
    reply
      .code(500)
      .send({ statusCode: 500, error: 'Failed to get episodes', message: '' });
  }
}

interface ChaptersQuery {
  episodeId?: number;
  fileUrl?: string;
}

export async function getChapters(
  request: FastifyRequest<{ Querystring: ChaptersQuery }>,
  reply: FastifyReply
) {
  try {
    if (request.query.episodeId === 0 && !request.query.fileUrl) {
      return reply.status(200).send([]);
    }

    const episode = request.query.episodeId
      ? (await client.episodeById(request.query.episodeId)).episode
      : null;

    if (episode?.chaptersUrl) {
      const result = await fetch(episode.chaptersUrl).then((res) => res.json());
      return reply.status(200).send(result?.chapters || []);
    }

    // jsmediatags doesn't seem to like a lot of redirects, so let's
    // try to clean up this URL a bit
    const url = episode?.enclosureUrl || request.query.fileUrl;
    if (!url) {
      return reply.status(200).send([]);
    }
    const cleanerUrl = cleanUrl(url);
    const id3Obj = await new Promise((resolve, reject) => {
      new jsmediatags.Reader(cleanerUrl).setTagsToRead(['CHAP']).read({
        onSuccess: resolve,
        onError: reject,
      });
    });
    const chapters = tryParseChapters(id3Obj);
    reply.status(200).send(chapters);
  } catch (err) {
    console.error('Failed to get chapters', err);
    reply
      .status(500)
      .send({ statusCode: 500, error: 'Failed to get chapters', message: '' });
  }
}

interface GetArtworkQuery {
  imageUrl: string;
  size: number;
}

export async function getArtwork(
  request: FastifyRequest<{ Querystring: GetArtworkQuery }>,
  reply: FastifyReply
) {
  try {
    const image = await fetch(request.query.imageUrl).then((res) =>
      res.buffer()
    );
    const artwork = await sharp(image)
      .resize(request.query.size)
      .png()
      .toBuffer();

    reply.status(200).header('Content-Type', 'image/png').send(artwork);
  } catch (err) {
    console.error('Failed to get artwork', err);
    reply
      .status(500)
      .send({ statusCode: 500, error: 'Failed to get artwork', message: '' });
  }
}

export async function getCategories(
  request: FastifyRequest<{ Querystring: GetArtworkQuery }>,
  reply: FastifyReply
) {
  try {
    const categories = await client
      .categories()
      .then((res) => res.feeds.map((a) => toCategory(a)));

    reply.status(200).send(categories);
  } catch (err) {
    console.error('Failed to get artwork', err);
    reply
      .status(500)
      .send({ statusCode: 500, error: 'Failed to get artwork', message: '' });
  }
}

export async function getPIStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const stats = await client.stats().then((res) => res.stats);

    reply.status(200).send(stats);
  } catch (err) {
    console.error('Failed to get artwork', err);
    reply
      .status(500)
      .send({ statusCode: 500, error: 'Failed to get artwork', message: '' });
  }
}

export async function health(request: FastifyRequest, reply: FastifyReply) {
  reply.status(200).send({
    version: apiVersion,
    uptime: process.uptime(),
    date: new Date().toISOString(),
  });
}
