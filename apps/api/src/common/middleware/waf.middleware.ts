import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const SQL_INJECTION_PATTERNS = [
  /(\b(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|MERGE|SELECT|TRUNCATE|UPDATE|UNION)\b\s*(?:\s|\/\*|\-\-))/i,
  /(\b(OR|AND)\b\s+\d+\s*[=<>])/i,
  /(\b(OR|AND)\b\s+['"].*['"].*\s*[=<>])/i,
  /(--|#|\/\*)/,
  /(\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE|CHAR|CONCAT|BENCHMARK|SLEEP|PG_SLEEP)\b)/i,
  /(['"])\s*\1\s*$/,
  /(\bEXEC\b.*\()/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bINFORMATION_SCHEMA\b)/i,
  /(\bpg_catalog\b)/i,
  /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
  /%27|\"|\'\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|CREATE)/i,
];

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /<[\s\/]*(iframe|object|embed|form|input|textarea|select|button|meta|link|style|svg|math)[\s>]/i,
  /on\w+\s*=\s*['"]?[^'"]*['"]?/i,
  /javascript\s*:/i,
  /data\s*:\s*text\s*\/\s*html/i,
  /vbscript\s*:/i,
  /expression\s*\(/i,
  /eval\s*\(/i,
  /document\.(write|cookie|location|domain)/i,
  /window\.(location|name|status)/i,
  /<[^>]*on\w+\s*=[^>]*>/i,
  /alert\s*\(/i,
  /prompt\s*\(/i,
  /confirm\s*\(/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\/|\.\.\\/,
  /%2e%2e%2f|%2e%2e%5c/i,
  /%252e%252e%252f/i,
  /\.\.%2f|\.\.%5c/i,
  /\.\.\/\.\.\/\.\.\//,
  /\.\.\\\.\.\\\.\.\\/,
  /~\/\.\./,
  /%00/,
];

const COMMAND_INJECTION_PATTERNS = [
  /[;&|`]\s*(cat|ls|dir|whoami|rm|del|cp|copy|mv|move|wget|curl|bash|sh|cmd|powershell|python|perl|php|node)/i,
  /\$\s*\(/,
  /`.*`/,
  /\${\s*\w+\s*}/i,
  /\|.*(cat|ls|dir|whoami|rm|del|cp|copy|mv|move|wget|curl|bash|sh|cmd|powershell)/i,
];

function matchesAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(value));
}

function stringify(value: unknown, depth = 3): string {
  if (depth <= 0) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).map((v) => stringify(v, depth - 1)).join(' ');
  }
  return String(value);
}

@Injectable()
export class WafMiddleware implements NestMiddleware {
  private readonly logger = new Logger('WAF');

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const path = req.originalUrl || req.url;
    const method = req.method;

    const bodyStr = req.body ? stringify(req.body) : '';
    const queryStr = JSON.stringify(req.query);
    const paramsStr = JSON.stringify(req.params);
    const combined = `${bodyStr} ${queryStr} ${paramsStr}`;

    if (matchesAny(combined, SQL_INJECTION_PATTERNS)) {
      this.logger.warn(`Blocked SQL injection attempt from ${ip} on ${method} ${path}`);
      return res.status(403).json({
        success: false,
        message: 'Request blocked by security filter',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    if (matchesAny(combined, XSS_PATTERNS)) {
      this.logger.warn(`Blocked XSS attempt from ${ip} on ${method} ${path}`);
      return res.status(403).json({
        success: false,
        message: 'Request blocked by security filter',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    if (matchesAny(path, PATH_TRAVERSAL_PATTERNS)) {
      this.logger.warn(`Blocked path traversal attempt from ${ip} on ${method} ${path}`);
      return res.status(403).json({
        success: false,
        message: 'Request blocked by security filter',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    if (matchesAny(combined, COMMAND_INJECTION_PATTERNS)) {
      this.logger.warn(`Blocked command injection attempt from ${ip} on ${method} ${path}`);
      return res.status(403).json({
        success: false,
        message: 'Request blocked by security filter',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    const contentType = req.headers['content-type'] || '';
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      if (contentType.includes('application/json') && bodyStr && !bodyStr.startsWith('{') && !bodyStr.startsWith('[')) {
        this.logger.warn(`Blocked invalid JSON body from ${ip} on ${method} ${path}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
          data: null,
          timestamp: new Date().toISOString(),
        });
      }
    }

    next();
  }
}
