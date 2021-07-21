export class OidcCfg {
    issuer: string;
    name: string;
    publicKey: string;
    grantType: string;
    clientId: string;


    constructor(
        issuer: string, name: string, publicKey: string,
        grantType: string, clientId: string
    ) {
        this.issuer = issuer;
        this.name = name;
        this.publicKey = publicKey;
        this.grantType = grantType !== undefined ?
            grantType : 'authorization_code';
        this.clientId = clientId;
    }
}
