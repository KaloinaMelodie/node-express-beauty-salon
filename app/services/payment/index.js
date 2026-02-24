const ServiceSet = require("..");
const Payment = require("../../models/payement");

class PaymentService extends ServiceSet {
    constructor() {
        super(Payment)
    }

    async pay(client, amount, reference) {
        const p = new Payment({ client: client, amount: amount, reference: reference });
        const result = await this.create(p);
        return result;
    }

    async getEarning(year, month, day) {
        const y = year !== undefined
        const m = month !== undefined
        const d = day !== undefined
        const values = await Payment.getEarningBy(y, m, d)
        return values
    }
}
module.exports = PaymentService;