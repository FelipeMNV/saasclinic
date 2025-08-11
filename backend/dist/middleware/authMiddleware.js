import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
export const authenticationToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication required. No token provided." });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        req.user = decoded;
        next();
    });
};
//# sourceMappingURL=authMiddleware.js.map