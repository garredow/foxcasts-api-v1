import { test } from 'tap';
import { configureServer } from '../src/server';

test('requests the "/health" route', async (t) => {
  const server = configureServer();

  const response = await server.inject({
    method: 'GET',
    url: '/health',
  });

  t.equal(response.statusCode, 200, 'returns a status code of 200');
});
