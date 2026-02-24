// implement some features here such as accept apppointment

const ServiceSet = require("..");
const Employee = require("../../models/employee");
const { DefaultAuth, states } = require("../../dynamic/authservice");
const { encrypt } = require("../../dynamic/authservice/encrypt");
const { AuthenService } = require("../authentification");
const { toObjectId } = require("../..");
const { Appointment } = require("../../models/appointment");
const { appointmentState, side } = require("../../state");
const moment = require("moment");
const { sendEmail } = require("../../utils");
moment.locale("fr")
class EmployeeService extends ServiceSet {
    constructor() {
        super(Employee)
    }

    async myCommission(employee, date) {
        const emp = await Employee.findById(employee);
        await emp.populate('schedule.service')
        const to = await emp.totalCommission(date)
        return to;
    }

    async markAs(employee, schedule, state) {
        const sc = toObjectId(schedule);
        "a".toUpperCase
        const st=appointmentState[state.toUpperCase()]?appointmentState[state.toUpperCase()]:appointmentState.ONGOING;
        const result = await Employee.findOneAndUpdate({
            _id: toObjectId(employee),
            "schedule._id": toObjectId(schedule),
            "schedule.start": { $lte: moment().toDate() }
        }, {
            $set: {
                "schedule.$.state": st
            }
        })
        Appointment.markProgramAs(schedule,st)
        console.log(result);
        return result;
    }
    // add new ability
    async addTask(employeid, task) {
        try {

            const a = await Employee.findByIdAndUpdate(employeid, { $push: { tasks: toObjectId(task) } })
            console.log(a)
        } catch (error) {
            console.error(error) 
            throw error;
        }
    }

    // remove ability
    async removeTask(employeid, task) {
        try {
            const updatedEmployee = await Employee.findByIdAndUpdate(employeid, { $pull: { tasks: toObjectId(task) } }, { new: true });
            console.log(updatedEmployee);
            return updatedEmployee;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // daily routine
    async addWorkHour(employeid, workhour) {
        try {

            const a = await Employee.findByIdAndUpdate(employeid, { $push: { workhour: workhour } })
            console.log(a)
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    // populate tasks
    async getOne(id) {
        try {
            const result = await Employee.findById(id).populate('tasks')
            return result;
        } catch (error) {
            console.error('Error getting one:', error.message);
        }
    }

    async rappel() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const employees = await Employee.find({
            'schedule': {
                $elemMatch: {
                    'start': { $lte: tomorrow.setHours(23, 0, 0, 0), $gt: tomorrow.setHours(0, 0, 0, 0) },
                    'state': { $ne: appointmentState.CANCELED }
                }
            }
        }).populate(
            {
                path: 'schedule.service',
                model: 'Service',
            }
        )
        for (let emp of employees) {
            const person = emp.lastName;
            var temp = []
            for (let sc of emp.schedule) {
                const d = moment(sc.start);
                if (d.isSame(moment(tomorrow), "days") && sc.state !== appointmentState.CANCELED) {
                    temp.push({
                        start: moment(sc.start).format("LLL"),
                        end: moment(sc.end).format("LLL"),
                        service: sc.service.servicename
                    })
                }
            }
            sendEmail(emp.email, "Reminding", "Appoint is Tomorrow ", { person, appointment: moment(tomorrow).format('dddd, DD MMMM YYYY'), service: temp }, "./templates/employee.ejs")
        }
    }

    async getAvgWork() {
        const values = await Employee.getAvgWorkingHour();
        return values
    }
}

class AuthenEmpService extends DefaultAuth {
    encrypt = encrypt.sha1;
    constructor() {
        super(Employee, { id_field: "email", password_field: "password" })
    }
    async login(username, password, fields = undefined, action = (data) => { }) {
        var result = await super.login(username, password, fields, action);
        if (result.state === states.LOGGED_IN) {
            const service = new AuthenService();
            const token = await service.token(username, side.EMP)
            result.token = token
        }
        return result;
    }
    
    // get employe by token
    async getByToken(token){
        const service = new AuthenService();
        const authen = await service.byToken(token, side.EMP);
        var result = null;
        if(authen){
            const email = authen.email;
            result = await Employee.findOne({email});
            console.log(result);
            
        }
        return result;
    }

}

module.exports = { EmployeeService, AuthenEmpService };