const only = require("only");
const ControllerSet = require("..");
const { FailureResponse, SuccessResponse } = require("../..");
const { AppointmentService } = require("../../services/appointment.js");
const { ClientService, AuthenClientService } = require("../../services/client");
const { httpState } = require("../../state.js");
const { connectDefault } = require("../../../config/db.js");
const { AuthenController } = require("../../dynamic/authcontroller/index.js");
const { authentification } = require("../../middleware/authentification.js");

class ClientController extends ControllerSet {
    routes = [
        { path: '/new', method: 'post', handler: "save" },
        { path: '/authen', method: 'post', handler: "login" },
        { path: '/byToken/:token', method: 'get', handler: "byToken", middleware: [authentification]},
        { path: '/new/appointment', method: 'post', handler: "createAppointment", middleware: [authentification] },
        { path: '/new/appointment/offer', method: 'post', handler: "participateSpecialOffer", middleware: [authentification] },
        { path: '/:id', method: 'get', handler: "getOne", middleware: [authentification] },
        { path: '/review/:id', method: 'post', handler: "review", middleware: [authentification] },
        { path: '/pay', method: 'post', handler: "pay", middleware: [authentification] },
        { path: '/favorite/:id', method: 'post', handler: "favorite", middleware: [authentification] },
        { path: '/removefavorite/:id', method: 'post', handler: "removefavorite", middleware: [authentification] },

    ]
    constructor() {
        super(ClientService);
        this.appointmentService = new AppointmentService()
    }

    async login(req, res) {
        try {
            const controller = new AuthenController(AuthenClientService, 'email password')
            controller.login(req, res)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }
    async byToken(req, res){
        try {
            const service = new AuthenClientService();
            const data = await service.getByToken(req.params.token);
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async participateSpecialOffer(req, res) {
        try {
            const data = only(req.body, 'specialoffer appointment');
            await connectDefault();
            const result = await this.s.participateToSpecialOffer(data.specialoffer, data.appointment);
            res.status(200).send(new SuccessResponse(result));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message))
        }
    }

    async createAppointment(req, res) {
        try {

            const data = req.body;
            await connectDefault()
            const tosave = await this.appointmentService.create(data);
            res.status(200).send(tosave);
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message))
        }
    }

    async review(req, res) {
        try {
            const { id } = req.params
            await connectDefault()
            if (req.body.employee) {
                await this.s.addToFavoriteEmployee(id, req.body.employee);
            }
            if (req.body.service) {
                await this.s.addToFavoriteService(id, req.body.service);

            }
            res.status(200).send(new SuccessResponse({ message: "Review Done!" }));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message))
        }
    }

    async favorite(req, res) {
        try {
            const { id } = req.params
            await connectDefault()
            if (req.body.employee) {
                await this.s.addEmpToFavorite(id, req.body.employee);
            }
            if (req.body.service) {
                await this.s.addServiceToFavorite(id, req.body.service);

            }
            res.status(200).send(new SuccessResponse({ message: "Favorite Done!" }));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message))
        }
    }
    async removefavorite(req, res) {
        try {
            const { id } = req.params
            await connectDefault()
            if (req.body.employee) {
                await this.s.removeEmpToFavorite(id, req.body.employee);
            }
            if (req.body.service) {
                await this.s.removeServiceToFavorite(id, req.body.service);

            }
            res.status(200).send(new SuccessResponse({ message: "Remove Favorite Done!" }));
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message))
        }
    }

    async pay(req, res) {
        try {
            const data = only(req.body, 'client appointment')
            const payresult = await this.s.pay(data.client, data.appointment);
            res.status(200).send(payresult);
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message))
        }
    }
}

module.exports = {
    ClientController
}