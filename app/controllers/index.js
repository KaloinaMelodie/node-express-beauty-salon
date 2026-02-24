const only = require("only");
const { connectDefault } = require("../../config/db");
const { FailureResponse } = require("..");

class ControllerSet {
    constructor(service) {
        console.log("service:", service)
        this.s = new service()
    }
    async save(req, res) {
        try {
            // console.log(this.s)
            await connectDefault()
            console.log("service2:", this.s)
            const service = this.s
            let data = this.saveSelect ? only(req.body, this.saveSelect) : req.body
            const result = await service.create(data)
            res.status(201).send(result)
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error'));
     
        }
    }

    async getOne(req, res) {
        try {
            const {id} = req.params
            const service = this.s
            await connectDefault()
            const result=await service.getOne(id)
            res.status(200).send(result)
        } catch (error) {
            
        }
    }

    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page);

            const itemsPerPage = parseInt(req.query.pageSize);

            const offset = undefined;
            if(page && itemsPerPage){
                offset=(page - 1) * itemsPerPage
            }

            // console.log(this.s)
            await connectDefault()
            console.log("service2:", this.s)
            const service = this.s
            let data = req.body;
            const result = await service.getAll(offset, itemsPerPage, data)

            res.status(200).send(result)
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error'));
        }
    }

    async update(req, res) {
        try {
            // console.log(this.s)
            await connectDefault()
            console.log("service2:", this.s)
            const service = this.s
            let data = this.saveSelect ? only(req.body, this.saveSelect) : req.body
            const result = await service.update(req.params.id, data)
            res.status(201).send(result)
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error'));
        }
    }

    async delete(req, res) {
        try {
            // console.log(this.s)
            await connectDefault()
            console.log("service2:", this.s)
            const service = this.s
            const result = await service.delete(req.params.id)
            res.status(200).send(result)
        } catch (error) {
            console.error(error);
            res.status(500).send(new FailureResponse('Internal Server Error'));
        }
    }

}

module.exports = ControllerSet