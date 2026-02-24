//pourcentage calulator
const percentage = (value) => {
  return value/100;
}

const percentageOf=function(amount,p){
  return amount * percentage(p)
}

/**
 * Ficalculena somme
 * @param {Array} array 
 * @param {function} target le zavatra ho calculena ohatra hoe salaire, heure ,etc | fonction ilay izy
 * @param {function} extract par inona ilay izy, mois, annee, par employee sa inona | fonction ilay izy
 * @returns 
 */
const sum = (array, target, extract) => {
    if (!Array.isArray(array) || typeof extract !== 'function') {
        throw new Error('Invalid input parameters');
    }

    const result ={};
    array.forEach(item=>{
        const by = extract(item);
        if(!result[by]){
            result[by] = {sum:0,count:0}
        }
        result[by].sum+=(target(item)||0)
        result[by].count+=1
    })
    return result

}

/**
 * Ficalculena moyenne
 * @param {Array} array 
 * @param {function} target le zavatra ho calculena ohatra hoe salaire, heure ,etc | fonction ilay izy
 * @param {function} extract par inona ilay izy, mois, annee, par employee sa inona | fonction ilay izy
 * @returns 
 */
const avg = (array,target,extract)=>{
    if (!Array.isArray(array) || typeof extract !== 'function') {
        throw new Error('Invalid input parameters');
    }
    const s = sum(array,target,extract);
    const retour = {}
    for(let key in s){
        const average = s[key].sum / s[key].count;
        retour[key] = {avg:average,count:s[key].count}
    }
    return retour;
}
function getTimeIntervalKey(date, target) {
    const momentDate = moment(date);
  
    switch (target) {
      case 'day':
        return momentDate.format('YYYY-MM-DD');
      case 'week':
        return momentDate.format('YYYY-[W]WW');
      case 'month':
        return momentDate.format('YYYY-MM');
      case 'year':
        return momentDate.format('YYYY');
      default:
        throw new Error('Invalid target');
    }
  }
module.exports = {
    sum,
    avg,
    getTimeIntervalKey,
    percentage,
    percentageOf
}