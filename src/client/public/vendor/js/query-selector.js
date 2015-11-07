$.fn.querySelector = function querySelector(query) {
    if (!query || !query.length || typeof(query) != 'string') return null;
    return $(this[0].querySelector(query));
};
$.fn.querySelectorAll = function querySelectorAll(query) {
    if (!query || !query.length || typeof(query) != 'string') return null;
    var element = this;
    var array = element[0].querySelectorAll(query);
    if (!array || !Object.keys(array).length) return;
    array = Array.prototype.slice.call(array);
    for (var i = 0; i < array.length; i++)
        array[i] = $(array[i]);
    return array;
};
