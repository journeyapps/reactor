import compression from 'compression';
import express from 'express';
import * as http from 'http';
import {
  createBaseIndexMiddleware,
  createModuleLoaderContentTransformer,
  loadModules,
  reactorServerLogger,
  serveModules
} from '@journeyapps/reactor-lib-server';
import { join } from 'path';
import { Log } from '@journeyapps-labs/common-logger';

const app = express();
const server = http.createServer(app);
const logger = reactorServerLogger.childLogger('Demo');

let path = require.resolve('@journeyapps/reactor-lib-server');

const PORT = parseInt(process.env.PORT || '9527');
const MODULES = loadModules({
  env: {
    MODULES: process.env.MODULES.split(','),
    REACTOR_LOG_LEVEL: process.env.REACTOR_LOG_LEVEL || 'INFO'
  }
});

const MODULE_ENV = MODULES.reduce((env, module) => ({ ...env, ...module.getEnvs() }), {});

app.use(compression());

const serveIndex = () => {
  return createBaseIndexMiddleware({
    title: 'Demo',
    getEnv: () => {
      return MODULE_ENV;
    },
    domTransform: ($) => {
      createModuleLoaderContentTransformer($, MODULES);
    },
    templateVars: {
      LOADER_BACKGROUND_COLOR: '#1d1d1d'
    },
    indexFile: join(path, '../../media/index.html')
  });
};

(async () => {
  const serveIndexMiddleware = await serveIndex();

  // !====================== Frontend routes for serving reactor ide webapp ================
  serveModules({
    modules: MODULES,
    app: app
  });
  app.get('/', serveIndexMiddleware as any);

  server.listen(PORT, () => {
    logger.info(Log.green('Listening'), 'on port', Log.bold(Log.cyan(PORT)));
  });
})().catch((err) => {
  logger.error('Failed to boot demo server', err);
  process.exit(1);
});
