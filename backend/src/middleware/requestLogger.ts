import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('users-Agent'),
      timestamp: new Date().toISOString(),
    };
    
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(JSON.stringify(logData, null, 2));
    }
  });
  
  next();
};
