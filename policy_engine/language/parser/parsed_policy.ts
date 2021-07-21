import { ParsingException } from "../../common/exceptions/parsing_exception";


export class ParsedPolicy {
     name: string;
     syntaxTree: Array<any>;


     constructor(abstractSyntaxTree: Array<any>, name: string) {
        this.syntaxTree = abstractSyntaxTree;
        this.name = name;
    }


    at(index: number): any {
        if(index > this.treeSize()) {
            throw new ParsingException(`index: ${index} is out of bounds`);
        }
        return this.syntaxTree[index];
    }


    treeSize(): number {
        return this.syntaxTree.length;
    }
}
