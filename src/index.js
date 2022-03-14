import config from './config/config.js';
import server from './server.js';
import { logger } from './utils/pino.js';

server
  .listen(config.port)
  .on('listening', () =>
    logger.info(
      `Server is running on PORT [${config.port}]!`
    )
  );
