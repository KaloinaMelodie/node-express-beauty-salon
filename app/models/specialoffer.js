// 
const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose

const specialOfferSchema = new Schema({
    offername: { type: String, required: true },
    reduction: { type: Number, default: 0 }, // reduction on all service pourcentage
    services: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        },
        reduction: {
            type: Number,
            default: 0 //pourcentage
        }
    }],
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
}, { collection: 'specialoffer' })

specialOfferSchema.methods={
    isAvailable: async function(dates){
        var result= true;
        for(var date of dates){
            const dateTomoment = moment(date);
            const startTomoment = moment(this.start);
            const endTomoment = moment(this.end);
            var teste=!dateTomoment.isBetween(startTomoment, endTomoment)
            result = result && teste
        }
        return result;
    },
    getReduction: function(service){
         const service_ = this.services.filter(s=>{
            return s.service.toString() === service.toString() 
         });
         if(service_.length>0){
            return service_[0].reduction;
         }
         return 0;
    }
}
const SpecialOffer = mongoose.model('SpecialOffer', specialOfferSchema)
module.exports = SpecialOffer