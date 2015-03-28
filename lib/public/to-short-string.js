function toShortString(string, startingEnd, endingStart) {
    if (!string || !string.length)
        return null;
    string = string.toString();

    startingEnd = parseInt(startingEnd || 10);

    if (!endingStart || (endingStart < 1 && endingStart > 0)) {
        var totalLength = startingEnd;
        var startingFraction = endingStart || (2 / 3);
        startingEnd = parseInt(totalLength * startingFraction);
        endingStart = parseInt(totalLength * (1 - startingFraction));
    }

    endingStart = parseInt(endingStart || 5);
    if (endingStart == 1) {
        startingEnd -= 1;
        endingStart = 0;
    }

    if (string.slice(-1) == '"')
        string = string.slice(0, -1);
    if (string.slice(-1) == "'")
        string = string.slice(0, -1);
    if (string.substr(0, 1) == '"')
        string = string.substr(1);
    if (string.substr(0, 1) == "'")
        string = string.substr(1);

    if (string.substr(0, 8) == 'https://')
        string = string.substr(8);
    if (string.substr(0, 7) == 'http://')
        string = string.substr(7);
    if (string.substr(0, 4) == 'www.')
        string = string.substr(4);

    if (string.slice(-1) == '/')
        string = string.slice(0, -1);

    if (string.length <= (startingEnd + endingStart))
        return string;

    return string.substr(0, startingEnd) + '…' + string.substr(string.length - endingStart);
}

if (typeof(angular) != 'undefined' && angular.module)
    angular.module('toShortString', []).filter('toShortString', function() {
        return toShortString;
    });
if (typeof(module) != 'undefined' && module.exports)
    module.exports = toShortString;
