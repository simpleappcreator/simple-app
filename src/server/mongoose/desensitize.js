module.exports = function desensitize(docs) {
    if (!docs) return;
    if (docs.hash) return deleteStuff(docs);
    if (docs[0] && docs[0].hash) return docs.map(deleteStuff);
    return docs;
};

function deleteStuff(d) {
    delete d.hash;
    delete d.password;
    delete d.__v;
    return d;
}
