import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../../');
const publicDirectory = join(root, 'public');

const audioDirectory = join(root, 'src/public/audio');

export default {
  port: process.env.PORT || 3000,
  dir: {
    root,
    publicDirectory,
    audioDirectory,
    songsDirectory: join(audioDirectory, 'songs'),
    fxDirectory: join(audioDirectory, 'fx'),
  },
  pages: {
    homeHTML: 'home/index.html',
    controller: 'controller/index.html',
  },
  location: {
    home: '/home',
  },
};
