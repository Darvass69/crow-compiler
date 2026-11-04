import { diagnostics, Severity, SourceLocation, SourceRange } from "../../diagnostics/diagnostics";
import { LexerError, LexerErrorCode } from "./lexerErrors";
import { DECIMAL_SEPARATOR, orderedSymbols, TODO_LOCATION, Token, tokenToString, TokenType } from "./token";

/* ----------------------------- Token handlers ----------------------------- */

//TODO refactor/clean up. Maybe a better structure, it might get messy real quick.

type Handler = (source: SourceData, position: number) => Token | null;

const handlers: Handler[] = [
  commentHandler,
  numberHandler,
  identifierHandler,
  ...makeReservedSymbolsHandlers(),
];

function commentHandler(source: SourceData, position: number): Token | null {
  const initialPosition = position;
  // Handles comments using '//' and '/* */'
  if (source.get(position) === "/") {
    if (source.get(position + 1) === "/") {
      position += 2;

      let value = "//";
      let current: string;
      //TODO might break to "\r"
      while ((current = source.get(position)) !== "" && current !== "\n") {
        value += current;
        position++;
        continue;
      }

      return {
        type: TokenType.Comment,
        value,
        location: source.getRange(initialPosition, position),
        id: "TODO",
        errors: [],
      };
    } else if (source.get(position + 1) === "*") {
      position += 2;

      let value = "/*";
      let current: string;
      while ((current = source.get(position)) !== "") {
        if ((current === "*" && source.get(position + 1) === "/")) {
          value += "*/";
          position += 2;
          break;
        }
        value += current;
        position++;
        continue;
      }

      const errors: LexerError[] = [];
      if (source.get(position) === "" && !value.endsWith("*/")) {
        errors.push({
          errorCode: LexerErrorCode.UnterminatedComment,
          message: `lexer error: Unterminated comment.`,
          range: source.getRange(initialPosition, position),
          severity: Severity.Warning,
          tokenId: "TODO",
        });
      }

      return {
        type: TokenType.Comment,
        value,
        location: source.getRange(initialPosition, position),
        id: "TODO",
        errors,
      };
    }
  }
  return null;
}

function numberHandler(source: SourceData, position: number): Token | null {
  const initialPosition = position;
  function getDigits() {
    let digits = "";

    let current: string;
    while ((current = source.get(position)) !== "") {
      if ("0" <= current && current <= "9") {
        digits += current;
      } else {
        break;
      }
      position++;
    }
    return digits;
  }

  const integerPart = getDigits();
  let value = integerPart;

  if (value.length === 0) {
    return null;
  }

  if (source.get(position) === DECIMAL_SEPARATOR) {
    position += DECIMAL_SEPARATOR.length;
    value += DECIMAL_SEPARATOR;

    const decimalPart = getDigits();
    value += decimalPart;
  }

  return {
    type: TokenType.Number,
    value,
    location: source.getRange(initialPosition, position),
    id: "TODO",
    errors: [],
  };
}

function identifierHandler(source: SourceData, position: number): Token | null {
  const initialPosition = position;
  let value = "";

  let isFirst = true;
  let current: string;
  while ((current = source.get(position)) !== "") {
    //TODO maybe allow 'é' and similar.
    if (
      "a" <= current && current <= "z" ||
      "A" <= current && current <= "Z" ||
      !isFirst && "0" <= current && current <= "9" ||
      current === "_"
    ) {
      isFirst = false;
      value += current;
    } else {
      break;
    }
    position++;
  }

  if (value.length === 0) {
    return null;
  }

  return {
    type: TokenType.Identifier,
    value,
    location: source.getRange(initialPosition, position),
    id: "TODO",
    errors: [],
  };
}

function makeReservedSymbolsHandlers(): Handler[] {
  //TODO this can be done better
  return orderedSymbols.map(([symbol, type]) => (source: SourceData, position: number) => {
    let value: string | null = "";
    let offset = 0;

    let current: string;
    while ((current = source.get(position + offset)) !== "") {
      if (current !== symbol[offset]) {
        value = null;
        break;
      }

      offset++;
      if (offset >= symbol.length) {
        value = symbol;
        break;
      }
    }

    if (value === null) {
      return null;
    }

    return {
      type,
      value,
      location: source.getRange(position, position + offset),
      id: "TODO",
      errors: [],
    };
  });
}

/* ---------------------------- Token generation ---------------------------- */

export function tokenize(rawSource: string): Token[] {
  const source = new SourceData(rawSource);
  let position = 0;

  const tokens: Token[] = [];

  while (!source.atEOF(position)) {
    if ([" ", "\t", "\n", "\r"].includes(source.get(position))) {
      position++;
      continue;
    }
    // get tokens
    const tokenCandidates = handlers.map((h) => h(source, position)).filter((t) => t !== null);

    if (tokenCandidates.length === 0) {
      const errors: LexerError[] = [
        // diagnostics.addLexer({
        {
          errorCode: LexerErrorCode.UnknownToken,
          //TODO better message
          message: `lexer error: unrecognized token. (code: ${source.get(position).charCodeAt(0)}) at '${source.remainder(position, 120)}'`,
          range: source.getRange(position, position + 1),
          severity: Severity.Error,
          tokenId: "TODO",
          character: source.get(position),
          nextWord: source.getNextWord(position),
        },
      ];
      const token: Token = {
        type: TokenType.InvalidToken,
        value: source.get(position),
        location: source.getRange(position, position + 1),
        id: "TODO",
        isSynthetic: true,
        errors,
      };

      addToken(token);
    } else {
      // handle collisions
      const token = tokenCandidates.reduce((prev, current) => selectToken(prev, current, position, source));
      addToken(token);
    }
  }

  return tokens;

  function addToken(token: Token) {
    console.log(`Added token ${tokenToString(token)}`);
    token.errors.forEach((e) => diagnostics.addLexer(e));
    tokens.push(token);

    position += token.location.length;
  }
}

function selectToken(prev: Token, current: Token, position: number, source: SourceData) {
  // We prioritize the longer token
  if (current.value.length > prev.value.length) {
    return current;
  } else if (current.value.length < prev.value.length) {
    return prev;
  } else {
    // We prioritize more specific tokens, like keywords, over identifiers
    if (current.type === TokenType.Identifier) {
      return prev;
    } else if (prev.type === TokenType.Identifier) {
      return current;
    } else {
      const message = `lexer error: We found 2 tokens that are the same length and we couldn't choose one. Token 1: ${tokenToString(prev)}, Token 2: ${tokenToString(current)}`;
      diagnostics.addLexer({
        errorCode: LexerErrorCode.AmbiguousParse,
        message: message,
        range: source.getRange(position, position + current.value.length),
        severity: Severity.Error,
        tokenId: "TODO",
        token1: prev,
        token2: current,
      });
      console.error(message);
      return current;
    }
  }
}

class SourceData {
  private source: string;
  private lineStartIndices: number[] = [0];

  constructor(source: string) {
    this.source = source;

    for (let i = 0; i < source.length; i++) {
      if (source[i] === "\n") {
        this.lineStartIndices.push(i + 1);
      }
    }
  }

  public get(position: number) {
    if (this.atEOF(position)) {
      return "";
    }
    return this.source[position];
  }

  public atEOF(position: number) {
    return position >= this.source.length;
  }

  public getLocation(position: number): SourceLocation {
    let lineNumber = 0;
    while (lineNumber + 1 < this.lineStartIndices.length && this.lineStartIndices[lineNumber + 1] <= position) {
      lineNumber++;
    }
    const character = position - this.lineStartIndices[lineNumber];

    return { line: lineNumber, character };
  }

  public getRange(start: number, end: number): SourceRange {
    return {
      filePath: "TODO",
      start: this.getLocation(start),
      end: this.getLocation(end),
      length: end - start,
    };
  }

  /* ---------------------------------- Utils --------------------------------- */
  public getNextWord(position: number) {
    let word = "";
    let current: string;
    while ((current = this.get(position)) !== "" && !" \t\n\r".includes(current)) {
      word += current;
      position++;
    }
    return word;
  }

  public remainder(position: number, maxLength?: number) {
    return this.source.slice(position, maxLength ? position + maxLength : undefined);
  }
}
