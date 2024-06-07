import { load } from "cheerio";
import { appendData, data } from "../storage/unique.js";
import { log } from "../modules/log.js";
import bent from "bent";

export default async function renderHTML($){

    const requests = $('request');
    for (let i = 0; i < requests.length; i++){
        const request = requests.eq(i);
        const to = $(request).attr('to');
        const method = $(request).attr('method') || 'get';
        let headers = $(request).attr('headers') || "";
        let rbody = null;

        try{
            rbody = $(request).attr('body') ? JSON.parse($(request).attr('body')): "";
        } catch {
            log(`[OUT] [${method}] ${to} failed`, 'error');
            log("Invalid JSON", 'error');
            continue;
        }

        const id = $(request).attr('id');
        let response;
        
        //parse headers
        headers = headers.split(';').map(header => {
            const [key, value] = header.split(':');
            return {key, value};
        });
        
        try{
            log(`[OUT] [${method}] ${to}`, 'info');
            const url = to;
            const request = bent(url, method, 'json', 200);
            response = await request(rbody, headers)
            log(`[OUT] [${method}] ${to} success`, 'info');
        } catch (err){
            log(`[OUT] [${method}] ${to} failed`, 'error');
            log(err, 'error');
            continue;
        }

        if (id){
            appendData(id, response);
        }

        let tagBody = await renderHTML(load($(request).html()), null, false);
        $(request).replaceWith(`<span>${tagBody}</span>`);
    }

    const dataTags = $('data');
    dataTags.each((index, tag) => {
        const id = $(tag).attr('id');
        if (!id){
            log("Data tag without id", 'error');
            return
        } else if (!data[id]){
            log(`${id} is not defined`, 'error');
            return
        } else {
            $(tag).replaceWith(typeof data[id] === 'object' ? JSON.stringify(data[id], null, 2) : data[id]);
        }
    });


    return $.html();
}