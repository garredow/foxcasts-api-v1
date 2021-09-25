import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import {
  getArtwork,
  getEpisodes,
  getChapters,
  getPodcast,
  health,
  search,
  getTrending,
  getCategories,
  getPIStats,
} from './controller';
import { createRoute } from './utils/createRoute';

const handleErrors =
  (controllerFn: (request: FastifyRequest<any>) => Promise<any>) =>
  (request: FastifyRequest<any>, reply: FastifyReply) =>
    controllerFn(request)
      .then((res) => reply.status(200).send(res))
      .catch((err) => {
        request.log.error(err.message);
        reply.code(500).send({
          statusCode: 500,
          error: 'API Error',
          message: '',
        });
      });

async function routes(fastify: FastifyInstance) {
  createRoute(fastify, '/podcasts/search', handleErrors(search), {
    tags: ['Podcasts'],
    summary: 'Search for a podcast',
    queryStringSchema: Joi.object().keys({
      query: Joi.string().required(),
      count: Joi.number().max(50).default(10).optional(),
    }),
    responseSchema: {
      description: 'Successful response',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          podexId: { type: 'integer' },
          title: { type: 'string' },
          author: { type: 'string' },
          feedUrl: { type: 'string' },
          artworkUrl: { type: 'string' },
        },
      },
    },
    useAuth: true,
  });

  createRoute(fastify, '/podcasts/trending', handleErrors(getTrending), {
    useAuth: true,
    tags: ['Podcasts'],
    summary: 'Get trending podcasts',
    queryStringSchema: Joi.object().keys({
      categories: Joi.string()
        .optional()
        .description('An optional comma-separated list of category IDs'),
      since: Joi.number()
        .required()
        .description(
          'Return items since the specified time. The value can be a unix epoch timestamp or a negative integer that represents a number of seconds prior to right now.'
        ),
    }),
    responseSchema: {
      description: 'Successful response',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          podexId: { type: 'integer' },
          itunesId: { type: 'integer' },
          title: { type: 'string' },
          author: { type: 'string' },
          description: { type: 'string' },
          artworkUrl: { type: 'string' },
          feedUrl: { type: 'string' },
          lastUpdated: { type: 'integer' },
          categories: { type: 'array', items: { type: 'string' } },
          trendScore: { type: 'integer' },
        },
      },
    },
  });

  createRoute(fastify, '/podcasts', handleErrors(getPodcast), {
    useAuth: true,
    tags: ['Podcasts'],
    summary: 'Get a podcast by its ID or feed URL',
    queryStringSchema: Joi.object().keys({
      id: Joi.number().optional().description('Podcast Index ID'),
      feedUrl: Joi.string()
        .when('id', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .description('XML feed URL to fallback to if no ID provided'),
    }),
    responseSchema: {
      description: 'Successful response',
      type: 'object',
      properties: {
        podexId: { type: 'integer' },
        itunesId: { type: 'integer' },
        title: { type: 'string' },
        author: { type: 'string' },
        description: { type: 'string' },
        artworkUrl: { type: 'string' },
        feedUrl: { type: 'string' },
        lastUpdated: { type: 'integer' },
        categories: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  createRoute(fastify, '/artwork', getArtwork, {
    useAuth: true,
    tags: ['Podcasts'],
    summary: 'Get the artwork for a podcast in a desired size',
    queryStringSchema: Joi.object().keys({
      imageUrl: Joi.string().required(),
      size: Joi.number().max(512).default(40).optional(),
    }),
    responseSchema: {
      description: 'Successful response',
      type: 'string',
      format: 'binary',
    },
  });

  createRoute(fastify, '/categories', handleErrors(getCategories), {
    useAuth: true,
    tags: ['Podcasts'],
    summary: 'Get a list of all categories',
    responseSchema: {
      description: 'Successful response',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    },
  });

  createRoute(fastify, '/episodes', handleErrors(getEpisodes), {
    useAuth: true,
    tags: ['Episodes'],
    summary: 'Get a list of recent episodes by podcast ID or feed URL',
    queryStringSchema: Joi.object().keys({
      podcastId: Joi.number().optional(),
      feedUrl: Joi.string().when('podcastId', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      since: Joi.number()
        .optional()
        .description(
          'Return items since the specified time. The value can be a unix epoch timestamp or a negative integer that represents a number of seconds prior to right now.'
        ),
      count: Joi.number().default(25).optional(),
    }),
    responseSchema: {
      description: 'Successful response',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          podexId: { type: 'integer' },
          guid: { type: 'string' },
          date: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'integer' },
          fileSize: { type: 'integer' },
          fileType: { type: 'string' },
          fileUrl: { type: 'string' },
          chaptersUrl: { type: 'string' },
          transcriptUrl: { type: 'string' },
        },
      },
    },
  });

  createRoute(fastify, '/chapters', handleErrors(getChapters), {
    useAuth: true,
    tags: ['Episodes'],
    summary: 'Get a list of chapters for an episode if available',
    queryStringSchema: Joi.object().keys({
      episodeId: Joi.number().optional(),
      fileUrl: Joi.string().when('episodeId', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    }),
    responseSchema: {
      description: 'Successful response',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          startTime: { type: 'integer' },
          endTime: { type: 'integer' },
        },
      },
    },
  });

  createRoute(fastify, '/pistats', handleErrors(getPIStats), {
    useAuth: true,
    tags: ['Meta'],
    summary: 'Get stats about Podcast Index',
    responseSchema: {
      description: 'Successful response',
      type: 'object',
      properties: {
        feedCountTotal: { type: 'integer' },
        episodeCountTotal: { type: 'integer' },
        feedsWithNewEpisodes3days: { type: 'integer' },
        feedsWithNewEpisodes10days: { type: 'integer' },
        feedsWithNewEpisodes30days: { type: 'integer' },
        feedsWithNewEpisodes90days: { type: 'integer' },
        feedsWithValueBlocks: { type: 'integer' },
      },
    },
  });

  createRoute(fastify, '/health', handleErrors(health), {
    useAuth: false,
    tags: ['Meta'],
    summary: 'Check the health of the API',
    responseSchema: {
      description: 'Successful response',
      type: 'object',
      properties: {
        version: {
          type: 'string',
          description: 'The API version',
        },
        uptime: {
          type: 'number',
          description: 'The amount of time the API has been running',
        },
        date: {
          type: 'string',
          description: 'The current date and time in UTC ISO-8601 format',
        },
      },
    },
  });
}

export default routes;
