import { Router } from 'express';

/** Every API route. app.ts mounts this router under /api. */
export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
