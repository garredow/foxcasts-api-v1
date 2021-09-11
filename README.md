# Foxcasts API

This API was created to move processing off device and onto a more powerful server, especially useful for low power devices like those that run KaiOS. It currently powers Foxcasts Lite.

## Documentation

Swagger: [https://api.foxcasts.com/swagger](https://api.foxcasts.com/swagger)

Demo Auth Token:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic3dhZ2dlci1kZW1vIiwiY3JlYXRlZEF0IjoiMjAyMS0wOS0wNFQyMTo0MzozNy44OTFaIiwiaWF0IjoxNjMwNzkxODE3fQ.H__Lpm7nzW9fKVtgPNDQFHjPBGiyu5_kTNXHG8Vi8QU
```

## Environment Setup

Configuration is done using an `.env` file in the root of the project.

| Key             | Value                                          | Required | Description                                           |
| --------------- | ---------------------------------------------- | -------- | ----------------------------------------------------- |
| LOGGER_ENABLED  | true, false                                    | false    | Enable logging                                        |
| LOGGER_LEVEL    | trace, debug, info, warn, error, fatal, silent | false    | Log level                                             |
| LOGGER_FILE     | /path/to/file.txt                              | false    | If set, logs will be written to the file at this path |
| API_KEY         | string                                         | true     | Podcast Index API key                                 |
| API_SECRET      | string                                         | true     | Podcast Index API secret                              |
| SWAGGER_HOST    | string                                         | false    | Swagger base URL                                      |
| SWAGGER_SCHEMES | http, https                                    | false    | Swagger HTTP schema                                   |
| AUTH_ENABLED    | true, false                                    | false    | If true, endpoints will require a JWT                 |
| JWT_SECRET      | string                                         | false    | Secret used for handling JWTs                         |
| ALLOWED_TOKENS  | comma separated strings                        | false    | List of allowed JWTs                                  |

See `config.ts` for defaults

### Example

```
LOGGER_ENABLED=true
LOGGER_LEVEL=info
LOGGER_FILE=logs.txt
API_KEY=podcastIndexApiKey
API_SECRET=podcastIndexApiSecret
SWAGGER_HOST=localhost:3000
SWAGGER_SCHEMES=http
AUTH_ENABLED=true
JWT_SECRET=someJwtSecret
ALLOWED_TOKENS=apikey1,apikey2,apikey3
```

Minimal `.env` file:

```
API_KEY=
API_SECRET=
AUTH_ENABLED=false
```

## Running Locally

Before running locally, you'll need to get an api key and secret from [Podcast Index](https://podcastindex.org/).

1. Clone repository
2. `npm install`
3. Create an `.env` file in the root directory with required values (see above)
4. `npm run start` or use the `Launch API` launch config if using VS Code
