// some schema and statics and non statics methods for the administrator

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Other admin-related fields if needed
}, { timestamps: true,collection: 'administrator' });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
