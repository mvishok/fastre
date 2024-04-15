import boxen from 'boxen';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
const v = '0.1.0';
console.log(
    boxen(chalk.hex("#04e1c3").bold(`Climine Runtime ${v}`), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
    })
);

performance.mark('start');

console.log('Starting Climine...');

import http from 'http';
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import { serve } from './template.js';
import { update } from './modules.js';
import request from 'then-request';

const args = minimist(process.argv.slice(2));

update(v, request);

function configLoader(configPath) {
    let config = {};

    try {
        config = JSON.parse(fs.readFileSync(configPath));
    } catch (err) {
        console.log(chalk.yellow(`Error occurred while parsing config file ${configPath}`));
        console.error(err);
        process.exit(1);
    }

    if (!config.dir) {
        console.log(chalk.yellow(`No directory specified in config file. Using ${process.cwd()} (current working directory)`));
        config.dir = process.cwd();
    } else {
        config.dir = path.resolve(path.dirname(configPath), config.dir);
    }

    if (config.errors) {
        for (const key of Object.keys(config.errors)) {
            const errorPath = path.resolve(config.dir + config.errors[key]);
            const html = fs.existsSync(`${errorPath}.html`) ? `${errorPath}.html` : false;
            const json = fs.existsSync(`${errorPath}.json`) ? `${errorPath}.json` : false;
            const indexHtml = fs.existsSync(path.join(errorPath, 'index.html')) ? path.join(errorPath, 'index.html') : false;
            const indexJson = fs.existsSync(path.join(errorPath, 'index.json')) ? path.join(errorPath, 'index.json') : false;

            if (html || json) {
                config.errors[key] = [errorPath, html, json];
            } else if (indexHtml || indexJson) {
                config.errors[key] = [errorPath, indexHtml, indexJson];
            } else {
                console.log(chalk.yellow(`No ${key}.json or ${key}.html found in ${errorPath}. Removing ${key} from errors object`));
                delete config.errors[key];
            }
        }
    }

    return config;
}

const config = args.config ? 
    (() => {
        //if args .config is relative path, resolve it to absolute path using process.cwd()
        const configPath = path.isAbsolute(args.config) ? path.resolve(args.config) : path.resolve(process.cwd(), args.config);
        console.log(configPath)
        console.log(chalk.blue(`Using config file ${configPath}`));
        return configLoader(configPath);
    })() :
    (() => {
        console.log(chalk.blue('No config file specified. Using default configuration \\default\\config.json'));
        return configLoader("./default/config.json");

    })();

    //if config.env is set, load environment variables from the specified file
let memory = {};

if (config.env) {
    try {
        const envPath = path.isAbsolute(config.env) ? path.resolve(config.env) : path.resolve(config.dir, config.env);
        console.log(chalk.blue(`Using environment ${envPath}`));
        memory = JSON.parse(fs.readFileSync(envPath));
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(chalk.red(`Environment ${config.env} does not exist.`));
        } else if (err instanceof SyntaxError) {
            console.error(chalk.red(`Error occurred while parsing environment ${config.env}.`));
        } else {
            console.error(chalk.red(`Unknown error occurred while parsing environment ${config.env}.`));
        }
    }
}

const server = http.createServer(async (req, res) => {
    await serve(req, res, config, memory);
}
);

server.listen(config.port, () => {
    performance.mark('end');
    performance.measure('start to end', 'start', 'end');
    const started = performance.getEntriesByName('start to end')[0].duration.toFixed(2);
    console.log(chalk.green(`Climine has started successfully in ${started} ms`));

    console.log(chalk.white(`Climine Runtime Environment is running on http://localhost:${config.port} serving files from ${config.dir}`));
});
