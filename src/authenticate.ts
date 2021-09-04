import fp from 'fastify-plugin';
import jwt from 'fastify-jwt';
import { config } from './utils/config';

export default fp(async function (fastify, opts) {
  fastify.register(jwt, {
    secret: config.authorization.jwtSecret,
    trusted: async function validateToken(request, decodedToken) {
      const allowList = config.authorization.allowedTokens;
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) return false;
      return allowList.includes(token);
    },
  });

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    const [err, client] = await request
      .jwtVerify({ ignoreExpiration: true })
      .then((client: any) => [null, client])
      .catch((err: any) => [err, null]);

    if (client) {
      request.log.info({ client });
    } else {
      request.log.info({ client }, 'No client info since auth is disabled');
    }

    if (err && config.authorization.enabled) {
      reply.send(err);
    }
  });
});
