import chalk from "chalk";
import { URL } from 'url';
import { errorCodeToMessage, ftype, makeRequest } from './modules.js';
import fs from 'fs';
import path from 'path';
import { performance } from "perf_hooks";


import { Parser } from "expr-eval";
const parser = new Parser();

function evaluateCondition(condition, data) {
    condition = condition.replace(/[a-zA-Z_]+[a-zA-Z0-9_]*(\.[a-zA-Z_]+[a-zA-Z0-9_]*|\[[a-zA-Z_]+[a-zA-Z0-9_]*\])*/g , match => {
        if (match === 'and' || match === 'or') return match;
        let value = getValueFromData(match, data);
        if (typeof value === 'undefined') {
            console.log(chalk.yellow(`Variable ${match} not found in data object. Defaulting to 0`));
            value = 0;
        } else if (typeof value === 'object') {
            console.log(chalk.yellow(`Variable ${match} is an object. Defaulting to length of the object`));
            value = Object.keys(value).length;
        } else {
            value = JSON.stringify(value);
        }
        return value;
    });
    try {
        return parser.parse(condition).evaluate();
    } catch (err) {
        console.log(chalk.red(`Error parsing condition: ${condition}`));
        return false;
    }
}

function getValueFromData(match, data) {
    const parts = match.split(/\.|\[|\]/).filter(part => part.trim() !== '');
    let value = data;
    for (const part of parts) {
        value = value[part];
        if (value === undefined) break;
    }
    return value;
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
    res,
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
            const request = json[key];

            if (request.to) {
                if (request.require) {
                    let flag = false;
                    for (const variable in request.require) {
                        if (!data[variable]) {
                            if (request.require[variable] !== null) {
                                data[variable] = request.require[variable];
                            } else {
                                console.error(chalk.red('Required variable', variable, 'for request to', request.to, 'not found in data object. Aborting request'));
                                flag = true;
                            }
                        }
                    }
                    if (flag) {
                        continue;
                    }
                }

                request.to = render(request.to, data);

                const api = new URL(request.to);
                if (api.protocol === 'http:' || api.protocol === 'https:') {

                    if (request.method) {
                        request.method = render(request.method, data);
                        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
                            console.log(chalk.yellow('Invalid method specified for request', request.to, 'defaulting to GET'));
                            request.method = 'GET';
                        }
                    } else {
                        console.log(chalk.yellow('No method specified for request', request.to, 'defaulting to GET'));
                        request.method = 'GET';
                    }

                    if (request.headers) {
                        const headers = {};
                        for (const header of Object.keys(request.headers)) {
                            headers[header] = render(request.headers[header].toString(), data);
                        }
                        request.headers = headers;
                    } else {
                        console.log(chalk.yellow('No headers specified for request', request.to, 'defaulting to empty object'));
                        request.headers = {};
                    }

                    if (request.body) {
                        if (typeof request.body === 'string') {
                            request.body = render(request.body, data);
                        } else {
                            const body = {};
                            for (const entry of Object.keys(request.body)) {
                                body[entry] = render(request.body[entry].toString(), data);
                            }
                            request.body = body;
                        }
                    } else {
                        console.log(chalk.yellow('No body specified for request', request.to, 'defaulting to empty object'));
                        request.body = {};
                    }

                    const options = {
                        hostname: api.hostname,
                        port: api.port,
                        path: api.pathname + api.search, //pathname includes the leading slash and search includes the query string
                        method: request.method,
                        headers: request.headers,
                        body: request.body
                    };

                    try {
                        console.log(chalk.white(`Making request to ${request.to} (${url})`));
                        performance.mark('B');
                        const response = await makeRequest(options);
                        performance.mark('C');
                        performance.measure('B to C', 'B', 'C');
                        const timeTaken = performance.getEntriesByName('B to C')[0].duration.toFixed(2);
                        performance.clearMeasures('B to C');
                        console.log(chalk.blue(`Request to ${request.to} (${url}) completed in ${timeTaken}ms`));
                        data[key] = response;
                    } catch (err) {
                        console.error(chalk.red(`Error making request to ${request.to} (${url}):\n`), err);
                        return 500;
                    }
                } else {
                    console.error(chalk.red('Invalid protocol specified for request', request.to, 'aborting request'));
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
                    res,
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
                        res,
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
                res,
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
        res,
        htmlPath,
        jsonPath,
        memory
    );

    if (typeof final === 'string') {
        res.writeHead(200, { 'Content-Type': htmlExists ? 'text/html' : 'application/json' });
        res.end(final);
    } else {
        if (errors?.[final]){
            const output = await prerender(
                errors[final][1] ? true : false,
                errors[final][2] ? true : false,
                data,
                config.errors[final][0],
                res,
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