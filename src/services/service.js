import fs from 'fs';
import fsPromises from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { PassThrough, Writable } from 'stream';
import Throttle from 'throttle';
import childProcess from 'child_process';
import { logger } from '../utils/pino.js';
import streamPromises from 'stream/promises';
import { once } from 'events';

import config from '../config/config.js';

const {
  dir: { publicDirectory },
  fallbackBitRate,
  englishConversation,
  bitRateDivisor,
} = config;

export class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitRate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};

    this.startStreaming();
  }

  getClientStream() {
    const id = randomUUID();
    const clientStream = new PassThrough();

    this.clientStreams.set(id, clientStream);

    return {
      id,
      clientStream,
    };
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn('sox', args);
  }

  async getBitRate(song) {
    try {
      const args = ['--i', '-B', song];

      const {
        stderr,
        stdout,
        // stdin
      } = this._executeSoxCommand(args);

      await Promise.all([
        once(stderr, 'readable'),
        once(stdout, 'readable'),
      ]);

      const [success, error] = [stdout, stderr].map(
        (stream) => stream.read()
      );

      if (error) {
        return await Promise.reject(error);
      }

      return success.toString().trim().replace(/k/, '000');
    } catch (error) {
      logger.info(`Deu ruim no bitrate: ${error}`);

      return fallbackBitRate;
    }
  }

  broadCast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.clientStreams.delete(id);
            continue;
          }

          stream.write(chunk);
        }

        cb();
      },
    });
  }

  async startStreaming() {
    logger.info(`Starting with ${englishConversation}`);

    const bitRate = (this.currentBitRate =
      (await this.getBitRate(this.currentSong)) /
      bitRateDivisor);

    const throttleTransform = (this.throttleTransform =
      new Throttle(bitRate));

    const songReadable = (this.currentReadable =
      this.createFileStream(this.currentSong));

    return streamPromises.pipeline(
      songReadable,
      throttleTransform,
      this.broadCast()
    );
  }

  async getFileInfo(file) {
    const fullFilePath = join(publicDirectory, file);

    await fsPromises.access(fullFilePath);

    const fileType = extname(fullFilePath);

    return {
      type: fileType,
      name: fullFilePath,
    };
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);

    return {
      stream: this.createFileStream(name),
      type,
    };
  }
}
