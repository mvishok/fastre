import fs from 'fs';
import {log} from './log.js';
import {resolve, dirname} from 'path';

export default function loader(cpath){
    let config = {};
    try {
        config = JSON.parse(fs.readFileSync(cpath));
    } catch (error) {
        log('Failed to load config file', 'error');
        log(error, 'error');
        process.exit(1);
    }

    //remove filename form cpath
    cpath = dirname(cpath);

    if (!config){
        log('Config file is empty', 'error');
        process.exit(1);
    }

    if (!config.port){
        log('Port not defined, setting to 8080', 'warn');
        config.port = 8080;
    } else if (isNaN(config.port)){
        log('Port is not a number', 'error');
        process.exit(1);
    } else if (config.port < 1024 || config.port > 49151){
        log('Port is not within the range 1024-49151', 'error');
        process.exit(1);
    } else {
        config.port = parseInt(config.port);
    }

    if (!config.dir){
        log('Project directory not defined', 'error');
        process.exit(1);
    } else {
        config.dir = resolve(cpath, config.dir);
    }

    if (!fs.existsSync(config.dir)){
        log('Project directory not found', 'error');
        process.exit(1);
    }

    //config.errors will have the path to error files
    if (config.errors){
        const keys = Object.keys(config.errors);
        if (keys.length < 1){
            log('Errors property is defined but empty', 'warn');
        } else {
            for (let i = 0; i < keys.length; i++){
                const key = keys[i];
                const path = resolve(config.dir, config.errors[key]);
                if (!fs.existsSync(path)){
                    log(`Error file ${path} not found`, 'error');
                    process.exit(1);
                } else {
                    config.errors[key] = path;
                }
            }
        }
    }

    //config.env will have the path to env file
    if (config.env){
        const path = resolve(config.dir, config.env);
        if (!fs.existsSync(path)){
            log(`Env file ${path} not found`, 'error');
            process.exit(1);
        } else {
            config.env = path;
        }
    }

    return config;
}