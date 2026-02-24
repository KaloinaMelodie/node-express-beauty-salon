const { routesController } = require("../app");
const { AdministrateurController } = require("../app/controllers/administrateur");
const { MailingController } = require("../app/controllers/administrateur/mailcontroller");
const { SpendingTypeController, SpendingController } = require("../app/controllers/administrateur/spending");
const { ClientController } = require("../app/controllers/client");
const { EmployeController } = require("../app/controllers/employe");
const { authentification } = require("../app/middleware/authentification");

// all routes goes here
const router = require("express").Router();

routesController(router,new AdministrateurController(),baseurl='/admin')
routesController(router,new MailingController(),baseurl='')
routesController(router,new EmployeController(),baseurl='/employee')
routesController(router, new ClientController(),baseurl='/client')
routesController(router, new SpendingTypeController(),baseurl='/spending-type')
routesController(router, new SpendingController(),baseurl='/spending')

// client

// admin

// employee
module.exports = router