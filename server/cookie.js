import { appendData, clearCookies, cookie } from "../storage/unique.js";

export default function getCookies(req){
    if (!req.headers.cookie){
        return {};
    }

    const cookies = req.headers.cookie.split(';');
    for (const cookie of cookies){
        const [key, value] = cookie.split('=');
        appendData(key, value);
    }
    
    return true
}

export function setCookies(res){
    if (cookie.length > 0){
        res.setHeader('Set-Cookie', cookie);
    }
    clearCookies();
    return res;
}