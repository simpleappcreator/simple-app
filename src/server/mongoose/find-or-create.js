function findOrCreatePlugin(schema) {
    schema.statics.findOrCreate = findOrCreate;}
;

function findOrCreate(query, done) {
    var Model = this;
    done = done || nooperr;
    return new Promise(function (resolve, reject) {
        Model.findOne(query, function (err, doc) {
            if (doc) {
                done(null, doc);
                resolve(doc);} else 
            {
                var doc = new Model(query);
                doc.save(function (err, doc) {
                    if (doc) {
                        done(null, doc);
                        resolve(doc);} else 
                    {
                        done(err);
                        reject(err);}});}});});}





;

module.exports = findOrCreatePlugin;
//# sourceMappingURL=find-or-create.js.map
