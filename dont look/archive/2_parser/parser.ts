import { Token, TokenType } from "../1_lexer/token";
import { ASTNodeType, BlockStatement } from "./astNodes";
import ParsingFunctionLookup from "./parsingFunctions/lookup";
import { parseProgram } from "./parsingFunctions/statement";

export class Parser {
  private tokens: Token[] = [];
  private position: number = 0;

  public lookup: ParsingFunctionLookup = new ParsingFunctionLookup();

  public Parse(tokens: Token[]): BlockStatement {
    this.tokens = tokens;
    this.position = 0;
    this.lookup = new ParsingFunctionLookup();

    return parseProgram(this);
  }

  public hasTokens() {
    return this.position < this.tokens.length && this.currentToken().type != TokenType.EOF;
  }

  public currentToken() {
    return this.tokens[this.position];
  }

  eat(): Token {
    const token = this.currentToken();
    this.position++;
    return token;
  }

  expect(expected: TokenType, error?: (expected: TokenType, received: Token) => string) {
    const token = this.currentToken();

    if (token.type !== expected) {
      //TODO error
      let message: string;
      if (error !== undefined) {
        message = error(expected, token);
      } else {
        message = `Expected ${TokenType[expected]} but received ${TokenType[token.type]} instead.`;
      }
      throw message;
    }

    return this.eat();
  }
}
