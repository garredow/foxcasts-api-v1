import { FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { ITunesPodcast, SearchResult } from './models';
import { getEpisodes } from './utils/getEpisodes';
import { getPodcast } from './utils/getPodcast';

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
    ).then((res) => res.json() as Promise<{ results: ITunesPodcast[] }>);

    const result: SearchResult[] = data.results
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

    const podcast = getPodcast(xmlText, {
      episodeLimit: request.query.episodesCount,
    });

    reply.status(200).send(podcast);
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

    const result = getEpisodes(xmlText, {
      afterDate: request.query.afterDate.toISOString(),
    });

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
