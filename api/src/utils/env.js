import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import dotenvSafe from 'dotenv-safe';

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) console.log('Running in production mode.');

const path = join(
  dirname(fileURLToPath(import.meta.url)).split('minasat-aleumla')[0],
  'minasat-aleumla/api/.env'
);

const env = () =>
  isProduction
    ? dotenv.config({ path })
    : dotenvSafe.config({
        allowEmptyValues: true,
        path,
        example: path + '.example',
      });

export { env, isProduction };
