import { readFileSync } from 'fs';
import { join } from 'path';

export interface HttpsOptions {
  key: Buffer;
  cert: Buffer;
}

export function getHttpsOptions(): HttpsOptions | null {
  const isProduction = process.env.NODE_ENV === 'production';
  const enableHttps = process.env.ENABLE_HTTPS === 'true' || isProduction;

  if (!enableHttps) {
    return null;
  }

  try {
    const keyPath = process.env.SSL_KEY_PATH || join(process.cwd(), 'ssl', 'key.pem');
    const certPath = process.env.SSL_CERT_PATH || join(process.cwd(), 'ssl', 'cert.pem');

    const key = readFileSync(keyPath);
    const cert = readFileSync(certPath);

    return { key, cert };
  } catch (error) {
    console.error('❌ Failed to load SSL certificates:', error.message);
    if (isProduction) {
      throw new Error('SSL certificates are required in production');
    }
    return null;
  }
}
