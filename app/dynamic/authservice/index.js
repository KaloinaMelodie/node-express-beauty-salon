const { encrypt } = require("./encrypt");

class AuthentificationService{
    encrypt = encrypt.noEncryption
    query = {}
    constructor(model,options={id_field:'', password_field:''}){
        this.model = model;
        this.options = options;
    }

    // Email fotsiny
    byIdentifier(identifier){
        const {id_field} = this.options
        this.query[id_field] = identifier 
        // this.query = this.model.findOne({ [id_field]: identifier });
        return this
    }
    // email sy mot de passe
    async authenficate(identifier,password){
        const {id_field,password_field} = this.options
        this.query={ [id_field]: identifier, [password_field]: this.encrypt(password)}
        return await this.exec()
    }
    async exec(fields=undefined){
        return await this.model.findOne(this.query,fields).exec();
    }
    comparePassword(original,totest){
        return original === this.encrypt(totest)
    }
    

}

const states={
    NOT_CONNECTED:"NOT_CONNECTED",
    USER_NOT_FOUND:"USER_NOT_FOUND",
    WRONG_PASSWORD:"WRONG_PASSWORD",
    LOGGED_IN:"LOGGED_IN",
}
class DefaultAuth extends AuthentificationService{
    constructor(model,options={id_field:'', password_field:''}){
        super(model,options)
    }
    async login(username, password,fields=undefined,action=(data)=>{}) {
        var retour = {state: states.NOT_CONNECTED, user: undefined}
        try {
            var result = await this.byIdentifier(username).exec(fields);
            if(!result){
                retour.state = states.USER_NOT_FOUND 
            }else{
                const isPaswordCorrect = this.comparePassword(result[this.options.password_field],password)
                if(!isPaswordCorrect){
                    retour.state = states.WRONG_PASSWORD;
                }else{
                    retour.state = states.LOGGED_IN;
                    retour.user = result;
                }
                action(retour)
            }
        } catch (error) {
            retour.state = states.ERROR;
        }
        return retour;
    }
}
module.exports = {
     AuthentificationService,
    DefaultAuth,
    states
} 