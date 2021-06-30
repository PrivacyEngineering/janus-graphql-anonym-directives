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
        field.resolve = async function(...args){
            const res = await resolve.apply(this,args);
            return addNoise(res, {
                typeOfDistribution:"", 
                distributionParameters:{

                }, 
                valueParameters:{

                }
            })
        }
    }
}

//add other directives