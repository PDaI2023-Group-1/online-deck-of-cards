import jwt from 'jsonwebtoken';

const verify = (token: string): Promise<Token> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY!, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            }

            const decodedToken = decoded as Token;

            resolve(decodedToken);
        });
    });
};

export { verify };
