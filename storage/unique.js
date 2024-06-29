export let data = {};
export let cookie = [];

export function clearData(){
    data = {};    
}

export function appendData(key, value){
    data[key] = value;
}

export function removeData(key){
    delete data[key]
}

export function appendCookie(str){
    cookie.push(str);
}

export function clearCookies(){
    cookie = [];
}