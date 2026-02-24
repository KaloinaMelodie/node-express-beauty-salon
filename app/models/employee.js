// imports
const moment = require('moment');
const mongoose = require('mongoose');
const { encrypt } = require('../dynamic/authservice/encrypt');
const { appointmentState } = require('../state');
const { sum, percentageOf } = require('../utils/statistic');

const { Schema } = mongoose

const employeeSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  cin: {
    type: String,
    required: true
  },
  datebirth: {
    type: Date,
    required: true
  },
  address: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    default: encrypt.sha1('0000')
  },
  salary: { type: Number, default: 0 },
  hired_at: { type: Date, default: moment().format('YYYY-MM-DD') },
  schedule: [{
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    price: {
      type: Number,
      default: 0,
    },
    state: {
      type: String,
      default: appointmentState.CREATED,
    },
  }],
  // service hainy
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  workhour: [
    {
      dayofweek: { type: Number },
      // format as XX:XX:XX
      times: [[{ type: String }]]
    }
  ]
  // Autres champs si nécessaire
}, { timestamps: true, collection: "employee" });

employeeSchema.methods = {
  isQualified: function (service) {
    return this.tasks.some(s => s.equals(service._id));
  },
  isAvailable: async function (dates) {
    var result = true

    for (var date of dates) {
      const d = moment(date)
      var teste = false
      for (let dw of this.workhour) {
        if (dw.dayofweek === d.isoWeekday()) {
          for (let i = 0; i < dw.times.length; i++) {
            const [starthour, startminute, startsecond] = dw.times[i][0].split(':')
            const [endhour, endminute, endsecond] = dw.times[i][1].split(':')
            const start_time = moment(date).set({ hour: starthour, minute: startminute, second: startsecond })
            const end_time = moment(date).set({ hour: endhour, minute: endminute, second: endsecond })
            var f = "YYYY/MM/DD HH:mm"
            console.log(`date: ${d.format(f)}\nstart:${start_time.format(f)}\nend:${end_time.format(f)}`)
            if (d.isBetween(start_time, end_time,"(]")) {
              teste = true;
            }
          }
        }
      }
      result = result && teste
    }
    return result;
  },
  totalCommission:async function(date){
      if(!this.populated('schedule.service')){
        await this.populate({
          path:'schedule.service',
          model:'Service'
        })
      }
      const tothisdata= this.schedule.filter((program)=>{
       return  program.start.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)
      })
      let retour=sum(tothisdata,(e)=> {
        const mine=percentageOf(e.price,e.service.commission)||0
        return mine
      },(e)=> "total");
      return {
        commission: retour.total,
        today: tothisdata
      }
  },
  populateThis: async function (root, key) {
    this[root].map(async (program, index) => {
      await this.populate(`${root}.${index}.${key}`);
    })
  }
}

employeeSchema.statics = {
  getAvgWorkingHour: async function () {
    const result =await this.aggregate([
    
      {
        $unwind: '$schedule',
      },
      {
        $project: {
          employee: 1,
          workingHours: {
            $divide: [{ $subtract: ['$schedule.end', '$schedule.start'] }, 60 * 60 * 1000], // Convert milliseconds to hours
          },
        },
      },
      {
        $group: {
          _id: "$_id", // Single result for average
          totalHours: { $sum: '$workingHours' },
          numEmployees: { $count: {} }, // Number of employees in the timeframe
        },
      },
      {
        $project: {
          _id: 1,
          averageWorkingHours: {
            $divide: ['$totalHours', '$numEmployees'], // Average hours
          },
        },
      },
    ])
     await this.populate(result,{path:'_id',select:'firstName lastName',})
     return result
  }
    
}


const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
