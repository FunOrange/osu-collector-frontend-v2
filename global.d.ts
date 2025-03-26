import { IpcHandlers } from './src/app/electron/ipc-types';

declare global {
  interface Window {
    ipc: IpcHandlers;
  }
}

export {};
