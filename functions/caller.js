import { log } from "../modules/log.js";
import * as string from "./strings.js";
import * as array from "./arrays.js";

const functions = {
    //string functions
    lower: string.lower,
    upper: string.upper,
    capitalize: string.capitalize,
    replace: string.replace,
    replaceFirst: string.replaceFirst,
    split: string.split,
    concat: string.concat,

    //array functions
    arraySize: array.arraySize,
} 

export default function fn(name, args){

    for (let i = 0; i < args.length; i++){
        if (typeof args[i] == "object") args[i] = JSON.stringify(args[i]);
        else if (!isNaN(args[i])){
            args[i] = Number(args[i]);
        } else if (args[i] == "true"){
            args[i] = true;
        } else if (args[i] == "false"){
            args[i] = false;
        } else if (args[i].startsWith('"') && args[i].endsWith('"') || args[i].startsWith("'") && args[i].endsWith("'")){
            args[i] = args[i].slice(1, -1);
        } else {
            log(`Unknown ${args[i]}`, 'error')
        }
    }

    if (functions[name]){
        let r = functions[name](args);
        if (r === undefined){
            r = 0;
        } else if (typeof r == "object"){
            r = `'${JSON.stringify(r)}'`
        } else if (typeof r == "string"){
            r = `${r}`
        } else if (typeof r == "boolean"){
            r = r ? "true" : "false";
        } else {
            r = r.toString();
        }
        return r;
    } else {
        log(`Function ${name} not found`, 'error');
    }
    return null;
}