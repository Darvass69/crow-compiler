import { ASTNode, ASTNodeType, Expression } from "../../2_parser/astNodes";

function NotImplemented() {
  throw "Not implemented yet";
}

export function compile(ast: ASTNode<ASTNodeType>): Uint8Array {

}


function compileExpression(node: Expression) {
	switch (node.type) {
		case ASTNodeType.NumberExpression: {
			node.value
			+
			
			return;
		}
	} 
}