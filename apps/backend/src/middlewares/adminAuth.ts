import { Request, Response, NextFunction } from 'express'
import jwt from "jsonwebtoken";

export interface AdminRequest extends Request {
    adminId?: string;
}


export const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
    // checking the client header 
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: "Unauthorized. Deny-by-default policy enforced." })

        return;
    }
    // "Bearer eyJhbGciOiJIUzI1NiIsInR..." 
    const token = authHeader.split(' ')[1]; //  token = eyJhbGciOiJIUzI1NiIsInR

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "fallback_access_secret") as { adminId: string };
        req.adminId = payload.adminId;
        next();
    }catch(error){
        res.status(401).json({error : "Invalid or expired access token."})
    }

}