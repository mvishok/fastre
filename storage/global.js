export let config = {};

export function clearConfig(){
    config = {};
}

export function appendConfig(key, value){
    config[key] = value;
}