function populateAllPlugin(schema) {
    var paths = '';
    schema.eachPath(function process(pathname, schemaType) {
        if (pathname.match('_id')) return;
        if (schemaType.options.ref) 
        paths += ' ' + pathname;
        if (schemaType.schema && schemaType.schema.paths) 
        for (var key in schemaType.schema.paths) {
            process(pathname + '.' + key, schemaType.schema.paths[key]);}});


    schema.pre('find', handler);
    schema.pre('findOne', handler);

    function handler(next) {
        this.populate(paths);
        next();}}

;



module.exports = populateAllPlugin;
//# sourceMappingURL=populate-all.js.map
