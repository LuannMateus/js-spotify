import {
  describe,
  jest,
  expect,
  test,
} from '@jest/globals';
import { Controller } from '../../../src/controllers/controller.js';
import { Service } from '../../../src/services/service.js';
import TestUtil from '../utils/testUtil.js';

const sut = new Controller();

describe('#Controllers', () => {
  test('Should call getFileStream and return a file stream', async () => {
    const mockFileStream =
      TestUtil.generateReadableStream();
    const filename = 'dit/file.ext';

    jest
      .spyOn(
        Service.prototype,
        Service.prototype.getFileStream.name
      )
      .mockResolvedValue(mockFileStream);

    const result = await sut.getFileStream(filename);

    expect(
      Service.prototype.getFileStream
    ).toHaveBeenCalledWith(filename);
    expect(result).toEqual(mockFileStream);
  });
});
