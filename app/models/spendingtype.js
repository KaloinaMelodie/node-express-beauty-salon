const mongoose = require('mongoose');
const { Schema } = mongoose;

const spendingtypeSchema = new Schema({
    spendinglabel: { type: String },
    spendingvalue: {
        type: Number,
        default: 0
    },
    code: { type: String, maxLength: 4 }
}, { collection: 'spendingtype' });

const SpendingType = mongoose.model('SpendingType', spendingtypeSchema);
module.exports = SpendingType;
