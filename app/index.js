const { default: mongoose } = require("mongoose");
const { httpState } = require("./state");
class ResponseResult{
    constructor(status,data){
        this.status = status
        this.data = data
    }
}
class SuccessResponse extends ResponseResult{
    constructor(data){
        super(httpState.SUCCESS,data)
    }
}
class FailureResponse extends ResponseResult{
    constructor(message){
        super(httpState.FAILED,{message:message})
    }
}
exports.SuccessResponse = SuccessResponse;
exports.FailureResponse = FailureResponse;
exports.routesController=(router,controller,baseurl="/api",middleware=[(req,res,next)=> next()])=>{
    for(let mid of middleware){
        router.use(async (req, res, next) => {
            await mid(req, res, next);
          });
    }
    for(let c of controller.routes){
        // console.log(c)
        router[c.method](`${baseurl}${c.path}`,c.middleware? c.middleware:(req,res,next)=> next(),async (req, res) =>{
            await controller[c.handler](req,res)
        })
    }
}

exports.toObjectId= (str)=>{
    return new mongoose.Types.ObjectId(str)
}