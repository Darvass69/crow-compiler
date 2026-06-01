import { TokenType } from "../../1_lexer/token";
import { diagnostics, Severity } from "../../diagnostics/diagnostics";
import { AST } from "../astNodes";
import { BindingPower } from "../bindingPower";
import { Parser } from "../parser";
import { ParserError, ParserErrorCode } from "../parserErrors";
import { LedHandler } from "./lookup";

export function parseExpression(p: Parser, bp: BindingPower) {
  const nudHandler = p.lookup.getNudHandler(p.peek().type);

  if (nudHandler === undefined) {
    const error: ParserError = {
      errorCode: ParserErrorCode.MissingNUD,
      message: "Invalid start of expression",
      tokens: [p.peek()],
      severity: Severity.Error,
    };
    diagnostics.addParser(error);

    return AST.createNode(AST.Type.ErrorNode, [...error.tokens], { error });
  }

  let left = nudHandler(p);

  let ledHandler: LedHandler | undefined;
  while ((ledHandler = p.lookup.getLedHandler(p.peek().type)) && ledHandler.bp > bp) {
    left = ledHandler(p, left);
  }

  return left;
}

export function parseBinaryExpression(p: Parser, left: AST.Expression, bp: BindingPower) {
  const token = p.eat();
  const right = parseExpression(p, bp);

  return AST.createNode(AST.Type.BinaryExpression, [...left.span, token, ...right.span], { left, operator: token, right });
}

export function parsePrimaryExpression(p: Parser, bp: BindingPower) {
  const token = p.eat();

  switch (token.type) {
    case TokenType.Number: {
      return AST.createNode(AST.Type.NumberExpression, [token], { value: token.value });
    }
    case TokenType.Identifier: {
      return AST.createNode(AST.Type.IdentifierExpression, [token], { name: token.value });
    }
    case TokenType.Boolean: {
      return AST.createNode(AST.Type.BooleanExpression, [token], { value: token.value });
    }
    default: {
      //TODO this error will never happen unless we do an oopsy and make the lookup table wrong.
      throw "Parser: primary not found";
    }
  }
}

export function parseGroupingExpression(p: Parser, bp: BindingPower) {
  p.expect(TokenType.OpenParen);
  const expression = parseExpression(p, BindingPower.default_bp);
  //TODO error
  // Only happens when we get something after an expr that can't be handled by an expr.
  // `(1+1 var`
  p.expect(TokenType.CloseParen);

  return expression;
}

export function parseAssignmentExpression(p: Parser, left: AST.Expression, bp: BindingPower) {
  const identifier = left.type === AST.Type.IdentifierExpression ? left : undefined;

  if (identifier === undefined) {
    const error: ParserError = {
      errorCode: ParserErrorCode.ExpectedIdentifier,
      //TODO better message
      message: `Expected identifier, got ${left.type}`,
      tokens: [...left.span],
      severity: Severity.Error,
    };
    diagnostics.addParser(error);

    return AST.createNode(AST.Type.ErrorNode, [...error.tokens], { error });
  }

  const assignmentToken = p.expect(TokenType.Assignment);

  const expression = parseExpression(p, bp);

  return AST.createNode(AST.Type.AssignmentExpression, [...identifier.span, assignmentToken, ...expression.span], { identifier, expression });
}

export function parseFunctionCallExpression(p: Parser, left: AST.Expression, bp: BindingPower) {
  const identifier = left.type === AST.Type.IdentifierExpression ? left : undefined; //! not true, we can have an anonymous function

  if (identifier === undefined) {
    const error: ParserError = {
      errorCode: ParserErrorCode.ExpectedIdentifier,
      //TODO better message
      message: `Expected identifier, got ${left.type}`,
      tokens: [p.peek()],
      severity: Severity.Error,
    };
    diagnostics.addParser(error);

    return AST.createNode(AST.Type.ErrorNode, [...error.tokens], { error });
  }

  const args = parseArguments(p);

  return AST.createNode(AST.Type.FunctionCallExpression, [...identifier.span, ...(args.flatMap((arg) => arg.span))], { callee: identifier, args });
}

function parseArguments(p: Parser) {
  const args: AST.Expression[] = [];

  p.expect(TokenType.OpenParen);

  if (p.peek().type === TokenType.CloseParen) {
    p.expect(TokenType.CloseParen);
    return args;
  }

  args.push(parseExpression(p, BindingPower.default_bp));
  while (p.peek().type !== TokenType.CloseParen) {
    p.expect(TokenType.Comma);
    args.push(parseExpression(p, BindingPower.default_bp));
  }

  p.expect(TokenType.CloseParen);

  return args;
}
