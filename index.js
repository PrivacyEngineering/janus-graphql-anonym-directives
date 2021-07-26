import { AccessControlError, verifyAndDecodeToken } from "./utils"
import { addNoise, hash, generalize } from "value-anonymizer";
import { SchemaDirectiveVisitor } from "graphql-tools";
const { defaultFieldResolver, GraphQLDirective, DirectiveLocation } = require('graphql');

class AnonymizationSchemaDirectiveVisitor extends SchemaDirectiveVisitor{
    //https://www.apollographql.com/blog/graphql/directives/eusable-graphql-schema-directives/
    static getDirectiveDeclaration(directiveName) {
        return new GraphQLDirective({
          name: directiveName,
          locations: [
            DirectiveLocation.FIELD_DEFINITION,
          ],
        });
    }

    async getAnonymizedResult(resolve, anonymizationCallback, result, args, context, info){
        const res = await resolve.apply(this,[result, args, context, info]);
                
        const token = verifyAndDecodeToken(context);
        const role = token.role;
    
        var parameters = this.getAnonymizationParameter(role, result, args, context, info);
        if(!parameters) {
            throw new AccessControlError("No Parameters given.")
        }
        return anonymizationCallback(res, parameters);
    }
}

export class NoiseDirective extends AnonymizationSchemaDirectiveVisitor{
    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function(result, args, context, info){
            return this.getAnonymizedResult(resolve, addNoise, result, args, context, info);
        }.bind(this);
    }
}

export const noiseParameters = {
    standardNormal: {
        typeOfDistribution: "normal", 
        distributionParameters:{
            mean: 0,
            standardDeviation: 1,
        }, 
        valueParameters:{
            isInt: false,
        }
    },
    laplace: {
        typeOfDistribution: "normal", 
        distributionParameters:{
            mean: 0,
            standardDeviation: 1,
        }, 
        valueParameters:{
            isInt: false,
        }
    },  
}


export class HashDirective extends AnonymizationSchemaDirectiveVisitor{
    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function(result, args, context, info){
            return this.getAnonymizedResult(resolve, hash, result, args, context, info);
        }.bind(this);
    }
}

export const hashingParameters = {
    sha256: {
        hashingParameters: {
            outputLength: 256
        }
    },
    sha256Hex: {
        hashingParameters: {
            outputLength: 256
        },
        convertion: "Hex"
    }
}


export class GeneralizationDirective extends AnonymizationSchemaDirectiveVisitor{
    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function(result, args, context, info){
            return this.getAnonymizedResult(resolve, generalize, result, args, context, info);
        }.bind(this);
    }
}

export const generalizationParameters = {
    hideFromPosition3: {
        generalizationParameters: {
            hideCharactersFromPosition: 3,
            numberOfHideCharacters: 3
        }
    },
}