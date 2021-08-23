import Fastify from 'fastify';
import arg from 'arg';
import routes from './routes';

const args = arg({
  '--port': Number,
  '-p': '--port',
});

const server = Fastify({ logger: true });

server.register(routes);

const start = async () => {
  try {
    await server.listen(args['--port'] || 3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
