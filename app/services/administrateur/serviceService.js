const { default: mongoose } = require("mongoose");
const ServiceSet = require("..");
const Employee = require("../../models/employee");
const Service = require("../../models/services");
const moment = require("moment");
const { appointmentState } = require("../../state");
class Service_service extends ServiceSet {
    constructor() {
        super(Service)
    }
    async getQualified(serviceId) {
        const d = await Service.findById(serviceId);
        const employee = await d.qualified();
        return employee;
    }
    async getAvailableFor(serviceId, date) {
        const service = await Service.findById(serviceId);
    
        if (service) {
            const start = moment(date);
            const end = moment(date).add(service.duree, "minutes");
            console.log(start.format("LLL"), end.format("LLL"));
    
            const employees = await service.qualified({
                $or: [
                    {
                        $or: [
                            {
                                "schedule.start": { $gte: end.toDate() },
                                "schedule.end": { $gt: end.toDate() }
                            },
                            {
                                "schedule.start": { $lt: start.toDate() },
                                "schedule.end": { $lte: start.toDate() }
                            }
                        ]
                    },
                    {
                        "schedule": []
                    }
                ]
            });
    
            return employees.filter(emp => emp.isAvailable([start.toDate(), end.toDate()]));
        }
    
        return []; // or handle the case when the service is not found
    
    }
}

module.exports = Service_service;