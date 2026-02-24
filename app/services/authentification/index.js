const ServiceSet = require("..");
const Authentification = require("../../models/authentification");
const moment = require("moment");
const { generatetoken } = require("../../utils");
class AuthenService extends ServiceSet{
    constructor(){
        super(Authentification)
    }

    async token(email,side){
        const token =generatetoken();
        var data={
            email,
            token,
            side,
            expired_at: this.expired()
        }
        await this.create(data);
        return token;
    }
    async isExpired(token,side){
        const data= await this.Model.findOne({token,side});
        if(data){
            const currentDate=new Date();
            const expired = new Date(data.expired_at);
            return currentDate >= expired;
        }
        return true;
    }
    expired(){
        return moment().add(1,'hour').format('YYYY/MM/DD HH:mm:ss');
    }
    
    // Get user by token
    async byToken(token, side) {
        const data= await this.Model.findOne({token,side});
        return await data;
    }
}

module.exports = {AuthenService};