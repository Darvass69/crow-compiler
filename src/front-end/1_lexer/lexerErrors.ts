import { Severity, SourceRange } from "../../diagnostics/diagnostics";
import { Token } from "./token";

export enum LexerErrorCode {
  UnknownToken,
  AmbiguousParse,
  UnterminatedComment,
}

type ErrorBase<C extends LexerErrorCode = LexerErrorCode> = {
  errorCode: C;
  //TODO message from templates
  message: string;
  range: SourceRange;
  severity: Severity;
  // If the error is linked to a specific token
  tokenId?: string;
};
export type LexerError =
  | (
    & ErrorBase<LexerErrorCode.UnknownToken>
    & {
      //TODO should probably be better than that? We are only doing one char instead of the rest of the token/word
      character: string;
      nextWord: string;
    }
  )
  | (
    ErrorBase<LexerErrorCode.AmbiguousParse> & {
      token1: Token;
      token2: Token;
    }
  )
  | (ErrorBase<LexerErrorCode.UnterminatedComment>);
