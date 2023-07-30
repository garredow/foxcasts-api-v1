import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import Fastify, { FastifyServerOptions } from 'fastify';
import joiToJson from 'joi-to-json';
import routes from './routes';
import { config } from './utils/config';

export function configureServer(options: FastifyServerOptions = {}) {
  const fastify = Fastify(options);

  fastify.register(jwt, {
    secret: config.authorization.jwtSecret,
    trusted: async function validateToken(request) {
      if (!config.authorization.enabled) return true;
      const allowList = config.authorization.allowedTokens;
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) return false;
      return allowList.includes(token);
    },
  });

  fastify.addHook('onRequest', async (request, reply) => {
    if (!config.authorization.enabled) return;
    if (request.routerPath === '/health') return;

    try {
      await request.jwtVerify({});
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.register(cors, {
    origin: [/\.foxcasts\.com$/],
  });

  fastify.register(swagger, {
    routePrefix: '/swagger',
    swagger: {
      info: {
        title: 'Foxcasts API',
        version: '0.1.0',
      },
      host: config.swagger.host,
      schemes: config.swagger.schemes,
      consumes: ['application/json'],
      produces: ['application/json', 'image/png'],
      tags: [
        { name: 'Podcasts', description: 'Podcast related endpoints' },
        { name: 'Episodes', description: 'Episode related endpoints' },
        { name: 'Meta', description: 'API related endpoints' },
      ],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
    transform: (schema: any) => {
      const { params = undefined, body = undefined, querystring = undefined, ...others } = schema;
      const transformed = { ...others };
      if (params) transformed.params = joiToJson(params);
      if (body) transformed.body = joiToJson(body);
      if (querystring) transformed.querystring = joiToJson(querystring);
      return transformed;
    },
  });

  fastify.register(routes);

  fastify.ready((err) => {
    if (err) throw err;
    fastify.swagger();
  });

  return fastify;
}
