import { FastifyInstance } from 'fastify';
import Joi from 'joi';

type Options = {
  tags: string[];
  summary: string;
  queryStringSchema?: Joi.ObjectSchema<any>;
  responseSchema: any;
  useAuth: boolean;
};

export function createRoute(
  fastify: FastifyInstance,
  route: string,
  controllerFn: any,
  options: Options
) {
  const schema = {
    tags: options.tags,
    summary: options.summary,
    querystring: options.queryStringSchema,
    response: {
      200: options.responseSchema,
      400: {
        description: 'Bad request response',
        type: 'object',
        properties: {
          statusCode: { type: 'integer' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      401: {
        description: 'Unauthorized response',
        type: 'object',
        properties: {
          statusCode: { type: 'integer' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Failure response',
        type: 'object',
        properties: {
          statusCode: { type: 'integer' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    security: options.useAuth
      ? [
          {
            apiKey: [],
          },
        ]
      : [],
  };

  fastify.get(
    route,
    {
      preValidation: [(fastify as any).authenticate],
      schema,
      validatorCompiler:
        ({ schema }) =>
        (data) =>
          (schema as any).validate(data),
    },
    controllerFn
  );
}
