import {existsSync, readFileSync} from 'fs';
import { config } from '../storage/global.js';
import { notfound } from '../default/defaults.js';
import { log } from '../modules/log.js';
import render from '../template/template.js';
import { contentType } from '../modules/type.js';

export default async function serveStatic(path){
    let status, headers, body;
    //if file exists
    if (existsSync(path)){
        log(`[200] ${path}`, 'info');
        status = 200;
        headers = {"Content-Type": contentType(path)};
        body = readFileSync(path);
    } else {
        log(`[404] ${path} not found`, 'error');
        status = 404;
        headers = {"Content-Type": "text/html"}
        if (config.errors?.["404"]){
            body = await render(config.errors["404"]);
            if (body[0] == 200){
                body = body[2];
            } else {
                body = notfound;
            }
        } else {
            body = notfound;
        }
    }
    return [status, headers, body];
}