import { Token } from "../1_lexer/token";
import { Severity } from "../diagnostics/diagnostics";

export enum ParserErrorCode {
  MissingNUD,
  ExpectedIdentifier,
}

type ErrorBase<C extends ParserErrorCode = ParserErrorCode> = {
  errorCode: C;
  //TODO message from templates
  message: string;
  tokens: Token[];
  severity: Severity;
  // If the error is linked to a specific AST node
  nodeId?: string;
};
export type ParserError =
  | (ErrorBase<ParserErrorCode.MissingNUD>)
  | (
    ErrorBase<ParserErrorCode.ExpectedIdentifier>
  );

/*
2 types of recovery:
  next token
  next line/statement

maybe we just pass an recovery handler? And the default one is statement?


expr:
errors can only be:
  inside handler (specific cases)
  missing/unknown nud

  not for led


*/
