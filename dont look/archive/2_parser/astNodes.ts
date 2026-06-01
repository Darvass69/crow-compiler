import { Token, TokenType } from "../1_lexer/token";

export enum ASTNodeType {
  ExpressionStatement,
  BlockStatement,
  VariableDeclarationStatement,
  // FunctionDeclarationStatement,
  // ReturnStatement,
  IfStatement,
  LoopStatement,

  PrefixExpression,

  AssignmentExpression,
  BinaryExpression,

  NumberExpression,
  StringExpression,
  IdentifierExpression,
}

type ASTNodeBase<T extends ASTNodeType> = {
  type: T;
  // start: number;
  // end: number;
};

type AstNodeProperties<T extends ASTNodeType> = Omit<ASTNode<T>, "type">;

export function createAstNode<T extends ASTNodeType>(
  type: T,
  properties: AstNodeProperties<T>,
) {
  return {
    type,
    ...properties,
  } as ASTNode<T>;
}

export type ASTNode<T extends ASTNodeType> = Statement<T> | Expression<T>;
export type Statement<T extends ASTNodeType = ASTNodeType> = ASTNodeBase<T> & (ExpressionStatement | BlockStatement | VariableDeclarationStatement | IfStatement | LoopStatement);
export type Expression<T extends ASTNodeType = ASTNodeType> =
  & ASTNodeBase<T>
  & (PrefixExpression | AssignmentExpression | BinaryExpression | NumberExpression | StringExpression | IdentifierExpression);

/* -------------------------------- Statement ------------------------------- */
export type ExpressionStatement = ASTNodeBase<ASTNodeType.ExpressionStatement> & {
  expression: Expression;
};

export type BlockStatement = ASTNodeBase<ASTNodeType.BlockStatement> & {
  body: Statement[];
};

export type VariableDeclarationStatement = ASTNodeBase<ASTNodeType.VariableDeclarationStatement> & {
  kind: "const" | "var";
  id: IdentifierExpression[];
  init?: Expression;
  //TODO type
};

export type IfStatement = ASTNodeBase<ASTNodeType.IfStatement> & {
  test: Expression;
  consequent: BlockStatement;
  alternate?: IfStatement | BlockStatement;
};

export type LoopStatement = ASTNodeBase<ASTNodeType.LoopStatement> & {
  init: Statement[];
  test: Expression;
  update: Expression;
  body: BlockStatement;
};

/* ------------------------------- Expression ------------------------------- */
export type PrefixExpression = ASTNodeBase<ASTNodeType.PrefixExpression> & {
  operator: Token; //TODO specify what token can be here
  argument: Expression;
};

export type AssignmentExpression = ASTNodeBase<ASTNodeType.AssignmentExpression> & {
  left: Expression;
  operator: Token; //TODO specify what token can be here
  right: Expression;
};

export type BinaryExpression = ASTNodeBase<ASTNodeType.BinaryExpression> & {
  left: Expression;
  operator: Token; //TODO specify what token can be here
  right: Expression;
};

export type NumberExpression = ASTNodeBase<ASTNodeType.NumberExpression> & {
  value: string;
};

export type StringExpression = ASTNodeBase<ASTNodeType.StringExpression> & {
  value: string;
};

export type IdentifierExpression = ASTNodeBase<ASTNodeType.IdentifierExpression> & {
  name: string;
};

export function astToStringJson(key: any, value: any) {
  if (key === "type") {
    return ASTNodeType[value];
  }

  if (key === "operator") {
    return TokenType[(value as Token).type];
  }
  return value;
}
