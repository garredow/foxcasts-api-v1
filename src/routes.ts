import { FastifyInstance } from 'fastify';
import Joi from 'joi';
import { getArtwork, getFeed, getNewEpisodes, search } from './controller';

async function routes(fastify: FastifyInstance) {
  fastify.get(
    '/search',
    {
      schema: {
        querystring: Joi.object().keys({
          q: Joi.string().required(),
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
    '/feed',
    {
      schema: {
        querystring: Joi.object().keys({
          feedUrl: Joi.string().required(),
          episodesCount: Joi.number().max(100).default(30).optional(),
          includeArtwork: Joi.bool().default(false).optional(),
        }),
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    getFeed
  );

  fastify.get(
    '/newEpisodes',
    {
      schema: {
        querystring: Joi.object().keys({
          feedUrl: Joi.string().required(),
          afterDate: Joi.date().iso().required(),
        }),
      },
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as Joi.ObjectSchema<any>).validate(data),
    },
    getNewEpisodes
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
}

export default routes;
