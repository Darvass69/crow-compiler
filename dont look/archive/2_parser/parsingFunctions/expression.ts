import { TokenType } from "../../1_lexer/token";
import { ASTNodeType, createAstNode, Expression } from "../astNodes";
import { BindingPower } from "../bindingPower";
import { Parser } from "../parser";
import { LedHandler } from "./lookup";

export function parseExpression(p: Parser, bp: BindingPower) {
  const nudHandler = p.lookup.getNudHandler(p.currentToken().type);

  if (nudHandler === undefined) {
    //TODO error
    throw "expected NUD";
  }

  let left = nudHandler(p);

  let ledHandler: LedHandler | undefined;
  while ((ledHandler = p.lookup.getLedHandler(p.currentToken().type)) && ledHandler.bp > bp) {
    left = ledHandler(p, left);
  }

  return left;
}

export function parsePrefixExpression(p: Parser, bp: BindingPower) {
  const token = p.eat();
  const expression = parseExpression(p, bp);

  return createAstNode(ASTNodeType.PrefixExpression, { argument: expression, operator: token });
}

export function parseAssignmentExpression(p: Parser, left: Expression, bp: BindingPower) {
  //TODO combined assignment
  const token = p.eat();
  const right = parseExpression(p, bp);

  return createAstNode(ASTNodeType.AssignmentExpression, { left, operator: token, right });
}

export function parseBinaryExpression(p: Parser, left: Expression, bp: BindingPower) {
  const token = p.eat();
  const right = parseExpression(p, bp);

  return createAstNode(ASTNodeType.BinaryExpression, { left, operator: token, right });
}

export function parsePrimaryExpression(p: Parser, bp: BindingPower) {
  const token = p.eat();

  switch (token.type) {
    case TokenType.Number: {
      return createAstNode(ASTNodeType.NumberExpression, { value: token.value });
    }
    // case TokenType.String: {
    //   return createAstNode(ASTNodeType.StringExpression, { value: token.value });
    // }
    case TokenType.Identifier: {
      return createAstNode(ASTNodeType.IdentifierExpression, { name: token.value });
    }
    default: {
      //TODO error message
      throw "primary not found";
    }
  }
}

export function parseGroupingExpression(p: Parser, bp: BindingPower) {
  // p.expect(TokenType.OpenParen);
  // const expression = parseExpression(p, BindingPower.default_bp);
  // p.expect(TokenType.CloseParen);

  // return expression;
}
