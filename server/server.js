import { performance } from 'perf_hooks';
import { join } from "path";
import { log } from "../modules/log.js";
import { appendData, clearData } from "../storage/unique.js";
import { setCookies } from "./cookie.js";
import getParams from "./param.js";
import { config } from "../storage/global.js"
import serveStatic from "./static.js";
import render from '../template/template.js';
import { getEnv } from '../modules/env.js';
import getCookies from './cookie.js';

export async function serve(req, res){
    performance.mark('A');

    //load env variables
    appendData('env', getEnv())

    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname.endsWith('/')){
        url.pathname += 'index.html';
    }

    const path = join(config.dir, url.pathname);
    let status, headers, body;

    log(`[IN] [${req.method}] ${req.url}`, 'info');

    if (!getParams(req)){
        log("Error parsing params", "error");
    }

    if (!getCookies(req)){
        log("Error parsing cookies", "error");
    }

    try {
        //static file
        if (!path.endsWith('.html') && !path.endsWith('.req')){
            [status, headers, body] = await serveStatic(path);
        }

        //html file or req file
        else if (path.endsWith('.html') || path.endsWith('.req')){
            [status, headers, body] = await render(path);
        }
    } catch (e) {
        status = 500;
        headers = {};
        body = 'Internal Server Error';
        log(e, 'error');
    }

    res = setCookies(res);

    res.writeHead(status, headers);
    res.end(body);
    clearData();

    performance.mark('D');
    performance.measure('A to D', 'A', 'D');
    const timeTaken = performance.getEntriesByName('A to D')[0].duration.toFixed(2);
    performance.clearMeasures('A to D');
    (status == 200) ? log(`[IN] [${req.method}] ${req.url} took ${timeTaken}ms`, 'success') : log(`[IN] [${req.method}] ${req.url} took ${timeTaken}ms`, 'error');
}