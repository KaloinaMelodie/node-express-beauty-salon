// imports
const mongoose = require('mongoose');

const {Schema} = mongoose

// some schema and statics and non statics methods for the appointments

const authentificationSchema = new Schema({
    email: {type:String,required:true},
    token: {type:String,required:true},
    expired_at: {type:Date,required:true},
    side:{type:String,required:true}
},{collection:'authentification'});

const Authentification = mongoose.model('Authentication', authentificationSchema);
module.exports = Authentification

