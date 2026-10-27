import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Redact sensitive headers if present
    const isAuth = req.headers['authorization'] || req.headers['x-admin-key'] ? '[PRESENT]' : '[NONE]';

    // Log request summary without logging sensitive payload fields
    console.log(
      `[HTTP] ${req.method} ${req.originalUrl} -> Status: ${status} (${duration}ms) | AdminAuth: ${isAuth}`
    );
  });

  next();
}
