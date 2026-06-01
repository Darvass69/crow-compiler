import { Token, tokenToStringJson, TokenType } from "../1_lexer/token";
import { ParserError, ParserErrorCode } from "./parserErrors";

export namespace AST {
  /* ------------------------------- Definitions ------------------------------ */
  export enum Type {
    Module,

    ExpressionStatement,
    VariableDeclarationStatement,
    BlockStatement,
    IfStatement,
    LoopStatement,
    PrintStatement,
    FunctionDeclarationStatement,
    ReturnStatement,

    // PrefixExpression,

    AssignmentExpression,

    BinaryExpression,

    FunctionCallExpression,

    BooleanExpression,
    NumberExpression,
    IdentifierExpression,

    ErrorNode,
  }

  type NodeShapes = {
    [Type.Module]: { body: Statement[] };

    [Type.ExpressionStatement]: { expression: Expression };
    [Type.VariableDeclarationStatement]: { identifiers: Node<Type.IdentifierExpression>; typeDef?: Node<Type.IdentifierExpression>; init?: Expression };
    [Type.BlockStatement]: { body: Statement[] };
    [Type.IfStatement]: { test: Expression; consequent: Node<Type.BlockStatement>; alternate?: Node<Type.IfStatement | Type.BlockStatement> };
    [Type.LoopStatement]: { /*init?: Statement[];*/ test: Expression; /*update?: Expression;*/ body: Node<Type.BlockStatement> }; //TODO init, how do we split statements?
    [Type.FunctionDeclarationStatement]: {
      name: Node<Type.IdentifierExpression>;
      params: Node<Type.VariableDeclarationStatement>[];
      returnTypeDef?: Node<Type.IdentifierExpression>;
      body: Node<Type.BlockStatement>;
    };
    [Type.ReturnStatement]: { expression?: Expression };
    [Type.PrintStatement]: { expression: Expression };

    [Type.AssignmentExpression]: {
      identifier: Node<Type.IdentifierExpression>;
      expression: Expression;
      // operator?: Token;
    };
    [Type.BinaryExpression]: {
      left: Expression;
      operator: Token; //TODO specify what token can be here
      right: Expression;
    };
    [Type.FunctionCallExpression]: {
      callee: Node<Type.IdentifierExpression>;
      args: Expression[];
    };
    [Type.BooleanExpression]: {
      value: string;
    };
    [Type.NumberExpression]: {
      value: string;
    };
    [Type.IdentifierExpression]: {
      name: string;
    };
    [Type.ErrorNode]: {
      error: ParserError;
    };
  };

  type NodeMap = {
    [K in keyof NodeShapes]: { type: K; span: Token[] } & NodeShapes[K];
  };

  export type Node<T extends keyof NodeMap = keyof NodeMap> = NodeMap[T];

  export type Statement = Extract<
    Node,
    {
      type:
        | Type.ExpressionStatement
        | Type.VariableDeclarationStatement
        | Type.BlockStatement
        | Type.IfStatement
        | Type.LoopStatement
        | Type.FunctionDeclarationStatement
        | Type.ReturnStatement
        | Type.ErrorNode
        | Type.PrintStatement;
    }
  >;

  export type Expression = Extract<
    Node,
    {
      type:
        | Type.AssignmentExpression
        | Type.BinaryExpression
        | Type.FunctionCallExpression
        | Type.BooleanExpression
        | Type.NumberExpression
        | Type.IdentifierExpression
        | Type.ErrorNode;
    }
  >;

  /* --------------------------------- Helpers -------------------------------- */
  export function createNode<T extends Node["type"]>(
    type: T,
    span: Token[],
    properties: NodeShapes[T],
  ) {
    return {
      type,
      span,
      ...properties,
    };
  }
}

/* ---------------------------------- Utils --------------------------------- */
export function astToStringJson(key: any, value: any) {
  if (key === "span") {
    if (Array.isArray(value)) {
      return JSON.parse(
        JSON.stringify(value, tokenToStringJson),
      );
    }
  }

  if (key === "type" && typeof value === "number") {
    return AST.Type[value];
  }

  if (key === "operator") {
    return TokenType[(value as Token).type];
  }
  return value;
}
