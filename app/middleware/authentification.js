const { connectDefault } = require("../../config/db");
const { AuthenService } = require("../services/authentification");

const authentification = async (req, res, next) => {
    require("dotenv").config()
    // get the header
    const tokenHeader = req.headers.authorization;
    const httpSideHeader = req.headers.http_side;

    if (!tokenHeader || !tokenHeader.startsWith('Bearer ') || !httpSideHeader) {
        return res.status(401).send({message:'No Bearer authorization token provided'});
    }
    // get the token
    const token = tokenHeader.substring('Bearer '.length);

    // initiate a connection
    await connectDefault();
    const service = new AuthenService();
    const result = await service.isExpired(token,httpSideHeader);
    // check if expired
    if (!result) {
        next()
    }else{
        return res.status(401).send({message:'Unauthorized'});
    }
}
module.exports = {authentification};