import { Token, TokenType } from "../1_lexer/token";
import ParsingFunctionLookup from "./parsingFunctions/lookup";
import { parseProgram } from "./parsingFunctions/statement";

export function parseAST(tokens: Token[]) {
  return parseProgram(new Parser(tokens));
}

//TODO we could do something to track usage of tokens in a way that we don't have to worry about tracking them in the parsing functions?
//TODO We could do like start tracking then stop tracking, and just collect the tokens?
//TODO or create node could auto magically collect the tokens from the things we pass? Might be more complicated
//TODO I think we need a completely different system to track spans.

//TODO we might also need a different way to do type checking/name resolution for functions/blocks/structs. Like, define the function before we parse the insides.

export class Parser {
  private tokens: Token[] = [];
  private position: number = 0;
  public lookup: ParsingFunctionLookup = new ParsingFunctionLookup();

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public hasTokens() {
    return this.position < this.tokens.length;
  }

  public peek() {
    return this.tokens[this.position];
  }

  public eat(): Token {
    const token = this.peek();
    this.position++;
    return token;
  }

  public expect<T extends TokenType>(expected: T, error?: (expected: TokenType, received: Token) => string): Token & { type: T } {
    const token = this.peek();

    if (token.type !== expected) {
      //TODO error
      let message: string;
      if (error !== undefined) {
        message = error(expected, token);
      } else {
        message = `Parser: Expected ${TokenType[expected]} but received ${TokenType[token.type]} instead.`;
      }
      throw message;
    }

    return this.eat() as any;
  }
}
