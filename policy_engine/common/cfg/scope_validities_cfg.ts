export class ScopeValiditiesCfg {
    defaultBoder: Date;
    scopeBorders: Map<string, Date> = new Map<string, Date>();
    constructor(defaultBorder: Date, scopeBorders: Map<string, Date>) {
        this.defaultBoder = defaultBorder;
        this.scopeBorders = scopeBorders;
    }
}
