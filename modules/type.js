import { log } from "./log.js";

export function setType(type, str){
    if (type == "string"){
        return str;
    } else if (type == "number"){
        if (isNaN(str)){
            log(`Invalid number: ${str}`, 'error');
            return 0;
        }
        return Number(str);
    } else if (type == "boolean"){
        if (str == "true"){
            return true;
        } else if (str == "false"){
            return false;
        } else {
            log(`Invalid boolean: ${str}`, 'error');
            return false;
        }
    } else if (type == "object"){
        try {
            return JSON.parse(str);
        } catch (error) {
            log(`Invalid object: ${str}`, 'error');
            return {};
        }
    }
    log(`Invalid type: ${type}`, 'error');
    return str;
}