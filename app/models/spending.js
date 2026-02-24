const mongoose = require('mongoose');
const { Schema } = mongoose;

const spendingSchema = new Schema({
    sptype: {
        type: Schema.Types.ObjectId,
        ref: 'SpendingType',
        required: true,
    },
    amount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: new Date(),
        required: true,
    }
}, { collection: 'spending' })



spendingSchema.statics = {
    getSpendingBy: async function (year=false, month=false, day=false) {
        var defaultCondition = { _id: {}, totalSpending: { $sum: "$amount" } }
        var defaultProject = { _id: 0, totalSpending: 1 }
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

const Spending = mongoose.model('Spending', spendingSchema);

module.exports = Spending;