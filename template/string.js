import fn from "../functions/caller.js";
import { data } from "../storage/unique.js"

export function strRender(str){
    str = str.split(" ")
    
    for (let i = 0; i < str.length; i++) {
        //if it is a variable present in the data object
        if (data[str[i]]){
            str[i] = data[str[i]]
            continue;
        } 
        //if it is a array access (allow multiple levels)
        if (str[i].includes("[") && str[i].endsWith("]")){
            let keys = str[i].split("[")
            let v = data[keys[0]]
            for (let j = 1; j < keys.length; j++) {
                v = v[keys[j].replace("]", "")];
                if (v===undefined) break;
            }
            str[i] = v;
            continue;
        }
        //if it is a literal representation
        if (str[i].startsWith('"') && str[i].endsWith('"') || str[i].startsWith("'") && str[i].endsWith("'")){
            continue;
        }
        //if it is a number
        if (!isNaN(str[i])){
            continue;
        }
        //if it is a boolean, true or false replace with 0 or 1
        if (str[i] == "true"){
            str[i] = 1;
            continue;
        } else if (str[i] == "false"){
            str[i] = 0;
            continue;
        }

        //if it is a function call
        if (str[i].includes("(") && str[i].endsWith(")")){
            //args = between first open parenthesis and last close parenthesis, split by comma
            let args = str[i].slice(str[i].indexOf("(")+1, str[i].lastIndexOf(")"))
            args = args.split(",")
            args = args.map(arg => arg.trim()) //remove whitespace
            for (let j = 0; j < args.length; j++) {
                args[j] = strRender(args[j]);
            }

            const func = str[i].slice(0, str[i].indexOf("("))
            str[i] = fn(func, args)
            continue;
        }
    }
    return str.join(" ")
}