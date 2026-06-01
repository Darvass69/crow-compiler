import { Token, TokenType } from "../../1_lexer/token";
import { Expression, Statement } from "../astNodes";
import { BindingPower } from "../bindingPower";
import { Parser } from "../parser";
import { parseAssignmentExpression, parseBinaryExpression, parseGroupingExpression, parsePrefixExpression, parsePrimaryExpression } from "./expression";
import { parseBlockStatement, parseIfStatement, parseLoopStatement, parseVariableDeclarationStatement } from "./statement";

export type StmtHandler = (parser: Parser) => Statement;
export type NudHandler = ((parser: Parser) => Expression) & { bp: number };
export type LedHandler = ((parser: Parser, left: Expression) => Expression) & { bp: number };

export type StmtParsingFunction = (parser: Parser) => Statement;
export type NudParsingFunction = (parser: Parser, bp: BindingPower) => Expression;
export type LedParsingFunction = (parser: Parser, left: Expression, bp: BindingPower) => Expression;

export default class ParsingFunctionLookup {
  private statementLookup: Map<TokenType, StmtHandler> = new Map();
  private nudLookup: Map<TokenType, NudHandler> = new Map();
  private ledLookup: Map<TokenType, LedHandler> = new Map();

  constructor() {
    //& Operators
    // Unary
    // this.addNud(TokenType.LogicalNot, BindingPower.prefix, parsePrefixExpression);
    this.addNud(TokenType.BitwiseNot, BindingPower.prefix, parsePrefixExpression);
    // this.addNud(TokenType.UnaryMinus, BindingPower.prefix, parsePrefixExpression);

    // this.addNud(TokenType.PlusPlus, BindingPower.prefix, parseStateExpression);
    // this.addNud(TokenType.MinusMinus, BindingPower.prefix, parseStateExpression);

    // Binary
    // this.addLed(TokenType.LogicalOr, BindingPower.logical_or, parseBinaryExpression);
    // this.addLed(TokenType.LogicalAnd, BindingPower.logical_and, parseBinaryExpression);
    this.addLed(TokenType.BitwiseOr, BindingPower.bitwise_or, parseBinaryExpression);
    this.addLed(TokenType.BitwiseXor, BindingPower.bitwise_xor, parseBinaryExpression);
    this.addLed(TokenType.BitwiseAnd, BindingPower.bitwise_and, parseBinaryExpression);

    this.addLed(TokenType.Equals, BindingPower.equality, parseBinaryExpression);
    this.addLed(TokenType.NotEqual, BindingPower.equality, parseBinaryExpression);
    this.addLed(TokenType.Smaller, BindingPower.relational, parseBinaryExpression);
    this.addLed(TokenType.Greater, BindingPower.relational, parseBinaryExpression);
    this.addLed(TokenType.SmallerEqual, BindingPower.relational, parseBinaryExpression);
    this.addLed(TokenType.GreaterEqual, BindingPower.relational, parseBinaryExpression);

    // this.addLed(TokenType.BitShiftLeft, BindingPower.bitwise_shift, parseBinaryExpression);
    // this.addLed(TokenType.BitShiftRight, BindingPower.bitwise_shift, parseBinaryExpression);
    // this.addLed(TokenType.BitShiftUnsignedRight, BindingPower.bitwise_shift, parseBinaryExpression);

    this.addLed(TokenType.Add, BindingPower.additive, parseBinaryExpression);
    this.addLed(TokenType.Minus, BindingPower.additive, parseBinaryExpression);

    this.addLed(TokenType.Multiply, BindingPower.multiplicative, parseBinaryExpression);
    this.addLed(TokenType.Divide, BindingPower.multiplicative, parseBinaryExpression);
    this.addLed(TokenType.Modulo, BindingPower.multiplicative, parseBinaryExpression);

    // this.addLed(TokenType.Exponent, BindingPower.exponentiation, parseBinaryExpression);

    // Primary
    this.addNud(TokenType.Number, BindingPower.primary, parsePrimaryExpression);
    // this.addNud(TokenType.String, BindingPower.primary, parsePrimaryExpression);
    this.addNud(TokenType.Identifier, BindingPower.primary, parsePrimaryExpression);

    // this.addNud(TokenType.OpenParen, BindingPower.grouping, parseGroupingExpression);
    // this.addLed(TokenType.OpenParen, BindingPower.access_call_new, parseCallExpression);

    // Assignment
    this.addLed(TokenType.Assignment, BindingPower.assignment, parseAssignmentExpression);

    // Statement
    // this.addStmt(TokenType.Const, parseVariableDeclarationStatement);
    this.addStmt(TokenType.Var, parseVariableDeclarationStatement);
    // this.addStmt(TokenType.Function, parseFunctionDeclarationStatement);
    // this.addStmt(TokenType.Async, parseFunctionDeclarationStatement); //Could also be parseAsyncStatement that then calls parseFunctionDeclarationStatement (or parse statement)
    // this.addStmt(TokenType.Return, parseReturnStatement);
    // this.addStmt(TokenType.If, parseIfStatement);
    // this.addStmt(TokenType.For, parseLoopStatement);
    // this.addStmt(TokenType.While, parsewhileStatement);

    // this.addStmt(TokenType.OpenCurly, parseBlockStatement);
  }

  /** Add a Token/handler to the map */
  private addStmt(type: TokenType, parsingFunction: StmtParsingFunction) {
    //TODO check that there wasn't something there already
    this.statementLookup.set(
      type,
      parsingFunction,
    );
  }

  /** Add a Token/handler to the map */
  private addNud(type: TokenType, bp: BindingPower, parsingFunction: NudParsingFunction) {
    //TODO check that there wasn't something there already
    this.nudLookup.set(
      type,
      ParsingFunctionLookup.createNudHandler(bp, parsingFunction),
    );
  }

  /** Add a Token/handler to the map */
  private addLed(type: TokenType, bp: BindingPower, parsingFunction: LedParsingFunction) {
    //TODO check that there wasn't something there already
    this.ledLookup.set(
      type,
      ParsingFunctionLookup.createLedHandler(bp, parsingFunction),
    );
  }

  public static createNudHandler(bp: BindingPower, parsingFunction: NudParsingFunction): NudHandler {
    const { [parsingFunction.name]: handler } = {
      [parsingFunction.name]: ((parser: Parser) => parsingFunction(parser, bp)) as NudHandler,
    };
    handler.bp = bp;
    return handler;
  }

  public static createLedHandler(bp: BindingPower, parsingFunction: LedParsingFunction): LedHandler {
    const { [parsingFunction.name]: handler } = {
      [parsingFunction.name]: ((parser: Parser, left: Expression) => parsingFunction(parser, left, bp)) as LedHandler,
    };
    handler.bp = bp;
    return handler;
  }

  public getStmtHandler(type: TokenType) {
    return this.statementLookup.get(type);
  }

  public getNudHandler(type: TokenType) {
    return this.nudLookup.get(type);
  }

  public getLedHandler(type: TokenType) {
    return this.ledLookup.get(type);
  }
}
