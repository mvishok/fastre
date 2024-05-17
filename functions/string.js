
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

function replace(string, args) {
    return string.replace(args[0], args[1])
}

export { lower, upper, capitalize, reverse, length, trim, replace }