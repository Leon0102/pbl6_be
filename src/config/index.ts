import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot();
const getEnv = (key: string) => {
  return process.env?.[key] || '';
};
const toBool = (value: string): boolean => {
  return value === 'true';
};
export const NODE_ENV = getEnv('NODE_ENV');

export const DATABASE = {
  URL: getEnv('DATABASE_URL'),
};
