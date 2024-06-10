import fn from "../functions/caller.js";
import { data } from "../storage/unique.js"
import { log } from "../modules/log.js";

export function strRender(str){
    
    //if it is a variable present in the data object
    if (data[str]){
        str = data[str]
        return str;
    } 
    //if it is a array access (allow multiple levels)
    if (str.includes("[") && str.endsWith("]")){
        let keys = str.split("[")
        let v = data[keys[0]]
        for (let j = 1; j < keys.length; j++) {
            v = v[keys[j].replace("]", "")];
            if (v===undefined) break;
        }
        str = v;
        return str;
    }
    //if it is a literal representation
    if (str.startsWith('"') && str.endsWith('"') || str.startsWith("'") && str.endsWith("'")){
        return str;
    }
    //if it is a number
    if (!isNaN(str)){
        return Number(str);
    }
    //if it is a boolean, true or false replace with 0 or 1
    if (str == "true"){
        str = 1;
        return str;
    } else if (str == "false"){
        str = 0;
        return str;
    }

    //if it is a function call
    if (str.includes("(") && str.endsWith(")")){
        //args = between first open parenthesis and last close parenthesis, split by comma
        let args = str.slice(str.indexOf("(")+1, str.lastIndexOf(")"))
        args = args.split(",")
        args = args.map(arg => arg.trim()) //remove whitespace
        for (let j = 0; j < args.length; j++) {
            args[j] = strRender(args[j]);
            if (args[j] === undefined) return undefined;
        }

        const func = str.slice(0, str.indexOf("("))
        str = fn(func, args)
        return str;
    }

    log(`Unkown ${str}`, 'error')
    return undefined;
}
