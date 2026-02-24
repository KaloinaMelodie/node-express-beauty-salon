const ServiceSet = require("..");
const Client = require("../../models/client");
const SpecialOffer = require("../../models/specialoffer");
const moment = require("moment");
const { sendEmail } = require("../../utils");
require('dotenv').config()
class SpecialOfferService extends ServiceSet {
    constructor() {
        super(SpecialOffer)
    }
    async create(serviceData) {
        const newoffer = await super.create(serviceData);
        if (newoffer) {
            await newoffer.populate('services.service', 'servicename description')
            this.rappel(newoffer, undefined, true);
        }
        return newoffer;
    }

    async rappelAll() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [offers,clients] = await Promise.all([
            SpecialOffer.find({
                "$or": [
                    {
                        'start': { $lte: tomorrow.setHours(23, 0, 0, 0), $gt: tomorrow.setHours(0, 0, 0, 0) },
                    }, {
    
                        'end': { $lte: tomorrow.setHours(23, 0, 0, 0), $gt: tomorrow.setHours(0, 0, 0, 0) },
                    }
                ]
            }).populate('services.service', 'servicename description'),
            Client.find({})
        ])
        for(let offer of offers) {
            this.rappel(offer,clients)
        }
    }
    async rappel(offer, clients = undefined, justSaved = false) {
        if (!clients) {
            clients = await Client.find({});
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const condition = justSaved || moment(offer.start).isSame(moment(tomorrow), "days")
        const last = moment(offer.end).isSame(moment(tomorrow), "days")
        for (let client of clients) {
            // const d = moment(ap.date).format('LLL');
            if (condition) {
                console.log(offer)
                console.log(offer.services[0].service)
                sendEmail(client.email, "Special Offer - Don't Miss Out!", "Special Offer - Don't Miss Out! ", { moment, specialOffer: offer, shopNow: `${process.env.FRONT_URL}/client/offre` }, "./templates/offer.ejs")
                continue;
            }
            if (last) {
                sendEmail(client.email, "Special Offer - Last Call!", "Special Offer - Last Call! ", { moment, specialOffer: offer, shopNow: `${process.env.FRONT_URL}/client/offre` }, "./templates/offer.ejs")

            }
        }

    }
}
module.exports = { SpecialOfferService };