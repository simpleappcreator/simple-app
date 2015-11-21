function autoIncrementPlugin(schema) {
    schema.add({ 
        _id: { 
            type: Number, 
            default: 0 } });


    schema.pre('save', function (next) {
        var doc = this;
        var Model = doc.constructor;
        console.debug('doc._id:', doc._id);
        Model.find({}, function (err, docs) {
            if (err) console.debug(err);else 
            console.debug(docs.length);
            doc._id = docs.length;
            next();});});}


;



module.exports = autoIncrementPlugin;
//# sourceMappingURL=auto-increment.js.map
