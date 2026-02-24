const only = require("only");
const ControllerSet = require("..");
const { EmployeeService, AuthenEmpService } = require("../../services/employe");
const { connectDefault } = require("../../../config/db");
const { encrypt } = require("../../dynamic/authservice/encrypt");
const { AuthenController } = require("../../dynamic/authcontroller");
const Service = require("../../models/services");
const Service_service = require("../../services/administrateur/serviceService");
const { SuccessResponse, FailureResponse } = require("../..");
const { authentification } = require("../../middleware/authentification");

class EmployeController extends ControllerSet {
    constructor() {
        super(EmployeeService)
    }
    saveSelect = 'firstName lastName cin datebirth address email password salary hired_at schedule tasks workhour'

    routes = [
        { path: '/', method: 'post', handler: "getAll",middleware: [authentification]},
        { path: '/free', method: 'post', handler: "getAll"},
        { path: '/byToken/:token', method: 'get', handler: "byToken", middleware:[authentification]},
        { path: '/:id', method: 'put', handler: "update", middleware: [authentification]},
        { path: '/addtask/:id', method: 'put', handler: "addTask",middleware: [authentification]},
        { path: '/removetask/:id', method: 'post', handler: "removeTask",middleware: [authentification]},
        { path: '/addworkhour/:id', method: 'put', handler: "addWorkHour",middleware: [authentification]},
        { path: '/:id', method: 'get', handler: "getOne",middleware: [authentification]},
        { path: '/task/:state', method: 'post', handler: "markProgramAs",middleware: [authentification]},
        { path: '/mycommission', method: 'post', handler: "myCommission",middleware: [authentification]},
        { path: '/updatePassword/:id', method: 'put', handler: "changePassword" },
        { path: '/delete/:id', method: 'delete', handler: "delete",middleware: [authentification]},
        { path: '/authen', method: 'post', handler: "login"},
        { path: '/available', method: 'post', handler: "getEmployeeFromService",middleware: [authentification]}
    ]
    async login(req, res) {
        try {
            const controller = new AuthenController(AuthenEmpService, 'email password')
            controller.login(req, res)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }
    async byToken(req, res){
        try {
            const empService = new AuthenEmpService();
            const data = await empService.getByToken(req.params.token);
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send(error.message)
        }
    }



    async getEmployeeFromService(req, res) {

        try {
            const data = only(req.body, 'service date');
            await connectDefault()
            console.log(data)
            const ad = await new Service_service().getAvailableFor(data.service, new Date(data.date));
            res.status(200).send(new SuccessResponse(ad))
        } catch (error) {
            console.error(error)
            res.status(500).send(new FailureResponse(error.message))
        }

    }
    async changePassword(req, res) {
        try {
            await connectDefault();
            let data = only(req.body, this.saveSelect)
            data["password"] = encrypt.sha1(data["password"])
            const result = await this.s.update(req.params.id, data)
            res.status(201).send(result)
        } catch (error) {
            res.status(500).send(new FailureResponse('Could not update password, Reason: ' + error.message));
        }
    }

    async addTask(req, res) {
        const { id } = req.params
        try {
            const data = only(req.body, 'task')
            await this.s.addTask(id, data.task)
            res.status(200).send(new SuccessResponse({ message: 'Task added successfully' }))
        } catch (error) {
            res.status(500).send(new FailureResponse('Could not add task:' + error.message));
        }
    }

    async removeTask(req, res) {
        const { id } = req.params
        try {
            const data = only(req.body, 'task')
            await this.s.removeTask(id, data.task)
            res.status(200).send(new SuccessResponse({ message: 'Task remove successfully' }))
        } catch (error) {
            res.status(500).send(new FailureResponse('Could not remove task:' + error.message));
        }
    }

    async addWorkHour(req, res) {
        const { id } = req.params
        try {
            const data = only(req.body, 'task')
            await this.s.addWorkHour(id, data.task)
            res.status(200).send(new SuccessResponse({ message: 'work hour added successfully' }))
        } catch (error) {
            res.status(500).send(new FailureResponse('Could not add work:' + error.message));
        }
    }

    // mark an appointment as done
    async markProgramAs(req, res) {
        try {

            const data = only(req.body, 'employee program')
            const result = await this.s.markAs(data.employee, data.program,req.params.state);
            res.status(200).send(new SuccessResponse(result))
        } catch (error) {
            res.status(500).send(new FailureResponse('Could not validate the program:' + error.message));

        }
    }

    // my commission on this date
    async myCommission(req, res) {
        try {
            const data = only(req.body, 'employee date');
            const result = await this.s.myCommission(data.employee, new Date(data.date));
            res.status(200).send(new SuccessResponse(result))
        } catch (error) {
            res.status(500).send(new FailureResponse(error.message));
        }
    }

}
module.exports = {
    EmployeController
}