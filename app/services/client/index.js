const ServiceSet = require("..");
const Client = require("../../models/client");
const moment = require("moment");
const { appointmentState, SuccessResult, FailedResult, side } = require("../../state");
const { sendEmail } = require("../../utils");
const { Appointment } = require("../../models/appointment");
const Payment = require("../../models/payement");
const PaymentService = require("../payment");
const SpecialOffer = require("../../models/specialoffer");
const { percentage } = require("../../utils/statistic");
const { AppointmentService } = require("../appointment.js");
const { DefaultAuth, states } = require("../../dynamic/authservice/index.js");
const { encrypt } = require("../../dynamic/authservice/encrypt/index.js");
const { AuthenService } = require("../authentification/index.js");
const { toObjectId } = require("../..");
// implement some features here such as take appointment
moment.locale("fr")
class ClientService extends ServiceSet {
    constructor() {
        super(Client)
    }

    async participateToSpecialOffer(specialofferid, appointment_) {
        const specialOffer = await SpecialOffer.findById(specialofferid);
        if (specialOffer) {
            const appointment = new Appointment(appointment_);

            // string to objectid
            appointment.transform();

            // populate the service
            await appointment.populate(
                {
                    path: 'programs.service',
                    model: 'Service',
                }
            )

            // apply the reduction
            for (let program of appointment.programs) {
                const { service } = program
                const red = specialOffer.getReduction(service._id);
                const price = service.price - (service.price * percentage(red));
                service.price = price
            }

            // make it as a reel appointment
            await appointment.buildAppointment();

            // eto le process no atao
            const res = await new AppointmentService().processSave(appointment);
            if (res.client) {
                res.client.specialOffers.push({
                    offer: specialOffer._id,
                    date: new Date()
                })
                res.client.save();
            }
            return appointment;

        }
    }

    async getOne(id) {
        try {
            const result = await Client.findById(id)
                .populate({
                    path: 'appointments._id',
                    model: 'Appointment',
                }).populate({
                    path: 'preferences.service.service_id',
                    model: 'Service',
                })
                .populate({
                    path: 'preferences.employee.employee_id',
                    model: 'Employee',
                })
            // console.log(result.favoriteService);
            return result;
        } catch (error) {
            console.error('Error getting one:', error.message);
            throw error;
        }
    }
    async create(serviceData) {
        const client = new Client(serviceData);
        client.encrypt()
        return await super.create(client);
    }

    async rappel() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const clients = await Client.find({
            'appointments': {
                $elemMatch: {
                    'date': { $lte: tomorrow.setHours(23, 0, 0, 0), $gt: tomorrow.setHours(0, 0, 0, 0) },
                    'state': { $ne: appointmentState.CANCELED }
                }
            }
        })

        for (let client of clients) {
            const person = client.lastName;
            for (let ap of client.appointments) {
                const d = moment(ap.date).format('LLL');
                if (d.isSame(moment(tomorrow), "days")) {
                    sendEmail(client.email, "Reminding", "Appoint is Tomorrow ", { person, appointment: d }, "./templates/client.ejs")
                }
            }
        }
    }

    // add an employee to his favorites
    async addToFavoriteEmployee(client, employee) {
        const cl = await Client.findById(client)
        cl.addToFavorite("employee", employee, cl.preferences.employee.length + 1)
        await cl.save()

    }

    // add a service to his favorite
    async addToFavoriteService(client, service) {
        const cl = await Client.findById(client)
        cl.addToFavorite("service", service, cl.preferences.service.length + 1)
        await cl.save()
    }

    async addEmpToFavorite(client, employeid) {
        try {

            const a = await Client.findByIdAndUpdate(client, { $push: { "preferences.employeeReview": toObjectId(employeid) } })
            console.log(a)
        } catch (error) {
            console.error(error) 
            throw error;
        }
    }

    async removeEmpToFavorite(client, employeid) {
        try {
            const updated = await Client.findByIdAndUpdate(client, { $pull: { "preferences.employeeReview": toObjectId(employeid) } }, { new: true });
            return updated;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async addServiceToFavorite(client, serviceid) {
        try {

            const a = await Client.findByIdAndUpdate(client, { $push: { "preferences.serviceReview": toObjectId(serviceid) } })
            console.log(a)
        } catch (error) {
            console.error(error) 
            throw error;
        }
    }

    async removeServiceToFavorite(client, serviceid) {
        try {
            const updated = await Client.findByIdAndUpdate(client, { $pull: { "preferences.serviceReview": toObjectId(serviceid) } }, { new: true });
            return updated;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    async pay(clientid, appointmentid) {

        try {
            const [client, appointment] = await Promise.all([
                Client.findById(clientid),
                Appointment.findById(appointmentid),
            ]);
            if (client && appointment) {
                console.log(appointment)
                const total = appointment.totalAmount();
                // simulate
                const result = await new PaymentService().pay(clientid._id, total, appointment._id);
                appointment.state = appointmentState.PAID;
                appointment.save();
                return new SuccessResult(result);
            }
            return new FailedResult({ message: "Payment could not be completed" });
        } catch (error) {
            return new FailedResult({ message: "Payment could not be completed" });
        }
    }
    async getSpecialOffer(specialoffer) {

    }
}

class AuthenClientService extends DefaultAuth {
    encrypt = encrypt.sha1;
    constructor() {
        super(Client, { id_field: "email", password_field: "password" })
    }

    async login(username, password, fields = undefined, action = (data) => { }) {
        var result = await super.login(username, password, fields, action);
        if (result.state === states.LOGGED_IN) {
            const service = new AuthenService();
            const token = await service.token(username, side.CLIENT)
            result.token = token
        }
        return result;
    }

    // get admin by token
    async getByToken(token) {
        const service = new AuthenService();
        const authen = await service.byToken(token, side.CLIENT);
        var result = null;
        if (authen) {
            const email = authen.email;
            result = await Client.findOne({ 'email': email });

        }
        return result;
    }

}
module.exports = {
    ClientService,
    AuthenClientService
}