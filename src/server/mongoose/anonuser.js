var schema = new mongoose.Schema({ 
    username: { 
        type: String, 
        default: 'AnonUser' }, 

    email: String, 
    anon: { 
        type: Boolean, 
        default: true } }, 

{ 
    strict: false });


global.AnonUser = mongoose.model('anonuser', schema);
module.exports = mongoose.AnonUser = AnonUser;
//# sourceMappingURL=anonuser.js.map
