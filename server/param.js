import { log } from "../modules/log.js";
import { data } from "../storage/unique.js";

function get(url){
    let params = url.split('?')[1];
    if (!params) return {};
    params = params.split('&');
    params.forEach(param => {
        let [key, value] = param.split('=');
        data[key] = value;
    });
    return true;
}

function post(req){
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
                return true;
            } catch (err) {
                log('Invalid JSON', 'error');
            }
        }
    });
}

export default function getParams(req){
    const method = req.method;
    const url = req.url;
    const params = method === 'GET' ? get(url) : post(req);
    return params;
}