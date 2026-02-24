const only = require('only');
const { connectDefault } = require('../../../config/db');
const Service_service = require('../../services/administrateur/serviceService');
const ControllerSet = require('..');
const { EmployeeService } = require('../../services/employe');
const { Mailing } = require('../../services/administrateur/mailing');
const { generateRandomNumberWithDigits } = require('../../utils');
const { FailureResponse, SuccessResponse } = require('../..');
const { SpecialOfferService } = require('../../services/specialoffer');
const { AuthenController } = require('../../dynamic/authcontroller');
const { AuthenAdminService } = require('../../services/administrateur');
const PaymentService = require('../../services/payment');
const { authentification } = require('../../middleware/authentification');
const { AppointmentService } = require('../../services/appointment.js');
const { Monthly, Stat } = require('../../services/statistics');
require('dotenv').config()
class AdministrateurController extends ControllerSet {
    routes = [
        { path: '/new/service', method: 'post', handler: "save", middleware: [authentification] },
        { path: '/', method: 'post', handler: "login" },
        { path: '/byToken/:token', method: 'get', handler: "byToken", middleware: [authentification] },
        { path: '/new/employee', method: 'post', handler: "addNewEmployee", middleware: [authentification] },
        { path: '/new/offer', method: 'post', handler: "addSpecialOffer", middleware: [authentification] },
        { path: '/offer', method: 'get', handler: "getSpecialOffers", middleware: [authentification] },
        { path: '/service', method: 'get', handler: "getAll", middleware: [authentification] },
        { path: '/servicefree', method: 'get', handler: "getAll" },
        { path: '/reservation', method: 'get', handler: "getTotalReservation", middleware: [authentification] },
        { path: '/earning', method: 'get', handler: "getEarning", middleware: [authentification] },
        { path: '/benefit', method: 'get', handler: "getBenefit", middleware: [authentification] },
        { path: '/employee/avgwork', method: 'get', handler: "getAvgWork", middleware: [authentification] },
        { path: '/update/service/:id', method: 'patch', handler: "update", middleware: [authentification] },
        { path: '/delete/service/:id', method: 'delete', handler: "delete", middleware: [authentification] }
    ]

    // the value to take from the body
    saveSelect = 'servicename price commission duree description photo'

    constructor() {
        super(Service_service)
        this.empService = new EmployeeService()
        this.s_offer = new SpecialOfferService()
    }
    mailService = new Mailing()

    async login(req, res) {
        try {
            const controller = new AuthenController(AuthenAdminService, 'username password')
            controller.login(req, res)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }
    async byToken(req, res) {
        try {
            const service = new AuthenAdminService();
            const data = await service.getByToken(req.params.token);
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async getTotalReservation(req, res) {
        try {
            const result = await new AppointmentService().getReservation(req.query.year, req.query.month, req.query.day)
            res.status(200).send(new SuccessResponse(result));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message));
        }
    }


    // temp moyen travail
    async getAvgWork(req, res) {
        try {
            const result = await new EmployeeService().getAvgWork();
            res.status(200).send(new SuccessResponse(result));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message));
        }
    }

    // chiffre d'affaire
    async getEarning(req, res) {
        try {
            const result = await new PaymentService().getEarning(req.query.year, req.query.month, req.query.day)
            res.status(200).send(new SuccessResponse(result));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message));
        }
    }

    // benefice
    async getBenefit(req, res) {
        try {
            const result = await new Stat().getBenefit()
            res.status(200).send(new SuccessResponse(result));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message));
        }
    }


    async addNewEmployee(req, res) {
        try {
            await connectDefault();
            let data = only(req.body, 'firstName lastName cin datebirth address email password salary hired_at schedule tasks')
            try {
                const result = await this.empService.create(data);

                const date = this.mailService.expiration(10, 'm')
                const code = generateRandomNumberWithDigits(6)
                const tosave = {
                    email: data.email,
                    token: code,
                    date
                };
                await this.mailService.sendEmailConfirmation(data.email, tosave, code,{href:`${process.env.FRONT_URL}/employe/code-pswrd/${result._id}`,label:'Change Password Here'});
                res.status(201).send(result);
            } catch (e) {
                console.error(e)
                res.status(401).send(e);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error:', error.message));
        }
    }

    async addSpecialOffer(req, res) {
        try {
            await connectDefault();
            var data = only(req.body, 'offername reduction services start end')
            const result = await this.s_offer.create(data);
            res.status(201).send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error:', error.message));
        }
    }

    async getSpecialOffers(req, res) {
        try {
            await connectDefault();
            const result = await this.s_offer.getAll();
            res.status(201).send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error:', error.message));
        }
    }

}
module.exports = {
    AdministrateurController
}
