const ControllerSet = require("..");
const ServiceSet = require("../../services");
const { Mailing } = require("../../services/administrateur/mailing");
const { generateRandomNumberWithDigits } = require("../../utils");

class MailingController extends ControllerSet {
    routes = [
        { path: '/mail/init', method: 'post', handler: "initConfirmationDigit" },
        { path: '/mail/valid', method: 'post', handler: "isValid" },

    ]
    constructor() {
        super(ServiceSet)
    }
    mailService = new Mailing()

    async initConfirmationDigit(req, res) {
        try {
            const { email } = req.body;
            const date = this.mailService.expiration(10,'m')
            const code = generateRandomNumberWithDigits(6)
            const tosave = {
                email,
                token: code,
                date
            };
            await this.mailService.sendEmailConfirmation(email, tosave, code);
            res.status(200).json({ message: 'Check your email please' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async isValid(req, res) {
        const { token, email } = req.body;
        const document = await this.mailService.isValid(token, email);
        if (document) {
            // Check if the token is not expired
            res.status(200).json({ valid: true, message: 'Token is valid' });
        } else {
            res.status(400).json({ valid: false, message: 'Token and email combination not found or Has expired' });
        }

    }
}
module.exports = {
    MailingController
}