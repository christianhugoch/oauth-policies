# OAuth Policies
## Policy Engine for OAuth 2.0 requests

This is a Policy Engine to permit or deny OAuth 2.0 requests without user interaction. A resource owner writes policies in a self-developed language, and decisions can be queried via a REST Interface.

The user management is based on a single sign on with OpenID Connect. Through this a user can log in with an existing profile (e.g. from Google/Facebook, or with a profile managed by a WSO2 Identity Provider) and link policies to its account.

This repository contains the engine, in [oauth-policy-dashboard](https://github.com/christianhugoch/oauth-policy-dashboard) you will find a web interface for administration and testing.
Read the docker section, if you quickly want to see a running system.

## Language
The language is rule based and was designed to be small and readable. You can imagine it as a mix of declarative commands in a file (like XACML) and a domain specific OAuth scripting language.

Its main purpose is to permit or deny OAuth scopes to an OAuth Client. It supports:
- scope/client filter
- time/day filter 
- different rule types (permit, deny or boolean)
- explicit rule calls
- boolean variables 
- logical operators (AND, OR and NOT)
- grouping with parentheses 
- import of policies
- grouping of scopes and clients (OAuth roles)
- file access rules to associate one scope with a list of files 

The syntax looks like this:
```
  permitScopeA : true {
      scope = scopeA; client = clientA
  }
  permitScopeB : true {
      scope = scopeB; client = clientB
  }
  grantToken {
    allow = false;
    allow = $permitScopeA;
    allow = $permitScopeB;
    allow;
  }
```
Here you see three rules, two permit rules (permitScopeA, permitScopeB) and one boolean rule (grantToken) as entry point. The following sections are going to explain the syntax piece by piece.
### sope / client filter
To filter by a scope simply write:
```
  scope = scopeA;
```
A client filter looks like this:
```
  client = clientA;
```
If you write:
```
  scope = scopeA; client = clientA;
```
it means that both checks have to be fulfilled, or the interpreter will stop on the first fail.
### time / day filter
To check if a request happened after 13:00 o'clock write:
```
  time > 13:00;
```
All comparison operators (<, >, <=, >= and =) are supported and if you omit the minutes:
```
  time > 12;
```
only full hours will be checked. That means **time > 12;** is equivalent to **time > 12:59;**.

To check if the request happened on a Monday you could write:
```
  day = monday;
```
Or to accept requests on Monday after 12:59 write a line like this:
```
  time > 12; day = monday;
```
### rule types
The language supports three rule types: permit, deny and boolean rules. A permit rule looks like this:
```
permitRule : true { 
  scope = scopeA; client = clientA;
  time = 13; day = monday;
}
```
It returns true if all checks between the brackets execute successfully. If at least one check fails the rule has no effect, the interpreter will stop and leave that rule. 

A deny rule works by the same principle but will return false if all checks execute successfully. E.g. to deny on Sundays you could write: 
```
denyRule : false {  
  day = sunday;
}
```
A boolean rule on the other hand does always return a value, **true** if all checks are successfully and **false** after the first check fails. To declare a boolean rule just don't write any type information after the name:
```
booleanRule { 
  scope = scopeA; client = clientA;
  time = 13; day = monday;
}
```
### rule calls
If you write a rule, it first does nothing, to see any effect it needs to be called. To call a rule write **$** followed by the name:
```
booleanRule { ... }
caller {
    $booleanRule;
}
```
Because *booleanRule* is of type boolean its result can be used like a normal filter. Imagine you want to convert this to a permit/deny decision, this could look like the following:
```
  booleanRule { 
    ... 
  }
  permitCaller : true { $booleanRule; }
  denyCaller : false { $booleanRule; }
```
But the other way around, if you write:
```
permitRule : true { 
  ... 
}
booleanCaller { $permitRule; }
```
the engine will throw an error.

It is not possible to use permit/deny rule calls directly as a filter. Those Calls could return nothing and in this case the check result would be unclear. In scenarios like this you could use a boolean variable.
### Boolean variable
The language supports boolean variables. A variable has to be initialized, either with a constant (**true/false**), the result of a filter or with a rule call:
```
  constant = false;
  filterResult = scope=scopeA;
  callResultl = $booleanRule;
```
Variables can't be initialized with permit/deny rule calls, instead you have to overwrite existing values:
```
  var = false;
  var = $permitRule;
  var = $denyRule;
```
This way you could introduce an *allow* variable with **false** as default and overwrite it if one rule matches the request:
```
  permitScopeA : true { ... }
  permitScopeB : true { ... }
  
  denyOnSaturday : false { day = saturday; }
  denyOnSunday : false { day = sunday; }
  
  grantToken {
    allow = false;
    
    allow = $permitScopeA;
    allow = $permitScopeB;
    
    allow = $denyOnSaturday;
    allow = $denyOnSunday;
    
    allow;
  }
```
Here *allow* will take the value of to the last matching rule call or if no rule matches keeps its default. The last line (**allow;**) behaves like a filter that applies the value of the variable.
### entry point
An entry point is a rule which will be called by the engine, it returns the actual decision to the system. The name needs to be granttoken (the case doesn't matter) and the type has to be boolean:
```
granttoken { ... }
```
Despite that granttoken behaves like a boolean rule but it shouldn't be called on your own. A user must have exactly one policy with a granttoken rule.

### logical operators
The language supports logical AND, OR and NOT operators. E.g. OR could be used to deny on weekend days like this:
```
  denyOnWeekendDays : false { 
    day = saturday | day = sunday;
  }
```
Or as alternative with the NOT operator:
```
  denyOnWeekendDays : false { 
    !day = monday; !day = tuesday; !day = wendsday; !day = thursday; !day = friday;
  }
```
This rule has five filter checks and they behave like an AND. You could also use a real AND and combine them as a chain:
```
  denyOnWeekendDays : false { 
    !day = monday & !day = tuesday & !day = wendsday & !day = thursday & !day = friday;
  }
```
I guess it depends on the scenario and taste which variant fits your needs.

Another scenario is a static separation of duty. Imagine you have one client which may request the scopes **file.approval** and **approve.proposal** but not both at the same time. For this you could write the follwing:
```
  fileOrApprove : true {
      client = myClient;
      scope = file.approval & !approve.proposal |
      !scope = file.approval & approve.proposal;
  }
```
But to bypass this, a malicious client could simply try to request the scopes successively instead of both at the same time. So that the engine can prevent this, it has to remember scopes that were already granted by previous requests. Subsequently the interpreter will handle those scopes as if they were requested at the same time.

It is configurable how long a previously granted scope should be remembered. Take a look at *app_settings.yml* from the docker directory for an example.
### Grouping with parentheses
Imagine you want to permit one scope for two clients, with parentheses it could look like this:
```
  denyOnWeekendDays : true { 
    scope = scopeA & (client = clientA | client = clientB);
  }
```
Because AND binds stronger than OR you need parentheses for this. Alternatively one would have to use two separate filters:
```
  denyOnWeekendDays : true { 
    scope = scopeA; 
    client = clientA | client = clientB;
  }
```
While this looks again like a matter of taste, parentheses will pay out as soon as the logic becomes more complex.

### Import of policies
A user can split its logic on different policies and import them as needed. Write the following to import *subPolicy* with *sp* as alias:
```
  import subPolicy as sp;
```
After that you can call any rule within subpolicy over the alias:
```
grantToken {
    $sp.ruleInSubPolicy;
}
```
### OAuth roles
An OAuth role works like flat RBAC, it assigns a group of clients to a group of scopes. The syntax looks like following:
```
  myRole : role {
      clients = clientA, clientB, clientC;
      scopes = scopeA, scopeB, scopeC;
  }
```
This looks similar to a rule and indeed if you call this
```
  grantToken { $myRole; }
```
it behaves like a boolean rule. This code permits *scopeA*, *scopeB* or *scopeC* to any of the clients and again if you want to convert this boolean to a permit/deny decision you could write:
```
  permitRule : true { $myRole }
  grantToken {
      allow = false;
      allow = $permitRule;
      allow;
  }
```
### File access
In the OAuth 2.0 rfc you will find the following example:

"...For example, an end-user (resource owner) can grant a printing service (client) access to her protected photos stored at a photo-sharing service (resource server)..."

The following code could grant a scope for this:
```
grantToken {
    client = printService; scope =  photos.read;
}
```
But how does the resource owner specify which files he wants to share? All files in a directory? All available files? OAuth leaves that open.

The policy language supports file access rules for this step, one such rule could look like this:
```
  sharedPhotos : file {
      scope = photos.read;
      files = fileA, fileB, fileC;
  }
```
This ensures that *photos.read* permits the acsces of *fileA*, *fileB* and *fileC*. 

To apply this rule, a caller has to prove that he is in possession of a token granted for *photos.read*. Thereafter one can ask if that scope permits a file or request a list of all permitted files. It is not possible to call a file rule, just write them and the engine will take care off the rest.
## Policy test suites
To ensure, that all policies work as expected a user can write test suites. A suite consists of JSON and the printService example from above could be tested like the following:
``` json
  { "name": "print service suite", "tests": [
    { "type": "DECISION", "name": "permit 'photos.read'", "expectedResult": true,
      "client": "printService", "scopes": ["photos.read"] },
    { "type": "DECISION", "name": "deny 'photos.read'", "expectedResult": false,
      "client": "someClient", "scopes": ["photos.read"] },
  ]}
```
This suite has two tests: The first (*permit 'photos.read'*) ensures that the client *printService* may request *photos.read* and the second test (*deny 'photos.read'*) ensures that a request with *someClient* will be denied.

*DECISION* means that a access token request will be tested, to test the file access use the type *VALIDATION*:
``` json
  { "name": "access files suite", "tests": [
    { "type": "VALIDATION", "name": "permit fileA and fileB", "expectedResult": true,
      "files": ["fileA", "fileB"], "scopes": ["photos.read"] },
    { "type": "VALIDATION", "name": "deny fileD", "expectedResult": false,
      "files": [ "fileD"], "scopes": ["photos.read"] },
  ]}
```
Again here you can see two tests: The first ensures that permitted files may be accessed and the second verifies that forbidden files will be denied.

When a user executes its suites, the engine will return a detailed statistic of all tests. To see this in action, play with the policy-dashboard from the docker image.
## Docker
For a preconfigured policy system go into the docker directory and run:
``` bash
  sudo docker-compose up -d
```
It pulls and runs four images:
* christianhugo/policy-engine
* christianhugo/policy-dashboard
* christianhugo/local-idp 
* mongo:latest

Open the dashboard via https://127.0.0.1/policy-dashboard/login. Any communication happens locally on your loopback (127.0.0.1). When you open https://127.0.0.1/policy-dashboard/login please accept the insecure connection, the certificate is self signed and just for demonstration purposes.

Do not use localhost, the node-oidc-provider refuses redirects with localhost, so it has to be 127.0.0.1 instead.

**NOTE**
This is not a final release but the result of a science project. The engine is well tested, and security was important during the development. Nonetheless a production ready release would probably need more security considerations, performance optimizations and additional features.
