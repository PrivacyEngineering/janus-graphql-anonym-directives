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
        const argumentsForNoise = this.getArgumentForRole();
        field.resolve = async function(result, args, context, info){
            const res = await resolve.apply(this,[result, args, context, info]);
            //in context -> req -> req.headers -> req.authorization || req.cookies.token 
            //evaluate role (https://github.com/grand-stack/graphql-auth-directives/blob/master/src/index.js)
            console.log(argumentsForNoise);

            return addNoise(res, {
                typeOfDistribution:"uniformInt", 
                distributionParameters:{
                    max: 100,
                    min: 100,
                }, 
                valueParameters:{
                    isInt: true,
                }
            })
        }
    }
}

//add other directives