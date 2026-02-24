const ServiceSet = require("..");
const Spending = require("../../models/spending");
const SpendingType = require("../../models/spendingtype");

class SpendingTypeService extends ServiceSet {
    constructor() {
        super(SpendingType)
    }
    
    // delete with check 
    async deletespendingtype(id){
        try {
            // check if already use in spending 
            const isUsedInSpending = await new SpendingService().isSpendintypeUsed(id);
            if (isUsedInSpending) {
                throw new Error("Impossible de supprimer le type de dépense car il est déjà utilisé dans un dépense.");
            }
            const deleted = await SpendingType.findByIdAndDelete(id);
            console.log('Spendingtype deleted:', deleted); 
            return deleted;
          } catch (error) {
            console.error('Error deleting spendingtype:', error.message);
            throw error;
          } 
    }

}
class SpendingService extends ServiceSet {
    constructor() {
        super(Spending)
    }
    async isSpendintypeUsed(id){
        const isUsedInSpending = await Spending.exists({ sptype: id });
        return isUsedInSpending;
    }
    async create(serviceData) {
        const data=new Spending(serviceData);
        if(data.amount === 0){
            await data.populate('sptype');
            data.amount = data.sptype.spendingvalue
        }
        return await super.create(data);
    }

}
module.exports = { SpendingTypeService, SpendingService }