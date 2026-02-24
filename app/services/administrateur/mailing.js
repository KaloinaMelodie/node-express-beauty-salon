const only = require('only');
const { connectDefault } = require('../../../config/db');
const MailConfirmation = require('../../models/mailConfirmation');
const { sendEmail } = require('../../utils');
const moment = require('moment');
class Mailing {
    constructor() {
    }
    expiration(n,u){
        return moment().add(n,u).format('YYYY-MM-DD HH:mm:ss')
    }
    
    async sendEmailConfirmation(email,data, code,url) {
        await connectDefault()
        // const collection = db.collection("confirmationemail");
        // await collection.insertOne(tosave);
        const m = new MailConfirmation(data)
        await m.save();
        console.log('Data saved to the database');
        sendEmail(email, 'Confirmation Email', `Your confirmation token is: ${code}`, {
            code: code,
            url: url
        })
    }
    async isValid(code,email) {
        await connectDefault()
        const document = await MailConfirmation.findOne({ email: email, token: (Number.isInteger(code)) ? parseInt(code) : code });
        if (document) {
            const currentDate = new Date();
            const expirationDate = new Date(document.date);
            return expirationDate > currentDate
        } else {
            return false
        }
    }
}

module.exports = {
    Mailing
}