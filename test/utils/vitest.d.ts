/// <reference types="vitest" />

import type { TestFunction } from "vitest";
import { Token, TokenType } from "../../src/front-end/1_lexer/token";

declare global {
  // override global it/test with our extensions
  const it: typeof import("vitest").it & {
    phase(phase: number, name: string, fn?: TestFunction, timeout?: number): void;
  };
  const test: typeof import("vitest").it & {
    phase(phase: number, name: string, fn?: TestFunction, timeout?: number): void;
  };
  const describe: typeof import("vitest").describe & {
    phase(phase: number, name: string, fn: () => void): void;
  };
}

interface CustomMatchers<R = unknown> {
  toBeToken: (expectedType: TokenType, expectedValue: string) => Promise<R>;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
