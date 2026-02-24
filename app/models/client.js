// imports
const mongoose = require('mongoose');
const { encrypt } = require('../dynamic/authservice/encrypt');
const { appointmentState } = require('../state');
const { toObjectId } = require('..');
const Payment = require('./payement');

const { Schema } = mongoose

// some schema and statics and non statics methods for the client
const clientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    maxlength: 12,
    minlength: 6
  },
  appointments: [{
    id: { type: Schema.Types.ObjectId },
    date: {
      type: Date,
      required: true,
    },
    state: {
      type: String,
      default: appointmentState.CREATED
    }
  }],
  preferences: {
    service: [{
      service_id: {
        type: Schema.Types.ObjectId,
        ref: 'Service'
      },
      order: {
        type: Number,
        default: 1
      },
      added: { type: Date }
    }],
    employee: [{
      employee_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
      order: {
        type: Number,
        default: 1
      },
      added: { type: Date }

    }],
    employeeReview: [],
    serviceReview: []
  },
  reminders: {
    type: Boolean,
    default: false,
  },
  specialOffersNotifications: {
    type: Boolean,
    default: false,
  },
  specialOffers:[
    {
      offer:{
        type: Schema.Types.ObjectId,
        ref: 'SpecialOffer',
      },
      date:{
        type:Date,
        default: new Date(),
      }
    }
  ]
}, { timestamps: true, collection: 'client' });


clientSchema.methods = {
  // for the authentification
  encrypt: function () {
    this.password = encrypt.sha1(this.password)
  },

  // add service or employee to favorite
  addToFavorite: function (what, main, order) {
    this.preferences[`${what}`].push(
      {
        [`${what}_id`]: toObjectId(main),
        review: order,
        added: new Date()
      }
    )
  },
  //check if the client has not no appointment on these date
}
// Création du modèle Client à partir du schéma
const Client = mongoose.model('Client', clientSchema);
module.exports = Client;