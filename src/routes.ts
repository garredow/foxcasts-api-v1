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
        querystring: Joi.object().keys({
          query: Joi.string().required(),
          resultsCount: Joi.number().max(50).default(10).optional(),
        }),
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    search
  );

  fastify.get(
    '/podcasts',
    {
      schema: {
        querystring: Joi.object().keys({
          id: Joi.number().optional(),
          feedUrl: Joi.string().when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required(),
          }),
        }),
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    getPodcast
  );

  fastify.get(
    '/episodes',
    {
      schema: {
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
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    getEpisodes
  );

  fastify.get(
    '/chapters',
    {
      schema: {
        querystring: Joi.object().keys({
          episodeId: Joi.number().optional(),
          fileUrl: Joi.string().when('episodeId', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required(),
          }),
        }),
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    getChapters
  );

  fastify.get(
    '/artwork',
    {
      schema: {
        querystring: Joi.object().keys({
          imageUrl: Joi.string().required(),
          size: Joi.number().max(512).default(40).optional(),
        }),
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    getArtwork
  );

  fastify.get('/health', health);
}

export default routes;
