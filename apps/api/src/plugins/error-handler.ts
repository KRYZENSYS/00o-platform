/**
 * Global error handler plugin
 */
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';

export async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error }, 'Request error');

    // Zod validation
    if (error instanceof ZodError) {
      return reply.status(422).send({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.flatten().fieldErrors,
      });
    }

    // Custom AppError
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      });
    }

    // Fastify validation
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.message,
        details: error.validation,
      });
    }

    // Generic
    const status = 'statusCode' in error && error.statusCode ? error.statusCode : 500;
    return reply.status(status).send({
      success: false,
      error: 'INTERNAL_ERROR',
      message: status === 500 ? 'Internal server error' : error.message,
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });
}
