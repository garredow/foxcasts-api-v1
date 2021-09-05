import arg from 'arg';
import { config } from './utils/config';
import { configureServer } from './server';

const args = arg({
  '--port': Number,
  '-p': '--port',
});

const server = configureServer({
  logger: {
    name: 'foxcasts-api',
    level: config.logger.level,
    file: config.logger.file,
    formatters: {
      level(label: any, number: any) {
        return { level: label };
      },
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
});

server.listen(args['--port'] || 3000, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
