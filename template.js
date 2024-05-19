import chalk from "chalk";
import { URL } from 'url';
import { errorCodeToMessage, ftype, makeRequest } from './modules.js';
import fs from 'fs';
import path from 'path';
import { performance } from "perf_hooks";
import * as string from './functions/string.js'
import * as int from './functions/int.js'

import { Parser } from "expr-eval";
const parser = new Parser();

function frameCondition(condition, data) {
    let keywords = ['and', 'or', 'not', 'true', 'false'];
    let operators = ['+', '-', '*', '/', '%', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', '(', ')'];
    
    condition = condition.split(' ')
    for (let i = 0; i < condition.length; i++){
        if (keywords.includes(condition[i])){
            continue;
        } else if (operators.includes(condition[i])){
            continue;
        } else if (!isNaN(condition[i])){
            continue;
        } else {
            let value = getValueFromData(condition[i], data);
            if (typeof value === 'undefined') {
                console.log(chalk.yellow(`Variable ${condition[i]} not found in data object. Defaulting to 0`));
                value = 0;
            } else if (typeof value === 'object') {
                console.log(chalk.yellow(`Variable ${condition[i]} is an object. Defaulting to length of the object`));
                value = Object.keys(value).length;
            } else {
                value = JSON.stringify(value);
            }
            condition[i] = value;
        }
    }
    return condition.join(' ');
    
}


function evaluateCondition(condition, data) {
    condition = frameCondition(condition, data);

    try {
        return parser.parse(condition).evaluate();
    } catch (err) {
        console.log(chalk.red(`Error parsing condition: ${condition}`));
        return false;
    }
}

function getValueFromData(match, data) {
    let f = null;
    let args = null;
    if (match.includes('.')){
        const split = match.split('.');
        f = split[1];
        match = split[0];
        if (f.includes('(')){
            const split = f.split('(');
            f = split[0];
            //args should be either string or number or list. if its without quotes, its a variable. call getValueFromData to get the value
            args = split[1].slice(0, -1).split(',').map(arg => {
                arg = arg.trim();
                if (arg[0] === '"' && arg[arg.length - 1] === '"' || arg[0] === "'" && arg[arg.length - 1] === "'") {
                    return arg.slice(1, -1);
                } else if (!isNaN(arg)) {
                    return parseFloat(arg);
                } else if (arg === 'true' || arg === 'false') {
                    return arg === 'true';
                } else {
                    return getValueFromData(arg, data);
                }
            });
        }
    }

    const parts = match.split(/\.|\[|\]/).filter(part => part.trim() !== '');
    let value = data;
    for (const part of parts) {
        value = value[part];
        if (value === undefined) break;
    }

    if (f !== null){
        //if typeof value is string, call the function from string.js
        if (typeof value === 'string'){
            if (string[f]){
                return string[f](value, args);
            }
        } else if (typeof value === 'number'){
            //if value is integer
            if (Number.isInteger(value)){
                if (int[f]){
                    return int[f](value, args);
                }
            }
        }
    } else {
        return value;
    }
}

export function render(template, data) {
    // Handle variables with {{variable}} syntax
    template = template.replace(/{{([^}}]+)?}}/g, (match, variable) => {
        let value = getValueFromData(variable.trim(), data);
        
        if (typeof value === 'undefined') {
            return `{{${variable}}}`;
        } else if (typeof value === 'object') {
            return JSON.stringify(value);
        } else {
            return value;
        }
    });

    // Handle control flow statements with if else and endif blocks. else is optional
    template = template.replace(/{% if(?:\[(\d+)\])?\s([^%]+)%}((?:(?!{% endif(?:\[\1\])? %}).)*?)(?:{% else(?:\[\1\])? %}([^]*?))?{% endif(?:\[\1\])? %}/gs, 
        (match, identifier, condition, ifBlock, elseBlock) => {
            if (evaluateCondition(condition, data)) {
                return ifBlock;
            } else {
                return elseBlock ? elseBlock : '';
            }
        }
    );
    /* syntax for if else
    {% if condition %}
        {{variable}}
    {% else %}
        {{variable}}
    {% endif %}
    */

    template = template.replace(/{% for ([^%]+)? in ([^%]+)?%}([^]*?){% endfor %}/gs, (match, key, array, block) => {
        let result = '';
        array = array.trim();
        const items = getValueFromData(array, data);
        if (items && items.length > 0) {
            for (const item of items) {
                result += render(block, { ...data, [key]: item });
            }
        } else {
            console.log(chalk.yellow(`Array ${array} not found in data object or is empty. Skipping for loop`));
        }
        return result;
    });
    /* syntax for loops
    {% for key in array %}
        {{key}}
    {% endfor %}

    array = [1,2,3,4,5]
    */

    return template;
}

async function prerender(
    htmlExists,
    jsonExists,
    data,
    url,
    res,req,
    htmlPath,
    jsonPath,
    memory
){
    let html = '';
    const json = {};
    const route = path.basename(jsonPath || htmlPath);

    if (jsonExists) {
        try {
            const jsondata = JSON.parse(fs.readFileSync(jsonPath));
            for (const key of Object.keys(jsondata)) {
                json[key] = jsondata[key];
            }
        } catch (err) {
            console.error(chalk.red(`Error parsing JSON file ${route} (${url}):\n`), err);
            return 500;
        }
    }

    //if "iplimit": "1/<seconds>", check if the IP has made more than 1 request in the last <seconds> seconds
    if (json.iplimit) {
        const [limit, seconds] = json.iplimit.split('/');
        const ip = res.socket.remoteAddress;
        const key = `ip:${ip}`;
        if (memory[key]) {
            const [count, time] = memory[key].split(':');
            if (Date.now() - time > seconds * 1000) {
                memory[key] = '1:' + Date.now();
            } else {
                if (count >= limit) {
                    console.log(chalk.red(`IP ${ip} has exceeded the request limit of ${limit} requests in the last ${seconds} seconds`));
                    return 429;
                } else {
                    memory[key] = `${parseInt(count) + 1}:${time}`;
                }
            }
        } else {
            memory[key] = '1:' + Date.now();
        }
    }

    //if "use": ["key1", "key2"], get key1, key2 from memory and add it to data's memory dictionary
    //should be accessible as data.memory.key1, data.memory.key2
    if (json.use) {
        data.memory = {};
        //json.use is a list of keys to be used from memory
        for (const key of json.use) {
            if (memory[key]) {
                data.memory[key] = memory[key];
            } else {
                console.log(chalk.yellow(`Key ${key} not found in memory. Defaulting to null`));
                data.memory[key] = null;
            }
        }
        
    }
    
    for (const key in json) {
        if (Object.hasOwnProperty.call(json, key)) { 
            const entry = json[key];
            
            // if it is an api request
            if (entry.to) {
                if (!entry.on) {
                    entry.on = ['GET'];
                }
    
                if (!entry.on.includes(req.method)) {
                    continue;
                }
                
                if (entry.require) {
                    let flag = false;
                    for (const variable in entry.require) {
                        if (!data[variable]) {
                            if (entry.require[variable] !== null) {
                                data[variable] = entry.require[variable];
                            } else {
                                console.error(chalk.red('Required variable', variable, 'for request to', entry.to, 'not found in data object. Aborting request'));
                                flag = true;
                            }
                        }
                    }
                    if (flag) {
                        continue;
                    }
                }

                entry.to = render(entry.to, data);

                const api = new URL(entry.to);
                if (api.protocol === 'http:' || api.protocol === 'https:') {

                    if (entry.method) {
                        entry.method = render(entry.method, data);
                        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(entry.method)) {
                            console.log(chalk.yellow('Invalid method specified for request', entry.to, 'defaulting to GET'));
                            entry.method = 'GET';
                        }
                    } else {
                        console.log(chalk.yellow('No method specified for request', entry.to, 'defaulting to GET'));
                        entry.method = 'GET';
                    }

                    if (entry.headers) {
                        const headers = {};
                        for (const header of Object.keys(entry.headers)) {
                            headers[header] = render(entry.headers[header].toString(), data);
                        }
                        entry.headers = headers;
                    } else {
                        console.log(chalk.yellow('No headers specified for request', entry.to, 'defaulting to empty object'));
                        entry.headers = {};
                    }

                    if (entry.body) {
                        if (typeof entry.body === 'string') {
                            entry.body = render(entry.body, data);
                        } else {
                            const body = {};
                            for (const i of Object.keys(entry.body)) {
                                body[i] = render(entry.body[i].toString(), data);
                            }
                            entry.body = body;
                        }
                    } else {
                        console.log(chalk.yellow('No body specified for request', entry.to, 'defaulting to empty object'));
                        entry.body = {};
                    }

                    const options = {
                        hostname: api.hostname,
                        port: api.port,
                        path: api.pathname + api.search, //pathname includes the leading slash and search includes the query string
                        method: entry.method,
                        headers: entry.headers,
                        body: entry.body
                    };

                    try {
                        console.log(chalk.white(`Making request to ${entry.to} (${url})`));
                        performance.mark('B');
                        const response = await makeRequest(options);
                        performance.mark('C');
                        performance.measure('B to C', 'B', 'C');
                        const timeTaken = performance.getEntriesByName('B to C')[0].duration.toFixed(2);
                        performance.clearMeasures('B to C');
                        console.log(chalk.blue(`request to ${entry.to} (${url}) completed in ${timeTaken}ms`));
                        data[key] = response;
                    } catch (err) {
                        console.error(chalk.red(`Error making request to ${entry.to} (${url}):\n`), err);
                        return 500;
                    }
                } else {
                    console.error(chalk.red('Invalid protocol specified for request', entry.to, 'aborting request'));
                }
                continue;
            }

            //if it is "respond": json, render the json and return it
            if (key === 'respond') {
                if (typeof entry === 'object') {
                    let final = render(JSON.stringify(entry), data);
                    try {
                        return JSON.parse(final);
                    } catch (err) {
                        console.error(chalk.red(`Error parsing JSON object for ${key} (${url}):\n`), err);
                        return 500;
                    }
                } else if (typeof entry === 'string') {
                    return render(entry, data);
                } else if (typeof entry === 'number') {
                    return entry;
                } else {
                    console.error(chalk.red(`Invalid response type for ${key} (${url})`));
                    return 500;
                }
            }

            // if it is "define": {key: value}, render the value and add it to data
            if (key === 'define') {
                //it can be {key: value} or {key: {value: value, type: type}}. if type is not specified, automatically detect the type (string, number, object)
                for (const variable in entry) {
                    //if type is specified, use that type
                    if (typeof entry[variable] === 'object') {
                        if (entry[variable].type === 'string') {
                            data[variable] = render(entry[variable].value, data).toString();
                        } else if (entry[variable].type === 'int') {
                            data[variable] = parseInt(render(entry[variable].value, data));
                        } else if (entry[variable].type === 'float') {
                            data[variable] = parseFloat(render(entry[variable].value, data));
                        } else if (entry[variable].type === 'object' || entry[variable].type === 'array' || entry[variable].type === 'json') {
                            data[variable] = JSON.parse(render(entry[variable].value, data)); 
                        } else {
                            data[variable] = render(entry[variable].value, data);
                        }
                    } else {
                        //automatically detect the type of the value
                        //render the value and check if it is a number or a json object
                        const value = render(entry[variable].toString(), data);
                        //if int
                        if (Number.isInteger(parseInt(value))) {
                            data[variable] = parseInt(value);
                        } else if (!isNaN(parseFloat(value))) {
                            data[variable] = parseFloat(value);
                        } else {
                            try {
                                data[variable] = JSON.parse(value);
                            } catch (err) {
                                data[variable] = value;
                            }
                        }

                    }
                }
            }
        }
    }

    if (htmlExists) {
        try {
            html = fs.readFileSync(htmlPath).toString();
        } catch (err) {
            console.error(chalk.red(`Error reading HTML file ${route} (${url}):\n`), err);
            return 500;
        }
        return render(html, data);
    } else {
        return JSON.stringify(data);
    }

}

export async function serve (req, res, config, memory){
    const { dir, errors } = config;
    console.log(chalk.blue(`Request for ${req.url} as ${req.method}`));

    performance.mark('A');

    const purl = new URL(req.url, `http://${req.headers.host}`);
    const query = purl.searchParams.toString() ? purl.searchParams.toString().split('&') : {};

    if (purl.pathname.endsWith('/')) {
        purl.pathname += 'index';
    }

    const data = {};

    
    if (req.method === "GET" && query.length > 0) {
        
        query.forEach(entry => {
            const i = entry.split("=");
            if (i[0] && i[1]) {
                data[i[0]] = i[1];
            } else {
                console.log(chalk.yellow(`Malformed GET request parameters, skipping ${i}`))
            }
        });
    
    } else if (req.method === "POST") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (body) {
                try {
                    const parsed = JSON.parse(body);
                    for (const key of Object.keys(parsed)) {
                        data[key] = parsed[key];
                    }
                } catch (err) {
                    console.log(chalk.red('Error parsing POST request body:\n'), err.message);
                }
            }
        });
    }

    if (req.url.includes('.')) {
        const filePath = path.join(dir, purl.pathname);
        const fileName = path.basename(filePath);
        const fileExtension = path.extname(filePath);

        if (fileExtension === '.json' || fileExtension === '.html') {
            if (errors?.["404"]){
                const output = await prerender(
                    errors["404"][1] ? true : false,
                    errors["404"][2] ? true : false,
                    data,
                    config.errors["404"][0],
                    res,req,
                    errors["404"][1],
                    errors["404"][2],
                    memory
                );
                res.writeHead(404, { 'Content-Type': errors["404"][1] ? 'text/html' : 'application/json' });
                res.end(output);
                console.log(chalk.red(`The requested route ${fileName} (${purl.href}) was not found.`));
                return;
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('The requested resource was not found.');
                console.log(chalk.red(`The requested static file ${fileName} (${purl.href}) was not found.`));
                return;
            }
        }

        fs.readFile(filePath, async (err, filedata) => {
            if (err) {
                if (errors?.["404"]){
                    const output = await prerender(
                        errors["404"][1] ? true : false,
                        errors["404"][2] ? true : false,
                        data,
                        config.errors["404"][0],
                        res,req,
                        errors["404"][1],
                        errors["404"][2],
                        memory
                    );
                    res.writeHead(404, { 'Content-Type': errors["404"][1] ? 'text/html' : 'application/json' });
                    res.end(output);
                    console.log(chalk.red(`The requested route ${fileName} (${purl.href}) was not found.`));
                } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('The requested resource was not found.');
                console.log(chalk.red(`The requested static file ${fileName} (${purl.href}) was not found.`));
                }
            } else {
                const contentType = ftype(fileExtension);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(filedata);
                console.log(chalk.green(`Served static file ${fileName} (${purl.href})`));
            }
        });
        return;
    }

    const jsonPath = path.join(dir, `${purl.pathname}.json`);
    const htmlPath = path.join(dir, `${purl.pathname}.html`);

    const jsonExists = fs.existsSync(jsonPath);
    const htmlExists = fs.existsSync(htmlPath);
    
    if (!jsonExists && !htmlExists) {
        if (errors?.["404"]){
            const output = await prerender(
                errors["404"][1] ? true : false,
                errors["404"][2] ? true : false,
                data,
                config.errors["404"][0],
                res,req,
                errors["404"][1],
                errors["404"][2],
                memory
            );
            res.writeHead(404, { 'Content-Type': errors["404"][1] ? 'text/html' : 'application/json' });
            res.end(output);
            console.log(chalk.red(`The requested route ${purl.href} was not found.`));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('The requested resource was not found.');
            console.log(chalk.red(`The requested route ${purl.href} was not found.`));
        }
        return;
    }

    const final = await prerender(
        htmlExists,
        jsonExists,
        data,
        purl.href,
        res,req,
        htmlPath,
        jsonPath,
        memory
    );

    if (typeof final === 'string') {
        res.writeHead(200, { 'Content-Type': htmlExists ? 'text/html' : 'application/json' });
        res.end(final);
    } else if (typeof final === 'object'){
        //application/json
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(final));
    } else {
        if (errors?.[final]){
            const output = await prerender(
                errors[final][1] ? true : false,
                errors[final][2] ? true : false,
                data,
                config.errors[final][0],
                res,req,
                errors[final][1],
                errors[final][2],
                memory
            );
            res.writeHead(final, { 'Content-Type': errors["404"][1] ? 'text/html' : 'application/json' });
            res.end(output);
            console.log(chalk.red(`${errorCodeToMessage(final)} while processing ${purl.href}`));
            return;
        } else {
            const msg = errorCodeToMessage(final);
            res.writeHead(final, { 'Content-Type': 'text/plain' });
            res.end(msg);
            console.log(chalk.red(`${msg} while processing ${purl.href}`));
        }
    }

    performance.mark('D');
    performance.measure('A to D', 'A', 'D');
    const timeTaken = performance.getEntriesByName('A to D')[0].duration.toFixed(2);
    performance.clearMeasures('A to D');
    console.log(chalk.green(`Processed ${req.url} in ${timeTaken}ms`));
}