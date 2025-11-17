import { safe } from '@/utils/string-utils';

export namespace Assert {
  export function notNil<T>(value: T | null | undefined, debugName: string): asserts value is T {
    if (value === null) {
      throw new Error(`Expected ${debugName} to not be null`);
    }
    if (value === undefined) {
      throw new Error(`Expected ${debugName} to not be undefined`);
    }
  }

  export function unreachable(message?: string): never {
    throw new Error('Unreachable' + safe`: ${message}`);
  }
}
