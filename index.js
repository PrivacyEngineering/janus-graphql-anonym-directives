import { addNoise, generalize } from "anonymizer";
import { SchemaDirectiveVisitor } from "graphql-tools";
const { defaultFieldResolver } = require('graphql');
import * as jwt from "jsonwebtoken";

export class NoiseDirective extends SchemaDirectiveVisitor{
    //add getDirectiveDeclaration (mentioned as best-practice here: https://www.apollographql.com/docs/apollo-server/schema/creating-directives/)

    static getDirectiveDeclaration(directiveName, schema){
        return null;
    }

    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function(result, args, context, info){
            const res = await resolve.apply(this,[result, args, context, info]);
            
            const token = verifyAndDecodeToken(context);
            const role = token.role;

            var noiseArgument = this.getAnonymizationParameter(role, result, args, context, info);
            if(!noiseArgument) {
                return res;
            }

            return addNoise(res, noiseArgument)
        }.bind(this);
    }
}

export class GeneralizationDirective extends SchemaDirectiveVisitor{
    //add getDirectiveDeclaration (mentioned as best-practice here: https://www.apollographql.com/docs/apollo-server/schema/creating-directives/)

    static getDirectiveDeclaration(directiveName, schema){
        return null;
    }

    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function(result, args, context, info){
            const res = await resolve.apply(this,[result, args, context, info]);
            
            const token = verifyAndDecodeToken(context);
            const role = token.role;

            var generalizationArgument = this.getAnonymizationParameter(role, result, args, context, info);
            if(!generalizationArgument) {
                return res;
            }

            return generalize(res, generalizationArgument)
        }.bind(this);
    }
}

export class HashDirective extends SchemaDirectiveVisitor{
    //add getDirectiveDeclaration (mentioned as best-practice here: https://www.apollographql.com/docs/apollo-server/schema/creating-directives/)

    static getDirectiveDeclaration(directiveName, schema){
        return null;
    }

    visitFieldDefinition(field){
        const {resolve = defaultFieldResolver} = field;
        field.resolve = async function(result, args, context, info){
            const res = await resolve.apply(this,[result, args, context, info]);
            
            const token = verifyAndDecodeToken(context);
            const role = token.role;

            var hashingArgument = this.getHashingParameter(role, result, args, context, info);
            if(!hashingArgument) {
                return res;
            }

            return hash(res, hashingArgument)
        }.bind(this);
    }
}

const verifyAndDecodeToken = function(context){
    
    if(!context || !context.req || !context.req.headers || !context.req.headers.authorization) {
        throw new AccessControlError("No authorization token.");
    }
  
    const token = context.req.headers.authorization;

    try {
        const id_token = token.replace("Bearer ", "");
        const { JWT_SECRET, JWT_NO_VERIFY } = process.env;
  
        if (JWT_NO_VERIFY) {
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

class AccessControlError extends Error{
    constructor(message) {
        super(message);
        this.name = "AccessControlError"
    }
}