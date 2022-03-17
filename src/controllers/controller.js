import { Service } from '../services/service.js';
import { logger } from '../utils/pino.js';
import { once } from 'events';

export class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename);
  }

  async handleCommand({ command }) {
    logger.info(`Command received: ${command}`);

    const result = {
      result: 'ok',
    };

    const cmd = command.toLowerCase();

    if (cmd.includes('start')) {
      this.service.startStreaming();

      return result;
    }

    if (cmd.includes('stop')) {
      this.service.stopStreaming();

      return result;
    }
  }

  async startStreaming() {
    return this.service.startStreaming();
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
