module.exports = function Objectify(docs) {
    return docs.reduce(function(p, c) {
        p[c._id] = c;
        return p;
    }, {});
};
