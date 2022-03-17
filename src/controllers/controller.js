import { Service } from '../services/service.js';
import { logger } from '../utils/pino.js';
export class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename);
  }

  createClientStream() {
    const { id, clientStream } =
      this.service.getClientStream();

    const onClose = () => {
      logger.info(`Closing connection of ${id}`);

      this.service.removeClientStream(id);
    };

    return {
      stream: clientStream,
      onClose,
    };
  }
}
