const appointmentState = {
  CREATED: "CREATED",
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  CANCELED: "CANCELED",
  DONE: "DONE",
  PAID: "PAID",
  CONFLICTING: "CONFLICTING",
  EMPLOYEE_UNAVAILABLE: "EMPLOYEE_UNAVAILABLE",
  EMPLOYEE_NOT_QUALIFIED: "EMPLOYEE_NOT_QUALIFIED",
}

const httpState = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
}

const side={
  CLIENT:"CLIENT",
  ADMIN: "ADMIN",
  EMP: "EMP",
}
class AppointmentState {
  constructor(state) {
    this.state = state;
  }
}
class ImpossibleAppointmentState extends AppointmentState {
  constructor(emp) {
    super(appointmentState.CONFLICTING)
    this.responsable = emp
    this.message = `${emp.firstName} cannot attend your appointment, please pick different time.`
  }
}
class Result{
  constructor(state,data){
    this.state = state
    this.data = data
  }
}
class SuccessResult extends Result{
  constructor(data){
    super(httpState.SUCCESS,data)
    
  }
}
class FailedResult extends Result{
  constructor(data){
    super(httpState.FAILED,data)
  }
}
module.exports = {
  appointmentState,
  httpState,
  side,
  ImpossibleAppointmentState,
  AppointmentState,
  Result,
  SuccessResult,
  FailedResult
}