const crypto = require('crypto');

const md5=(value)=>{
    return crypto.createHash('md5').update(value).digest('hex');
}

const sha1=(value)=>{
    return crypto.createHash('sha1').update(value).digest('hex');
}

const sha256=(value)=>{
    return crypto.createHash('sha256').update(value).digest('hex');
}

const sha512=(value)=>{
    return crypto.createHash('sha512').update(value).digest('hex');
}
const noEncryption=(value)=>{
    return value
}
const encrypt={
    md5,
    sha1,
    sha256,
    sha512,
    noEncryption

}
module.exports = {encrypt}