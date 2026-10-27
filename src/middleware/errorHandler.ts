import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[UNHANDLED ERROR]', err);

  // Body parser JSON error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON payload received in request body.'
    });
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    success: false,
    error: isProd ? 'An internal server error occurred.' : 'Internal Server Error',
    message: isProd ? 'An unexpected error occurred on the server.' : err.message
  });
}
