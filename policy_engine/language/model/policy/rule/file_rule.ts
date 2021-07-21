export class FileRule {
    name: string;
    scope: string;
    files: Array<string>;


    constructor(name:string, scope:string, files:Array<string>) {
        this.name = name;
        this.scope = scope;
        this.files = files;
    }
}
