import * as jwt from "jsonwebtoken";

export const verifyAndDecodeToken = function(context){
    
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

export class AccessControlError extends Error{
    constructor(message) {
        super(message);
        this.name = "AccessControlError"
    }
}