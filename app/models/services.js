// imports
const mongoose = require('mongoose');
const Employee = require('./employee');

const {Schema} = mongoose

// some schema and statics and non statics methods for the services
const serviceSchema = new Schema({
    servicename:{type:String},
    price:{type:Number},
    commission:{type:Number},
    photo:{type:String,required:false},
    description:{type:String,required:false},
    // minutes
    duree:{type:Number},
},{collection:'service'})

serviceSchema.methods.qualified = async function (criteria={}) {
    const employee = await Employee.find({"$and":[
        { tasks: this._id},
        {...criteria }
    ]});
    return employee;
};

serviceSchema.methods.isQualified = async function (employeid) {
    const employee = await Employee.findById(employeid).where({ tasks: this._id});
    return employee!==null && employee!==undefined
}

const Service = mongoose.model('Service', serviceSchema);



module.exports = Service;