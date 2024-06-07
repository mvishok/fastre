import { load } from "cheerio";
import { appendData } from "../storage/unique.js";
import fetch from "./requests.js";
import { log } from "../modules/log.js";

export default function renderHTML($){

    const requests = $('request');
    requests.each(async (index, request) => {
        const to = $(request).attr('to');
        const method = $(request).attr('method');
        let headers = $(request).attr('headers') || "";
        let rbody;

        try{
            rbody = $(request).attr('body') ? JSON.parse($(request).attr('body')): "";
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

        let tagBody = renderHTML(load($(request).html()));
        $(request).replaceWith(tagBody);

    });
    return $
}