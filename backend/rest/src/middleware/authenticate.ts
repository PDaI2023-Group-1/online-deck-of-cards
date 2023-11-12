import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    if (
        process.env.SECRET_KEY === undefined ||
        process.env.SECRET_KEY === null
    ) {
        return res.status(500).send();
    }

    const authorizationHeader = req.headers['authorization'];

    if (authorizationHeader === undefined || authorizationHeader === null) {
        return res.status(401).json({ error: 'Authorization header not set' });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        return res
            .status(401)
            .json({ error: 'Token not present in authorization header' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decodedToken as Request['user'];
        next();
    });
};

const signToken = (user: Request['user']): string | null => {
    if (
        process.env.SECRET_KEY === undefined ||
        process.env.SECRET_KEY === null
    ) {
        return null;
    }

    if (!user) return null;

    const token = jwt.sign(user, process.env.SECRET_KEY as string, {
        expiresIn: '24h',
    });

    return token;
};

export { verifyToken, signToken };
