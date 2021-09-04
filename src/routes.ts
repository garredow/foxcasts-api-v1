import { FastifyInstance } from 'fastify';
import Joi from 'joi';
import {
  getArtwork,
  getEpisodes,
  getChapters,
  getPodcast,
  health,
  search,
} from './controller';

async function routes(fastify: FastifyInstance) {
  fastify.get(
    '/podcasts/search',
    {
      schema: {
        tags: ['Podcasts'],
        summary: 'Search for a podcast',
        querystring: Joi.object().keys({
          query: Joi.string().required(),
          count: Joi.number().max(50).default(10).optional(),
        }),
        response: {
          200: {
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
          400: {
            description: 'Bad request response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          500: {
            description: 'Failure response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as any).validate(data),
    },
    search
  );
  fastify.get(
    '/podcasts',
    {
      schema: {
        tags: ['Podcasts'],
        summary: 'Get a podcast by its ID or feed URL',
        querystring: Joi.object().keys({
          id: Joi.number().optional().description('Podcast Index ID'),
          feedUrl: Joi.string()
            .when('id', {
              is: Joi.exist(),
              then: Joi.optional(),
              otherwise: Joi.required(),
            })
            .description('XML feed URL to fallback to if no ID provided'),
        }),
        response: {
          200: {
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
          400: {
            description: 'Bad request response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          500: {
            description: 'Failure response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as any).validate(data),
    },
    getPodcast
  );
  fastify.get(
    '/episodes',
    {
      schema: {
        tags: ['Episodes'],
        summary: 'Get a list of recent episodes by podcast ID or feed URL',
        querystring: Joi.object().keys({
          podcastId: Joi.number().optional(),
          feedUrl: Joi.string().when('podcastId', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required(),
          }),
          since: Joi.date().optional(),
          count: Joi.number().default(25).optional(),
        }),
        response: {
          200: {
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
          400: {
            description: 'Bad request response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          500: {
            description: 'Failure response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as any).validate(data),
    },
    getEpisodes
  );
  fastify.get(
    '/chapters',
    {
      schema: {
        tags: ['Episodes'],
        summary: 'Get a list of chapters for an episode if available',
        querystring: Joi.object().keys({
          episodeId: Joi.number().optional(),
          fileUrl: Joi.string().when('episodeId', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required(),
          }),
        }),
        response: {
          200: {
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
          400: {
            description: 'Bad request response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          500: {
            description: 'Failure response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as any).validate(data),
    },
    getChapters
  );
  fastify.get(
    '/artwork',
    {
      schema: {
        tags: ['Podcasts'],
        summary: 'Get the artwork for a podcast in a desired size',
        querystring: Joi.object().keys({
          imageUrl: Joi.string().required(),
          size: Joi.number().max(512).default(40).optional(),
        }),
        response: {
          200: {
            description: 'Successful response',
            content: 'image/png',
            type: 'string',
            format: 'binary',
          },
          400: {
            description: 'Bad request response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          500: {
            description: 'Failure response',
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as any).validate(data),
    },
    getArtwork
  );
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Meta'],
        summary: 'Check the health of the API',
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
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
        },
      },
    },
    health
  );
}

export default routes;
