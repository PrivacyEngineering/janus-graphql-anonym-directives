**Janus is part of a peer-reviewed publication. Please see the paper [here](https://link.springer.com/chapter/10.1007/978-3-031-09917-5_22) or a preprint on [arXiv](https://arxiv.org/pdf/2203.09903).**

```
@inproceedings{pallas2022configurable,
  title={Configurable Per-Query Data Minimization for Privacy-Compliant Web APIs},
  author={Frank Pallas and David Hartmann and Paul Heinrich and Josefine Kipke and Elias Grünewald},
  booktitle={Web Engineering: 22nd International Conference, ICWE 2022, Bari, Italy, July 5--8, 2022},
  volume={13362},
  pages={325},
  year={2022},
  organization={Springer Nature}
}
```
---

# graphql-anonym-directives
This package provides special ```SchemaDirectiveVisitor``` classes. Those can be added to schemas: https://www.apollographql.com/docs/apollo-server/schema/directives/ 

## Usage
### Installation
```sh
npm install graphql-anonym-directives
```
### Requirements
The anonymization directives use JWT tokens to extract to role of the current requester. Therefore, you must provide the JWT secret as environment variable.
``` 
JWT_SECRET=qwertyuiopasdfghjklzxcvbnm123456
```
It can be loaded with the ```dotenv``` package in you ```index.js```: 
```js
const dotenv = require("dotenv");
dotenv.config();
```
Also the context, that is passed as argument for each resolver call needs to store the token passed by the request. This can be done when creating the Apollo server (the argument ```req``` consists of the request information):
```js
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        return {req}
    } 
})
```

To use the anonymization directives, you need to import them and declare the ```getAnonymizationParameter``` function. This function must return the paramters, which then are passed by the directive to the anonymizer function (to learn more, look here for the anonymizer: ). As arguments, it gets the ```role``` and all 4 arguments (```result, args, context, info```), that are also passed to the resolvers.

Don't forget to add the directive as argument when creating the apollo server.

There is also a directive that suppresses data and replaces them with ```null``` if the requester does not have a certain role that can be definded. Therefore, declare the function ```getAllowedRoles``` which returns an array of roles that have the permission to access the corresponding data field. 

A whole implementation could look like this:

```js

import {NoiseDirective} from "graphql-access-control";
NoiseDirective.prototype.getAnonymizationParameter = function(role, result, args, context, info){
    const m = new Map();
    m.set(("Advertiser, Symptom.pain"), {
        typeOfDistribution: "normal", 
        distributionParameters:{
            mean: 0,
            standardDeviation: 2,
        }, 
        valueParameters:{
            isInt: true,
        }
    });    

    var lookup = role + ", " + info.parentType.name + "."+ info.fieldName
    return m.get(lookup);
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        return {req, models}
    },
    schemaDirectives: { 
        noise: NoiseDirective,
    }, 
});
```

The schema then could implement the noise directive: 

```
type Symptom{
    id: ID!
    pain: Float @noise
}
```
