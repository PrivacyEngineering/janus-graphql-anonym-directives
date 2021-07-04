import { addNoise } from "anonymizer";
import { SchemaDirectiveVisitor } from "graphql-tools";
const { defaultFieldResolver } = require('graphql');

export class NoiseDirective extends SchemaDirectiveVisitor{
    //add getDirectiveDeclaration (mentioned as best-practice here: https://www.apollographql.com/docs/apollo-server/schema/creating-directives/)

    static getDirectiveDeclaration(directiveName, schema){
        return null;
    }

    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        const noiseArgumentsOnRole = this.getArgumentForRoles();
        field.resolve = async function(result, args, context, info){
            const res = await resolve.apply(this,[result, args, context, info]);
            //in context -> req -> req.headers -> req.authorization || req.cookies.token 
            //evaluate role (https://github.com/grand-stack/graphql-auth-directives/blob/master/src/index.js)
            
            /*const token = verifyAndDecodeToken(context);
            const role = token.role;

            noiseArgument = noiseArgumentsOnRole[role];
            if(!noiseArgument) throw new Error("There is no noise argument specified for this role.")*/



            /*return addNoise(res, {
                typeOfDistribution:"uniformInt", 
                distributionParameters:{
                    max: 100,
                    min: 100,
                }, 
                valueParameters:{
                    isInt: false,
                }
            })*/

            return addNoise(res, {
                typeOfDistribution:"normal", 
                distributionParameters:{
                    mean: 0,
                    standardDeviation: 1,
                }, 
                valueParameters:{
                    isInt: false,
                }
            })
        }
    }
}

const verifyAndDecodeToken = function(context){
    
    if(!context || !context.req || !context.req.headers || !context.req.headers.Authorization) {
        throw new Error("No authorization token.");
    }
  
    const token = req.headers.authorization;

    try {
        //const id_token = token.replace("Bearer ", "");
        const { JWT_SECRET, JWT_NO_VERIFY } = process.env;
  
        if (!JWT_SECRET && JWT_NO_VERIFY) {
            return jwt.decode(id_token);
        } else {
            return jwt.verify(id_token, JWT_SECRET, {
                algorithms: ["HS256", "RS256"]
            });
        }
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new Error("Your token is expired.");
        } else {
            throw new Error("Could not verify and decode token.");
      }
    }
};
  

//add other directives