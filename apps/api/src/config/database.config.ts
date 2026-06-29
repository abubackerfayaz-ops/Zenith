import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'zenith',

  get connectionString(): string {
    return (
      this.url ??
      `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}?schema=public`
    );
  },

  pool: {
    min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
  },

  ssl: process.env.DB_SSL === 'true',
}));
