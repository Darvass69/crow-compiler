type Token = string;

export namespace AST {
  /* ------------------------------- Definitions ------------------------------ */
  export enum Type {
    Module,
    ExpressionStatement,
    NumberExpression,
  }

  type NodeShapes = {
    [Type.Module]: { body: Statement[] };
    [Type.ExpressionStatement]: { expression: Expression };

    [Type.NumberExpression]: {
      value: string;
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
      type: Type.ExpressionStatement;
    }
  >;

  export type Expression = Extract<
    Node,
    {
      type: Type.NumberExpression;
    }
  >;
}

export namespace TypedAST {
  export interface ResolvedType {
    type: "int32" | "bool";
  }

  // Helper: add resolvedType only to expressions
  type AddResolved<T> = T extends AST.Expression ? { resolvedType: ResolvedType } : {};

  // Recursive mapper that:
  // 1) recurses into arrays/tuples,
  // 2) augments AST nodes,
  // 3) leaves scalars/tokens/etc. alone.
  type WithResolvedTypes<T> =
    // Handle readonly arrays & tuples
    T extends readonly (infer U)[] ? ReadonlyArray<WithResolvedTypes<U>>
      // Handle mutable arrays
      : T extends (infer U)[] ? WithResolvedTypes<U>[]
      // Handle AST nodes (note the <any> to match the generic)
      : T extends AST.Node<any> ? { [K in keyof T]: WithResolvedTypes<T[K]> } & AddResolved<T>
      // Everything else (tokens, primitives, etc.)
      : T;

  /* ------------------------- Forwarding declarations ------------------------ */
  export type Node<T extends AST.Type = AST.Type> = WithResolvedTypes<AST.Node<T>>;

  export import Type = AST.Type;

  export type Statement = WithResolvedTypes<AST.Statement>;
  export type Expression = WithResolvedTypes<AST.Expression>;
}

let a: TypedAST.Node<AST.Type.Module> = {
  type: TypedAST.Type.Module,
  body: [{
    type: TypedAST.Type.ExpressionStatement,
    expression: { type: TypedAST.Type.NumberExpression, value: "1", resolvedType: { type: "int32" } },
  }],
};

let b: AST.Node<AST.Type.Module> = {
  type: TypedAST.Type.Module,
  body: [{
    type: TypedAST.Type.ExpressionStatement,
    expression: { type: TypedAST.Type.NumberExpression, value: "1" },
  }],
} as const;
a = b;

let aa: TypedAST.Node<AST.Type.ExpressionStatement> = {
  type: TypedAST.Type.ExpressionStatement,
  expression: { type: TypedAST.Type.NumberExpression, value: "1", resolvedType: { type: "int32" } },
};

let bb: AST.Node<AST.Type.ExpressionStatement> = {
  type: TypedAST.Type.ExpressionStatement,
  expression: { type: TypedAST.Type.NumberExpression, value: "1" },
};
aa = bb;

let aaa: TypedAST.Node<AST.Type.NumberExpression> = {
  type: TypedAST.Type.NumberExpression,
  value: "1",
  resolvedType: { type: "int32" },
};

let bbb: AST.Node<AST.Type.NumberExpression> = {
  type: TypedAST.Type.NumberExpression,
  value: "1",
};
aaa = bbb;

// aaa = {
//   type: TypedAST.Type.NumberExpression,
//   value: "1",
// };

// let c = {
//   type: TypedAST.Type.Module,
//   body: [{
//     type: TypedAST.Type.ExpressionStatement,
//     expression: { type: TypedAST.Type.NumberExpression, value: "1" },
//   }],
// };
// a = c;

// a = {
//   type: TypedAST.Type.Module,
//   body: [{
//     type: TypedAST.Type.ExpressionStatement,
//     expression: { type: TypedAST.Type.NumberExpression, value: "1" },
//   }],
// };
