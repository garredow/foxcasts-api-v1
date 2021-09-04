import dotenv from 'dotenv';
import Fastify from 'fastify';
import swagger from 'fastify-swagger';
import arg from 'arg';
import joiToJson from 'joi-to-json';
import routes from './routes';

dotenv.config();

const args = arg({
  '--port': Number,
  '-p': '--port',
});

const server = Fastify({ logger: true });

server.register(swagger, {
  routePrefix: '/swagger',
  swagger: {
    info: {
      title: 'Foxcasts API',
      version: '0.1.0',
    },
    host: process.env.SWAGGER_HOST,
    schemes: [process.env.SWAGGER_SCHEME || 'https'],
    consumes: ['application/json'],
    produces: ['application/json', 'image/png'],
    tags: [
      { name: 'Podcasts', description: 'Podcast related endpoints' },
      { name: 'Episodes', description: 'Episode related endpoints' },
      { name: 'Meta', description: 'API related endpoints' },
    ],
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true,
  transform: (schema: any) => {
    const {
      params = undefined,
      body = undefined,
      querystring = undefined,
      ...others
    } = schema;
    const transformed = { ...others };
    if (params) transformed.params = joiToJson(params);
    if (body) transformed.body = joiToJson(body);
    if (querystring) transformed.querystring = joiToJson(querystring);
    return transformed;
  },
});
server.register(routes);

server.ready((err) => {
  if (err) throw err;
  server.swagger();
});

const start = async () => {
  try {
    await server.listen(args['--port'] || 3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
