const { states, DefaultAuth } = require("../../dynamic/authservice");
const { encrypt } = require("../../dynamic/authservice/encrypt");
const Admin = require("../../models/administrator");
const { side } = require("../../state");
const { AuthenService } = require("../authentification");

// implement some features here such as authentication
class AuthenAdminService extends DefaultAuth {
    encrypt = encrypt.sha1;
    constructor() {
        super(Admin, { id_field: "username", password_field: "password" })
    }
    async login(username, password, fields = undefined, action = (data) => { }) {
        var result = await super.login(username, password, fields, action);
        if (result.state === states.LOGGED_IN) {
            const service = new AuthenService();
            const token = await service.token(username,side.ADMIN)
            result.token = token
        }
        return result;
    }
    // get admin by token
    async getByToken(token){
        const service = new AuthenService();
        const authen = await service.byToken(token, side.ADMIN);
        var result = null;
        if(authen){
            const email = authen.email;
            result = await Admin.findOne({'username':email});
            
        }
        return result;
    }

}

module.exports ={
    AuthenAdminService
}