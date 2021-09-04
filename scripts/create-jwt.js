const jwt = require('jsonwebtoken');
require('dotenv').config();
const arg = require('arg');

const args = arg({
  '--name': String,
  '-n': '--name',
});

if (!args['--name']) {
  console.error('A name must be provided');
  process.exit(1);
}

const token = jwt.sign(
  { name: args['--name'], createdAt: new Date().toISOString() },
  process.env.JWT_SECRET || 'secret'
);
console.log(`Token: ${token}`);

const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
console.log(`Payload: ${JSON.stringify(payload)}`);
