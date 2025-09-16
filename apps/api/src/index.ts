import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/', (c) => {
  return c.json({ message: 'Gyulist v2 API' });
});

// Swagger UI
app.get('/docs', swaggerUI({ url: '/api-docs' }));

// API documentation
app.get('/api-docs', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Gyulist v2 API',
      version: '1.0.0',
      description: 'Gyulist v2 API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

const port = process.env.PORT || 3001;

console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
