type Token = any;

export namespace AST {
  /* ------------------------------- Definitions ------------------------------ */
  export enum Type {
    Module,

    ExpressionStatement,
    VariableDeclarationStatement,
    // BlockStatement,
    // IfStatement,
    // LoopStatement,
    PrintStatement,

    // PrefixExpression,

    // AssignmentExpression,

    BinaryExpression,

    BooleanExpression,
    NumberExpression,
    IdentifierExpression,
  }

  type NodeShapes = {
    [Type.Module]: { body: Statement[] };

    [Type.ExpressionStatement]: { expression: Expression };
    [Type.VariableDeclarationStatement]: { identifiers: Node<Type.IdentifierExpression>; init?: Expression };
    [Type.PrintStatement]: { expression: Expression };

    [Type.BinaryExpression]: {
      left: Expression;
      operator: Token; //TODO specify what token can be here
      right: Expression;
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
  };

  /* --------------------------------- Helpers -------------------------------- */
  type NodeMap = {
    [K in keyof NodeShapes]: { type: K } & NodeShapes[K];
  };

  export type Node<T extends keyof NodeMap = keyof NodeMap> = NodeMap[T];

  export type Statement = Extract<
    Node,
    {
      type:
        | Type.ExpressionStatement
        | Type.VariableDeclarationStatement
        | Type.PrintStatement;
    }
  >;

  export type Expression = Extract<
    Node,
    {
      type:
        | Type.BinaryExpression
        | Type.BooleanExpression
        | Type.NumberExpression
        | Type.IdentifierExpression;
    }
  >;

  export function createNode<T extends Node["type"]>(
    type: T,
    properties: NodeShapes[T],
  ) {
    return {
      type,
      ...properties,
    };
  }
}

export namespace TypedAST {
  export interface ResolvedType {
    type: "int32" | "bool";
  }

  type AddResolvedType<N extends AST.Node = AST.Node> = N extends AST.Expression ? N & { resolvedType: ResolvedType } : N & { resolvedType: false };

  type RecurseArray<A extends AST.Node[]> = { [K in keyof A]: TypeAST<A[K]> };

  // distributive conditional to handle unions like T | undefined
  type MapNode<T> = T extends AST.Node[] ? RecurseArray<T>
    : T extends AST.Node ? TypeAST<T>
    : T;

  // main TypeAST
  type TypeAST<N extends AST.Node = AST.Node> =
    & AddResolvedType<N>
    & {
      [K in keyof N]: MapNode<N[K]>;
    };

  /* ------------------------- Forwarding declarations ------------------------ */
  export type Node<T extends AST.Type = AST.Type> = TypeAST<AST.Node<T>>;

  export import Type = AST.Type;

  export type Statement = TypeAST<AST.Statement>;
  export type Expression = TypeAST<AST.Expression>;

  /* --------------------------------- Helpers -------------------------------- */
  export function createNode<T extends Node["type"]>(
    type: T,
    properties: Omit<Node<T>, "type">,
  ) {
    return {
      type,
      ...properties,
    } as Node<T>;
  }
}

//!!! This should not have the any result
function resolveType(node: AST.Node) {
  switch (node.type) {
    case AST.Type.Module: {
      const body = node.body.map(resolveType);
      return TypedAST.createNode(TypedAST.Type.Module, { body, resolvedType: false });
    }

    case AST.Type.ExpressionStatement: {
      const expression = resolveType(node.expression);
      return TypedAST.createNode(TypedAST.Type.ExpressionStatement, { expression, resolvedType: false });
    }

    case AST.Type.VariableDeclarationStatement: {
      const identifiers = resolveType(node.identifiers);
      const init = node.init ? resolveType(node.init) : undefined;
      return TypedAST.createNode(TypedAST.Type.VariableDeclarationStatement, { identifiers, init, resolvedType: false });
    }

    case AST.Type.PrintStatement: {
      const expression = resolveType(node.expression);
      return TypedAST.createNode(TypedAST.Type.PrintStatement, { expression, resolvedType: false });
    }

    case AST.Type.BinaryExpression: {
      const left = resolveType(node.left);
      const right = resolveType(node.right);
      return TypedAST.createNode(TypedAST.Type.BinaryExpression, {
        left,
        operator: node.operator,
        right,
        resolvedType: { type: "int32" },
      });
    }

    case AST.Type.BooleanExpression:
      return TypedAST.createNode(TypedAST.Type.BooleanExpression, {
        value: node.value,
        resolvedType: { type: "int32" },
      });

    case AST.Type.NumberExpression:
      return TypedAST.createNode(TypedAST.Type.NumberExpression, {
        value: node.value,
        resolvedType: { type: "int32" },
      });

    case AST.Type.IdentifierExpression:
      return TypedAST.createNode(TypedAST.Type.IdentifierExpression, {
        name: node.name,
        resolvedType: { type: "int32" },
      });
  }
}
