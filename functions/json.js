function pop(array){
    return array.pop();
}

function shift(array){
    return array.shift();
}

function unshift(array, value){
    return array.unshift(value);
}

function sort(array){
    return array.sort();
}

function reverse(array){
    return array.reverse();
}

function slice(array, args){
    return array.slice(args[0], args[1]);
}

function splice(array, args){
    return array.splice(args[0], args[1]);
}

function find(array, args){
    return array.find(args[0]);
}

function filter(array, args){
    return array.filter(args[0]);
}

function map(array, args){
    return array.map(args[0]);
}

function reduce(array, args){
    return array.reduce(args[0]);
}

function indexOf(array, args){
    return array.indexOf(args[0]);
}

function lastIndex(array, args){
    return array.lastIndexOf(args[0]);
}

function includes(array, args){
    return array.includes(args[0]);
}

function size(array){
    return array.length;
}

export { pop, shift, unshift, sort, reverse, slice, splice, find, filter, map, reduce, indexOf, lastIndex, includes, size }