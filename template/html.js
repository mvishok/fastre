import { load } from "cheerio";
import { appendData, data, removeData } from "../storage/unique.js";
import { log } from "../modules/log.js";
import bent from "bent";
import { performance } from 'perf_hooks';
import { autoType, isUrl, setType } from "../modules/type.js";
import { strRender } from "./string.js";
import condition from "./conditions.js";

export default async function renderHTML($){

    let requests = $('request');
    while (requests.length > 0){
        const request = requests.eq(0);
        let url = $(request).attr('to');
        const method = $(request).attr('method') || 'get';
        let headers = $(request).attr('headers') || "";
        let rbody = null;

        //chck if url is valid or not
        if (!url){
            log("Request tag without url", 'error');
            $(request).replaceWith("");
            requests = $('request');
            continue;
        }

        //if it is not a valid url, strRender it
        if (!isUrl(url)){
            url = strRender(url);
            if (!isUrl(url)){
                log("Invalid URL", 'error');
                $(request).replaceWith("");
                requests = $('request');
                continue;
            }
        }

        try{
            rbody = $(request).attr('body') ? JSON.parse($(request).attr('body')): "";
        } catch {
            log(`[OUT] [${method}] ${url} failed`, 'error');
            log("Invalid JSON", 'error');
            $(request).replaceWith("");
            requests = $('request');
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
            $(request).replaceWith("");
            requests = $('request');
            continue;
        }

        if (id){
            appendData(id, autoType(response));
        } else {
            appendData("inherit", autoType(response));
        }

        let tagBody = await renderHTML(load($(request).html()), null, false);
        $(request).replaceWith(`<span>${tagBody}</span>`);

        if (!id) {
            removeData("inherit");
        }
        requests = $('request');
    }
    
    //for loop tag
    let fortag = $('for');
    while (fortag.length > 0){
        const tag = fortag.eq(0);
        const id = tag.attr('id');
        const key = tag.attr('key') || "inherit";
        let body = tag.html();

        if (!id){
            log("For tag without id", 'error');
            fortag.replaceWith("<span></span>");
            fortag = $('for');
            continue;
        }

        let val = strRender(id);

        if (!val){
            log(`${id} is not defined`, 'error');
            fortag.replaceWith("<span></span>");
            fortag = $('for');
            continue;
        }

        if (Array.isArray(val)){
            let bodyHTML = "";
            for (const item of val){
                appendData(key, item);
                bodyHTML += await renderHTML(load(body, null, false));
                removeData(key);
            }
            $(tag).replaceWith(`<span>${bodyHTML}</span>`);
        } else {
            log(`${id} is not iterable`, 'error');
            $(tag).replaceWith("<span></span>");
        }
        fortag = $('for');
    }

    //if condition tag
    let iftag = $('if');
    while (iftag.length > 0){
        const cond = iftag.attr('condition');
        const elseBody = iftag.find('else').last().html() || "<span></span>";
        if (cond){
            if (condition(cond)){
                iftag.find('else').last().replaceWith("<span></span>");
                let body = await renderHTML(load(iftag.html(), null, false));
                iftag.replaceWith(`<span>${body}</span>`);
            } else {
                let body = await renderHTML(load(elseBody, null, false));
                iftag.replaceWith(`<span>${body}</span>`);
            }
        } else {
            log("If tag without condition", 'error');
            iftag.replaceWith("<span></span>");
        }
        iftag = $('if');
    }

    const dataTags = $('data');
    dataTags.each((index, tag) => {
        const id = $(tag).attr('id');
        let val = $(tag).attr('val');
        let  _eval= $(tag).attr('eval');
        const type = $(tag).attr('type');
        let keys = $(tag).attr('key') || "";

        keys = keys == "" ? [] : keys.split(" ")

        if (!id){
            log("Data tag without id", 'error');
            return
        } else if (!data[id] && (val || _eval)){
            if (val) val = setType(type, val);
            else val = strRender(_eval);
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
            if (_eval) v = strRender(_eval, v);
            $(tag).replaceWith(typeof v === 'object' ? JSON.stringify(v, null, 2) : v.toString());
        }
    });

    const setAttr = $('attr');
    setAttr.each((index, tag) => {
        const id = $(tag).attr('id');
        const _class = $(tag).attr('class');
        const attr = $(tag).attr('attr');
        const val = $(tag).attr('val');
        const _eval = $(tag).attr('eval');
        const type = $(tag).attr('type');
        const cond = $(tag).attr('condition') || "true";
        let selector, value;
        
        if (id){
            selector = `#${id}`;
        } else if (_class){
            selector = _class.split(" ").join(".");
        } else {
            log(`Either id or class is required for attr tag`, 'error');
            return
        }

        if (val){
            if (type) value = setType(type, val);
            else value = autoType(val);
        } else if (_eval){
            if (type) value = setType(type, strRender(_eval));
            else value = autoType(strRender(_eval));
        }

        if (condition(cond)){
            $(selector).attr(attr, value);
            $(tag).replaceWith("<span></span>");
        } else {
            $(tag).replaceWith("<span></span>");
        }
    }); 
    
    return $.html();
}