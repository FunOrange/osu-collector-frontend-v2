import { Ipc } from './src/app/electron/ipc-types';

export {};

declare global {
  interface Window {
    ipc: Ipc;
  }
}
