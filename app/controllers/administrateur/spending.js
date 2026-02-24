const ControllerSet = require("..");
const { authentification } = require("../../middleware/authentification");
const { SpendingTypeService, SpendingService } = require("../../services/administrateur/spendingService");
const { connectDefault } = require('../../../config/db');
const { FailureResponse, SuccessResponse } = require('../..');

class SpendingTypeController extends ControllerSet{
    saveSelect = 'spendinglabel spendingvalue code'
    routes = [
        { path: '/', method: 'post', handler: "save", middleware: [authentification]},
        { path: '/', method: 'get', handler: "getAll" , middleware: [authentification]},
        { path: '/:id', method: 'delete', handler: "deleteSpendingtype",middleware: [authentification]},
    ]
    constructor(){
        super(SpendingTypeService)
    }
    // delete with check 
    async deleteSpendingtype(req, res) {
        try {
            await connectDefault();
            const result = await this.s.deletespendingtype(req.params.id);
            res.status(200).send(result)
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse(error.message));
        }
    }
    
}

class SpendingController extends ControllerSet{
    saveSelect = 'sptype amount date'
    routes =[
        { path: '/', method: 'post', handler: "save" },
        { path: '/', method: 'get', handler: "getAll" , middleware: [authentification]},
        { path: '/:id', method: 'patch', handler: "update",middleware: [authentification]},
        { path: '/:id', method: 'delete', handler: "delete",middleware: [authentification]},
    ]
    constructor(){
        super(SpendingService)
    }
}
module.exports = {
    SpendingTypeController,
    SpendingController
}