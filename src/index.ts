import { config } from './utils/config';
require('newrelic');
import { configureServer } from './server';

const server = configureServer({
  logger: {
    name: 'foxcasts-api-v1',
    enabled: config.logger.enabled,
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

server.listen({ port: config.serverPort, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
