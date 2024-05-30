
function lower(string) {
    return string.toLowerCase()
}

function upper(string) {
    return string.toUpperCase()
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function reverse(string) {
    return string.split('').reverse().join('')
}

function length(string) {
    return string.length
}

function trim(string) {
    return string.trim()
}

function replaceOne(string, args) {
    return string.replace(args[0], args[1])
}

function replace(string, args) {
    const escapedPattern = args[0].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return string.replace(new RegExp(escapedPattern, 'g'), args[1]);
}

function split(string, args) {
    return string.split(args[0])
}

export { lower, upper, capitalize, reverse, length, trim, replaceOne, replace, split }