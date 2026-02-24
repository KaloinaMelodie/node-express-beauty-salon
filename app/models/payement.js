const mongoose = require('mongoose')
const { generatetoken } = require('../utils')

const { Schema } = mongoose

const payementSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    amount: {
        type: Number,
        validate:{
            validator: function(amount) {
                return amount>=0;
            },
            message:'Amount must be positive'
        }
    },
    reference: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    date: {
        type: Date,
        default: new Date()
    },
    transaction: {
        type: String,
        default: generatetoken()
    }
}, { collection: 'payment' })

payementSchema.statics = {
    getEarningBy: async function (year=false, month=false, day=false) {
        var defaultCondition = { _id: {}, totalEarning: { $sum: "$amount" } }
        var defaultProject = { _id: 0, totalEarning: 1 }
        var defaultSort = {}
        if (day) {
            defaultCondition._id.day = { $dayOfMonth: "$date" }
            defaultProject.day = "$_id.day"
            defaultSort.day = 1
        }
        if (month) {
            defaultCondition._id.month = { $month: "$date" }
            defaultProject.month = "$_id.month"
            defaultSort.month = 1
        }
        if (year) {
            defaultCondition._id.year = { $year: "$date" }
            defaultProject.year = "$_id.year"
            defaultSort.year = 1
        }
        var result = await this.aggregate([
            {
                $group: defaultCondition
            },
            {
                $project: defaultProject
            },
            {
                $sort: defaultSort
            }
        ])
        return result

    }
}

const Payment = mongoose.model('Payment', payementSchema)
module.exports = Payment