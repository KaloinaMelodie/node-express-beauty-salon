const mongoose = require('mongoose');

const { Schema } = mongoose

const mailConfirmationSchema = new Schema({
    email: {type:String,required:true},
    token: {type:String,required:true},
    date:{type:String}
},{collection:'mailconfirmations'})

const MailConfirmation = mongoose.model('MailConfirmation', mailConfirmationSchema);

module.exports = MailConfirmation;
