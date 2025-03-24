export enum Channel {
  PathJoin = 'pathJoin',
  PathSep = 'pathSep',
  OpenDevTools = 'openDevTools',
}

type IpcHandlersBase = {
  [C in Channel]: (...args: unknown[]) => unknown;
};
export interface IpcHandlers extends IpcHandlersBase {
  [Channel.PathJoin]: (...args: string[]) => string;
  [Channel.PathSep]: () => string;
}
