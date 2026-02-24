// imports
const mongoose = require('mongoose');
const { appointmentState } = require('../state');
const moment = require('moment');
const Employee = require('./employee');
const { toObjectId } = require('..');
const { sum, percentageOf } = require('../utils/statistic');
const SpendingType = require('./spendingtype');
const Spending = require('./spending');
const { Schema } = mongoose

const appointmentItemSchema = new mongoose.Schema({
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
  commission: {
    type: Number
  },
  state: {
    type: String,
    default: appointmentState.CREATED,
  },
});

// some schema and statics and non statics methods for the appointments
const appointmentSchema = new mongoose.Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  programs: [appointmentItemSchema],
  date: {
    type: Date,
    required: true,
  },
  state: {
    type: String,
    default: appointmentState.CREATED
  }
  // Autres champs si nécessaire
}, { timestamps: true, collection: "appointment" });

appointmentSchema.methods.transform = function () {
  this.client = new mongoose.Types.ObjectId(this.client)
  for (let i = 0; i < this.programs.length; i++) {
    this.programs[i].employee = new mongoose.Types.ObjectId(this.programs[i].employee)
    this.programs[i].service = new mongoose.Types.ObjectId(this.programs[i].service)
  }
}
appointmentSchema.methods.buildAppointment = async function () {
  var start = moment(this.date)

  // await this.populateThis('service');
  if (!this.populated('programs.service')) {
    await this.populate(
      {
        path: 'programs.service',
        model: 'Service',
      }
    )
  }

  for (let i = 0; i < this.programs.length; i++) {
    const { service } = this.programs[i]
    var st = start.clone();
    var en = start.add(service.duree, 'minutes')
    // set the start time
    this.programs[i].start = st.toDate();
    this.programs[i].end = en.toDate();
    this.programs[i].price = service.price;
    this.programs[i].commission = service.commission;
  }
}

appointmentSchema.methods.populateThis = async function (key) {
  const populateServicePromises = this.programs.map(async (program, index) => {
    await this.populate(`programs.${index}.${key}`);
  });

  // Wait for all promises to resolve
  await Promise.all(populateServicePromises);

}

appointmentSchema.methods.checkForConflicts = async function () {
  const appointment = this;

  for (const program of appointment.programs) {
    // Check if there's any appointment with conflicting time
    const nextDay = new Date(appointment.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const conflictAppointment = await appointment.constructor.findOne({
      'programs.start': { $lt: program.end },
      'programs.end': { $gt: program.start },
      'date': { $gte: new Date(appointment.date).setHours(0, 0, 0, 0), $lt: nextDay },
      'state': { $ne: appointmentState.CANCELED }, // Exclude canceled appointments
    });

    if (conflictAppointment) {
      console.log("conflictAppointment:", conflictAppointment)
      // If there's a conflict, return the conflicting appointment
      return { status: appointmentState.CONFLICTING, data: conflictAppointment, message: "Conflicting with another appointment." };
    }

    // check if the employee is available when there is no conflict
    const emp = await Employee.findById(program.employee);
    if (emp && emp.workhour !== undefined) {
      const available = await emp.isAvailable([program.start, program.end]);
      if (!available) {
        return { status: appointmentState.EMPLOYEE_UNAVAILABLE, data: emp, message: `${emp.lastName} ${emp.firstName} is not available at that time.` }
      }
      const qualified = emp.isQualified(program.service);
      if (!qualified) {
        return { status: appointmentState.EMPLOYEE_NOT_QUALIFIED, data: emp, message: `${emp.lastName} ${emp.firstName} is not qualified for that.` }
      }
    }
  }

  // If no conflicts were found, return null
  return null;
};

appointmentSchema.methods.totalAmount = function () {
  const total = sum(this.programs, (e) => e.price, e => "total")
  return total.total.sum
}

appointmentSchema.statics = {
  markProgramAs: async function (program,state) {
    const appointment = await this.findOneAndUpdate({
      "programs._id": toObjectId(program),
      "programs.state": { $ne: appointmentState.DONE }
    },
      {
        $set: {
          "programs.$.state": state
        }
      }
    )
    if (appointment) {

      // put the commission of the service as spending
      const doneProgram = appointment.programs.find(p => p._id.toString() === program)
      if (doneProgram && state === appointmentState.DONE) {
        const depense = percentageOf(doneProgram.commission, doneProgram.price)
        const dpe = await SpendingType.findOne({ code: "EPC" });
        const spending = new Spending({ sptype: dpe._id, amount: depense });
        spending.save();
      }

      // if all programs are done, then the appointment is done
      const alldone = appointment.programs.every(p => p.state === appointmentState.DONE);
      if (alldone) {
        appointment.state = appointmentState.DONE;
        appointment.save();
      }

    }
  },
  getNumberOfRservation: async function (year = false, month = false, day = false) {
    var defaultCondition = { _id: {}, totalReservation: { $sum: 1 } }
    var defaultProject = { _id: 0, totalReservation: 1 }
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


appointmentSchema.set('toObject', { virtuals: true });
const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = { Appointment, appointmentItemSchema };
