import { load } from "cheerio";
import { existsSync, readFileSync, stat } from "fs";
import { config } from "../storage/global.js";
import { notfound } from "../default/defaults.js";
import { log } from "../modules/log.js";
import { appendData } from "../storage/unique.js";
import fetch from "./requests.js";

export default async function render(path){
    let status, headers, body;

    if (!existsSync(path)){
        log(`[404] ${path} not found`, 'error');
        status = 404;
        headers = {"Content-Type": "text/html"}
        if (config.errors?.["404"]){
            render(config.errors["404"]);
        } else {
            body = notfound;
        }
    } else {
        body = readFileSync(path, 'utf-8');
    }

    const $ = load(body);

    const requests = $('request');
    requests.each(async (index, request) => {
        const to = $(request).attr('to');
        const method = $(request).attr('method');
        let headers = $(request).attr('headers') || "";
        let rbody;

        try{
            rbody = $(request).text() ? JSON.parse($(request).text()): "";
        } catch {
            log(`[OUT] [${method}] ${to} failed`, 'error');
            log("Invalid JSON", 'error');
            return
        }

        const id = $(request).attr('id');
        let response;
        
        //parse headers
        headers = headers.split(';').map(header => {
            const [key, value] = header.split(':');
            return {key, value};
        });

        try{
            response = await fetch(to, method, headers, rbody);
        } catch (err){
            log(`[OUT] [${method}] ${to} failed`, 'error');
            log(err, 'error');
            return
        }

        if (id){
            appendData(id, response);
        }

        $(request).html("");
    });

    status = 200;
    headers = {"Content-Type": "text/html"};
    body = $.html();

    return [status, headers, body];
}