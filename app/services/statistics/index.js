const moment = require("moment")
const Spending = require("../../models/spending");
const Payment = require("../../models/payement");

class Monthly{
    array = []
    initiate(otherlabels){
        var retour=[]
        const months=moment.months();
        for(var i=0; i<months.length; i++){
            let temp={}
            temp.month=months[i]
            temp.key=i+1
            for(let j of otherlabels){
                temp[j]=0
            }
            retour.push(temp)
        }
        this.array=retour
    }
    getMonthly(array,labels){
        for(let element of array){
            for(let month of this.array){
                if(element['month']=== month['key']){
                    for(let j of labels){
                        console.log(element[j],j,element)
                        month[j]+=element[j]
                    }
                }
            }
        }
    }
    getActions(action,storelabel){
        for(let element of this.array){
            element[storelabel]=action(element)
        }
    }
}
class Stat{
    
    async getBenefit(){
        const [spending, earning] = await Promise.all([
            Spending.getSpendingBy(true, true),
            Payment.getEarningBy(true, true)
        ]);
        const mon = new Monthly();
        mon.initiate(['totalEarning', 'totalSpending'])
        mon.getMonthly(earning, ['totalEarning'])
        mon.getMonthly(spending, ['totalSpending'])
        mon.getActions((e)=> e.totalEarning - e.totalSpending,'benefit')
        return mon.array;
    }
}
module.exports = {
    Monthly: Monthly,
    Stat: Stat
}