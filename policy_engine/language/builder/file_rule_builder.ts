import { FileRule } from '../model/policy/rule/file_rule';
import { BuilderException } from '../../common/exceptions/builder_exception';


export class FileRuleBuilder {
    _name: string;
    _oauthScope: string;
    _files: Array<string>;


    addName(name: string): FileRuleBuilder {
        this._name = name;
        return this;
    }


    addScope(parsedScope: any): FileRuleBuilder {
        this.handleFileRule(parsedScope);
        return this;
    }


    addFiles(files: Array<string>): FileRuleBuilder {
        this._files = files;
        return this;
    }


    handleFileRule(parsedScope: any): void {
        for (let i = 0; i < parsedScope.length; i++) {
            const currentCommand = parsedScope[i];
            switch (currentCommand.type) {
                case 'SINGLE_SCOPE': {
                    if (this._oauthScope !== undefined) {
                        throw new BuilderException("A file-rule may have only one scope command.");
                    }
                    this._oauthScope = currentCommand.scope;
                    break;
                }
                case 'FILE_LIST': {
                    if (this._files !== undefined) {
                        throw new BuilderException("A file-rule may have only one file list.");
                    }
                    this._files = new Array<string>();
                    for (const str of currentCommand.files) {
                        const help:string = <string>str;
                        this._files.push(help);
                    }
                    break;
                }
                default: {
                    throw new BuilderException(`The command type ${currentCommand.type} does not exist.`);
                }
            }
        }
    }


    build(): FileRule {
        return new FileRule(this._name, this._oauthScope, this._files);
    }
}