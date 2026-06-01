import { TestFunction } from "vitest";

import { CURRENT_PHASE } from "../test.env";
import { Token, TokenType } from "../../src/1_lexer/token";

//TODO more flexibility? Add a way to skip it after some phase (for things that break in later phases)?

it.phase = (phase: number, name: string, fn?: TestFunction, timeout?: number) => {
  if (phase <= CURRENT_PHASE) {
    it(name, fn, timeout);
  } else {
    it.skip(name, fn, timeout);
  }
};

describe.phase = (phase: number, name: string, fn: () => void) => {
  if (phase <= CURRENT_PHASE) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
};

type MatchersObject = Parameters<typeof expect.extend>[0];
type Matcher = MatchersObject[keyof MatchersObject];

const toBeToken: Matcher = function (
  this,
  received: Token,
  expectedType: TokenType,
  expectedValue: string,
) {
  const { matcherHint, printExpected, printReceived, diff } = this.utils;

  const displayReceivedToken = {
    type: TokenType[received.type],
    value: received.value,
  };
  const displayExpectedToken = {
    type: TokenType[expectedType],
    value: expectedValue,
  };

  const pass = received.type === expectedType && received.value === expectedValue;

  const buildMessage = (pass: boolean) => {
    const hint = matcherHint("toBeToken");

    const mainDiff = `\n\n${diff(displayExpectedToken, displayReceivedToken)}`;

    const details = printReceived(received);

    if (pass) {
      return `${hint}\n\nExpected: not ${printExpected(displayExpectedToken)}\nReceived: ${printReceived(displayReceivedToken)}\n\nDetails:\n${details}`;
    } else {
      return `${hint}\n\nExpected: ${printExpected(displayExpectedToken)}\nReceived: ${printReceived(displayReceivedToken)}${mainDiff}\n\nDetails:\n${details}`;
    }
  };

  return {
    pass,
    message: () => buildMessage(pass),
  };
};

expect.extend({ toBeToken });
