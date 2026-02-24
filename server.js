const schedule = require('node-schedule');
const cors=require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
require('dotenv').config()

const { connectDefault, connectToDatabase } = require('./config/db');
const { ClientService } = require('./app/services/client');
const { EmployeeService } = require('./app/services/employe');
const { SpecialOfferService } = require('./app/services/specialoffer');
connectDefault();

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/api', require('./config/routes'))

app.listen(process.env.PORT, () => {
    console.log('Connected to port ' + process.env.PORT)
})

// Function to be executed every morning at 6 am
const dailyTask = async () => {
    console.log("Called")
     new ClientService().rappel()
     new EmployeeService().rappel()
     new SpecialOfferService().rappelAll()
};
// new EmployeeService().rappel()

// Schedule the task to run every morning at midnight
const job = schedule.scheduleJob('0 0 * * *', dailyTask);
const job2 = schedule.scheduleJob('0 19 * * *', dailyTask);
