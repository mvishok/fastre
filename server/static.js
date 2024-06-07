import {existsSync, readFileSync} from 'fs';
import { config } from '../storage/global.js';
import { notfound } from '../default/defaults.js';
import path from 'path';
import { log } from '../modules/log.js';
import render from '../template/template.js';

export default function serveStatic(path){
    let status, headers, body;
    //if file exists
    if (existsSync(path)){

    } else {
        log(`[404] ${path} not found`, 'error');
        status = 404;
        headers = {"Content-Type": "text/html"}
        if (config.errors?.["404"]){
            render(config.errors["404"]);
        } else {
            body = notfound;
        }
    }
    return [status, headers, body];
}