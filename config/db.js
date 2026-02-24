require('dotenv').config();
const mongoose = require('mongoose');

const connect = async (dbName)=> {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the application if there's an error connecting to the database
  }
};

exports.connectDefault = async ()=>{
  try{
    await connect(process.env.DEFAULT_DB)
  }catch(e){
    console.error('Error connecting to MongoDB:', error.message);
  }
}
exports.connectToDatabase = connect