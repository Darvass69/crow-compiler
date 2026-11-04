import { LexerError } from "../front-end/1_lexer/lexerErrors";
import { ParserError } from "../front-end/2_parser/parserErrors";

//TODO don't make it global

export type SourceLocation = { line: number; character: number };

export type SourceRange = {
  filePath: string;
  start: SourceLocation;
  // inclusive?
  end: SourceLocation;
  length: number;
};

export enum Severity {
  Error = 1,
  Warning,
  Info,
  Hint,
}

class Diagnostics {
  public lexerDiagnostics: LexerError[] = [];
  public parserDiagnostics: ParserError[] = [];

  public addLexer(error: LexerError) {
    this.lexerDiagnostics.push(error);
  }

  public addParser(error: ParserError) {
    this.parserDiagnostics.push(error);
  }

  public reset() {
    this.lexerDiagnostics.splice(0);
    this.parserDiagnostics.splice(0);
  }
}

export const diagnostics = new Diagnostics();
