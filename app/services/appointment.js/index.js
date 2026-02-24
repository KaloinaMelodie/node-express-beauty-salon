const ServiceSet = require("..");
const { Appointment } = require("../../models/appointment");
const mongoose = require("mongoose");
require("../../state");
const Employee = require("../../models/employee");
const Client = require("../../models/client");
class AppointmentService extends ServiceSet {
    constructor() {
        super(Appointment)
    }
    async create(serviceData) {
        // initiate the appointment instance
        const appointment = new Appointment(serviceData)
        //  id to objectid
        appointment.transform()

        // calculte the amount of time spent in every program in the appointment
        await appointment.buildAppointment()

        //  save the appointment
        const result = await this.processSave(appointment);
        return result.appointment;
    }

    // asina fonction process saving
    async processSave(appointment) {

        // check if the appointment is conflicting with other appointment
        const conflict = await appointment.checkForConflicts()
        if (conflict !== null) {
            console.log(conflict);
            throw new Error(conflict.message)
        }
        const result = await super.create(appointment)

        // save every prorgam to employee
        for (const program of result.programs) {
            const employee = await Employee.findById(program.employee);
            if (employee) {
                employee.schedule.push(program)
                await employee.save();
            }
        }

        // save the appointment to the client
        const client = await Client.findById(appointment.client)
        if (client) {
            client.appointments.push(result)
            await client.save();
        }
        return {
            appointment: result,
            client
        }
    }

    async getReservation(year, month, day) {
        const y = year !== undefined
        const m = month !== undefined
        const d = day !== undefined
        const values = await Appointment.getNumberOfRservation(y, m, d)
        return values
    }

    


}
module.exports = { AppointmentService };