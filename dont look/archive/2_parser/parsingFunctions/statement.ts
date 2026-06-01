import { TokenType } from "../../1_lexer/token";
import { ASTNodeType, BlockStatement, createAstNode, Expression, IfStatement, Statement } from "../astNodes";
import { BindingPower } from "../bindingPower";
import { Parser } from "../parser";
import { parseExpression } from "./expression";

export function parseProgram(p: Parser) {
  const body: Statement[] = [];

  while (p.hasTokens()) {
    body.push(parseStatement(p));
  }

  return createAstNode(ASTNodeType.BlockStatement, { body });
}

function parseStatement(p: Parser) {
  const handler = p.lookup.getStmtHandler(p.currentToken().type);

  if (handler !== undefined) {
    return handler(p);
  }

  return parseExpressionStatement(p);
}

function parseExpressionStatement(p: Parser) {
  const expression = parseExpression(p, BindingPower.default_bp);
  p.expect(TokenType.EndOfStatement);

  return createAstNode(ASTNodeType.ExpressionStatement, { expression });
}

// export function parseBlockStatement(p: Parser) {
//   p.expect(TokenType.OpenCurly);

//   const body = [];
//   while (p.hasTokens() && p.currentToken().type !== TokenType.CloseCurly) {
//     body.push(parseStatement(p));
//   }

//   p.expect(TokenType.CloseCurly);
//   return createAstNode(ASTNodeType.BlockStatement, { body });
// }

export function parseVariableDeclarationStatement(p: Parser) {
  let init: Expression | undefined;
  const modifier = p.eat();
  const kind = modifier.type === TokenType.Const ? "const" : "var";

  //TODO handle multiple declarations at the same time
  const id = p.expect(TokenType.Identifier);

  if (p.currentToken().type !== TokenType.EndOfStatement) {
    p.expect(TokenType.Assignment);
    init = parseExpression(p, BindingPower.assignment);
  }

  p.expect(TokenType.EndOfStatement);

  return createAstNode(ASTNodeType.VariableDeclarationStatement, { kind, id: [createAstNode(ASTNodeType.IdentifierExpression, { name: id.value })], init });
}

export function parseIfStatement(p: Parser): IfStatement {
  p.eat();
  p.expect(TokenType.OpenParen);
  const test = parseExpression(p, BindingPower.assignment);
  p.expect(TokenType.CloseParen);
  const consequent = parseBlockStatement(p);

  let alternate: BlockStatement | IfStatement | undefined = undefined;
  if (p.currentToken().type === TokenType.Else) {
    p.eat();

    if (p.currentToken().type === TokenType.If) {
      alternate = parseIfStatement(p);
    } else {
      alternate = parseBlockStatement(p);
    }
  }

  return createAstNode(ASTNodeType.IfStatement, { test, consequent, alternate });
}

export function parseLoopStatement(p: Parser) {
  p.eat();
  p.expect(TokenType.OpenParen);
  const init = parseStatement(p);

  const test = parseExpression(p, BindingPower.default_bp);
  p.expect(TokenType.EndOfStatement);
  const update = parseExpression(p, BindingPower.default_bp);
  p.expect(TokenType.CloseParen);
  const body = parseBlockStatement(p);

  return createAstNode(ASTNodeType.LoopStatement, {
    init: [init],
    test,
    update,
    body,
  });
}
