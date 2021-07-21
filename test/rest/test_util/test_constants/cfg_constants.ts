export let onlyValiditiesCfg = 
`
scope_validities:
    default: 1
    explicit: 
        - scope: scopeA
          days: 1
        - scope: scopeB
          days: 1
        - scope: scopeC
          days: 1
`;


export let onlyIdPsCfg = 
`
identity_providers:
    - name: local
      discovery_url: http://localhost:3333
      grant_type: authorization_code
      client_id: foo
    - name: second
      discovery_url: http://localhost:3333
      grant_type: implicit
      client_id: foo
    - name: third
      discovery_url: http://localhost:3333
      client_id: foo
`;


export let completeAppCfg = `
        ${onlyValiditiesCfg}
        ${onlyIdPsCfg}
`;