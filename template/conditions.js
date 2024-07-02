import { Parser } from "expr-eval";
import { log } from "../modules/log.js";
import { strRender } from "./string.js";
import { getType } from "../modules/type.js";
const parser = new Parser();

function splitString(input) {
    const result = [];
    let current = '';
    let inQuote = false;
    let inDoubleQuote = false;
    let inArg = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === ' ' && !inQuote && !inDoubleQuote) {
            if (inArg) {
                result.push(current);
                current = '';
                inArg = false;
            }
            continue;
        }
        if (char === ',' && !inQuote && !inDoubleQuote) {
            result.push(current);
            current = '';
            inArg = false;
            continue;
        }
        if (char === '"') {
            inDoubleQuote = !inDoubleQuote;
        }
        if (char === "'") {
            inQuote = !inQuote;
        }
        current += char;
        inArg = true;
    }
    if (current) {
        result.push(current);
    }
    return result;
}

export default function condition(str){
    const ignore = ['+', '-', '*', '/', '%', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', 'and', 'or', 'not', 'true', 'false'];
    str = splitString(str);
    let condition = '';

    if (str.length === 0) {
        return false;
    } else if (str.length === 1) {
        let i = strRender(str[0]);
        if (getType(i) === 'string') {
            i = `'${i}'`;
        } else if (getType(i) === 'object') {
            i = JSON.stringify(i);
        } else if (i == undefined) {
            i = 0;
        }
        condition += i;
    } else {
        for (const s of str) {
            if (ignore.includes(s)) {
                condition += `${s} `;
                continue;
            }
            let i = strRender(s);
            if (getType(i) === 'string') {
                i = `'${i}'`;
            } else if (getType(i) === 'object') {
                i = JSON.stringify(i);
            }
            if (i == undefined)
                i = 0;
            condition += `${i} `;
        }
    }

    try {
        const result = parser.parse(condition).evaluate();
        return result;
    } catch (e) {
        log(`Invalid condition: ${str}`, 'error');
        return false;
    }
}