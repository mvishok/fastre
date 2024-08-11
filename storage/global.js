export let config = {};
export let packages = {};

export function clearConfig(){
    config = {};
}

export function appendConfig(key, value){
    config[key] = value;
}

export function addPackage(name, version){
    packages[name] = version;
}