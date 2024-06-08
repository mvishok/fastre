import { load } from "cheerio";
import { appendData, data, removeData } from "../storage/unique.js";
import { log } from "../modules/log.js";
import bent from "bent";
import { performance } from 'perf_hooks';

export default async function renderHTML($){

    const requests = $('request');
    for (let i = 0; i < requests.length; i++){
        const request = requests.eq(i);
        const url = $(request).attr('to');
        const method = $(request).attr('method') || 'get';
        let headers = $(request).attr('headers') || "";
        let rbody = null;

        try{
            rbody = $(request).attr('body') ? JSON.parse($(request).attr('body')): "";
        } catch {
            log(`[OUT] [${method}] ${url} failed`, 'error');
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
            log(`[OUT] [${method}] ${url} initiated`, 'info');
            performance.mark("B")
            const request = bent(url, method, 'json', 200);
            response = await request(rbody, headers)
            performance.mark("C")
            performance.measure('B to C', 'B', 'C');
            const time = performance.getEntriesByName('B to C')[0].duration.toFixed(2);
            performance.clearMeasures('B to C');
            log(`[OUT] [${method}] ${url} success in ${time}ms`, 'info');
        } catch (err){
            log(`[OUT] [${method}] ${url} failed`, 'error');
            log(err, 'error');
            continue;
        }

        if (id){
            appendData(id, response);
        } else {
            appendData("inherit", response);
        }

        let tagBody = await renderHTML(load($(request).html()), null, false);
        $(request).replaceWith(`<span>${tagBody}</span>`);

        if (id){
            removeData(id);
        } else {
            removeData("inherit");
        }
    }

    const dataTags = $('data');
    dataTags.each((index, tag) => {
        const id = $(tag).attr('id');
        const val = $(tag).attr('val');
        const type = $(tag).attr('type');
        let keys = $(tag).attr('key') || "";

        keys = keys == "" ? [] : keys.split(" ")

        if (!id){
            log("Data tag without id", 'error');
            return
        } else if (!data[id] && val){
            appendData(id, val)
            $(tag).replaceWith("");
            return
        } else if (!data[id]){
            if (id == "inherit"){
                log(`No parent data found to inherit`, 'error');
                return
            } else {
                log(`${id} is not defined`, 'error');
                return
            }
        } else {
            let v = data[id];
            if (keys.length > 0 ){
                for (const key of keys) {
                    v = v[key]
                    if (v===undefined) break;
                }
            }
            $(tag).replaceWith(typeof v === 'object' ? JSON.stringify(v, null, 2) : v);
        }
    });


    return $.html();
}