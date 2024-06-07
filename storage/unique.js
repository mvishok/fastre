export let data = {};

export function clearData(){
    data = {};    
}

export function appendData(key, value){
    data[key] = value;
}