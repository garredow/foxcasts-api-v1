require('newrelic');
import { configureServer } from './server';
import { config } from './utils/config';

const server = configureServer({
  logger: {
    name: 'foxcasts-api-v1',
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

server.listen(config.serverPort, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
