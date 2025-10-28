const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '1234' ;

function authenticate(req, res, next){
    const auth = req.headers.authorization;

    if(!auth ||  !auth.startsWith('Bearer'))
        return res.status(401).json({message: "No Autorizado"});

    const token = auth.split(" ")[1];
    try{
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch(error){
        return res.status(401).json({message: "No Autorizado"});
    }
}

module.exports = { authenticate };