const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    // check request headers authorized or not 
    const authorization = req.headers.authorization
    if (!authorization) return res.status(401).json({ error: 'Token not found' });

    // extract jwt token from the request headers 
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    try {
        // verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user information to the request object 
        req.user = decoded
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid Token' });
    }
}
// function to generate token
const generateToken = (userData) => {
    // create new jwt token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 3000 });
}

module.exports = { jwtAuthMiddleware, generateToken };