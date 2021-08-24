import { FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import podcastFeedParser from 'podcast-feed-parser';
import sharp from 'sharp';
import { ITunesPodcast, RawEpisode, RawPodcast, SearchResult } from './models';

interface SearchQuery {
  q: string;
  resultsCount: number;
}

export async function search(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply
) {
  try {
    const data = await fetch(
      `https://itunes.apple.com/search?media=podcast&term=${request.query.q}`
    ).then((res) => res.json());

    const result: SearchResult[] = (data.results as ITunesPodcast[])
      .slice(0, request.query.resultsCount)
      .map((podcast) => ({
        title: podcast.collectionName,
        author: podcast.artistName,
        itunesId: podcast.collectionId,
        feedUrl: podcast.feedUrl,
        artworkUrl: podcast.artworkUrl100,
      }));

    reply.code(200).send(result);
  } catch (err) {
    console.error('Failed to search', err);
    reply.code(500).send({ error: 'Failed to search' });
  }
}

interface GetFeedQuery {
  feedUrl: string;
  episodesCount: number;
  includeArtwork: boolean;
  artworkSize: number;
}

export async function getFeed(
  request: FastifyRequest<{ Querystring: GetFeedQuery }>,
  reply: FastifyReply
) {
  try {
    const xmlText = await fetch(request.query.feedUrl).then((res) =>
      res.text()
    );
    const data = podcastFeedParser.getPodcastFromFeed(xmlText, {
      fields: {
        meta: [
          'title',
          'author',
          'summary',
          'description',
          'categories',
          'imageURL',
        ],
        episodes: ['pubDate', 'title', 'subtitle', 'enclosure', 'duration'],
      },
    });

    const result: RawPodcast = {
      title: data.meta.title,
      author: data.meta.author,
      summary: data.meta.summary || data.meta.description,
      categories: data.meta.categories,
      feedUrl: request.query.feedUrl,
      artworkUrl: data.meta.imageURL,
      episodes: data.episodes.slice(0, request.query.episodesCount).map(
        (ep: any) =>
          ({
            date: ep.pubDate,
            title: ep.title,
            subtitle: ep.subtitle,
            duration: ep.duration,
            fileSize: ep.enclosure.length,
            fileType: ep.enclosure.type,
            fileUrl: ep.enclosure.url,
          } as RawEpisode)
      ),
    };

    if (request.query.includeArtwork) {
      const image = await fetch(result.artworkUrl).then((res) => res.buffer());
      const [artworkSmall, artworkLarge] = await Promise.all([
        sharp(image).resize(48).toBuffer(),
        sharp(image).resize(256).toBuffer(),
      ]);

      result.artworkSmall = artworkSmall.toString('base64');
      result.artworkLarge = artworkLarge.toString('base64');
    }

    reply.status(200).send(result);
  } catch (err) {
    console.error('Failed to get feed', err);
    reply.status(500).send({ error: 'Failed to get feed' });
  }
}

interface GetNewEpisodesQuery {
  feedUrl: string;
  afterDate: Date;
}

export async function getNewEpisodes(
  request: FastifyRequest<{ Querystring: GetNewEpisodesQuery }>,
  reply: FastifyReply
) {
  try {
    const xmlText = await fetch(request.query.feedUrl).then((res) =>
      res.text()
    );
    const data = podcastFeedParser.getPodcastFromFeed(xmlText, {
      fields: {
        episodes: ['pubDate', 'title', 'subtitle', 'enclosure', 'duration'],
      },
    });

    const isoDate = request.query.afterDate.toISOString();
    const result: RawEpisode[] = data.episodes
      .filter((ep: any) => ep.pubDate > isoDate)
      .map(
        (ep: any) =>
          ({
            date: ep.pubDate,
            title: ep.title,
            subtitle: ep.subtitle,
            duration: ep.duration,
            fileSize: ep.enclosure.length,
            fileType: ep.enclosure.type,
            fileUrl: ep.enclosure.url,
          } as RawEpisode)
      );

    reply.code(200).send(result);
  } catch (err) {
    console.error('Failed to get episodes', err);
    reply.status(500).send({ error: 'Failed to get episodes' });
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
    reply.status(500).send({ error: 'Failed to get artwork' });
  }
}

export async function health(
  request: FastifyRequest<{ Querystring: GetArtworkQuery }>,
  reply: FastifyReply
) {
  reply.status(200).send({
    uptime: process.uptime(),
    date: new Date().toISOString(),
  });
}
