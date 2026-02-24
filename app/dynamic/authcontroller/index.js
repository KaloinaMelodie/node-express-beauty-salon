const only = require("only");
const { connectDefault } = require("../../../config/db");
const { DefaultAuth } = require("../authservice");

class AuthenController {
    constructor(service = DefaultAuth, field_get = undefined, field_set = undefined) {
        this.service = service;
        this.field_get = field_get;
        this.field_set = field_set;
    }
    async login(req, res) {
        try {
            // activate connection
            await connectDefault();
            // take the only needed value
            var data = only(req.body, this.field_get);
            var authen = new this.service();
            // log and send the result
            const result = await authen.login(...Object.values(data), this.field_set)
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

}
module.exports = {AuthenController}