import { ASTNode, ASTNodeType } from "../2_parser/astNodes";

export type TypedASTNode<T extends ASTNodeType> = ASTNode<T>;

export function checkType(ast: ASTNode<ASTNodeType>): TypedASTNode<ASTNodeType> {
}
