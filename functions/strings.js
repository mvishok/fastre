//string functions

export function lower(args){
    let r = [];
    for (let i = 0; i < args.length; i++){
        r.push(args[i].toLowerCase());
    }
    return r.join(" ");
}

export function upper(args){
    let r = [];
    for (let i = 0; i < args.length; i++){
        r.push(args[i].toUpperCase());
    }
    return r.join(" ");
}

export function capitalize(args){
    let r = [];
    for (let i = 0; i < args.length; i++){
        r.push(args[i].charAt(0).toUpperCase() + args[i].slice(1).toLowerCase());
    }
    return r.join(" ");
}

export function replace(args){
    const escapedPattern = args[1].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return args[0].replace(new RegExp(escapedPattern, 'g'), args[2]);
}

export function replaceFirst(args){
    return args[0].replace(args[1], args[2]);
}

export function split(args){
    return args[0].split(args[1]);
}

export function concat(args){
    return args.join("");
}