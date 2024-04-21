#!/usr/bin/env node
import boxen from 'boxen';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
const v = '0.1.1';
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
import { execSync } from 'child_process';

const args = minimist(process.argv.slice(2));

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

let __dirname;

try {
    // Try ES Modules method
    __dirname = dirname(fileURLToPath(new URL(import.meta.url)));
} catch (error) {
    // If it fails, use CommonJS method
    __dirname = existsSync(__filename) ? dirname(__filename) : process.cwd();
    //if it starts with C:\snapshot\, use process.argv[0] as __dirname
    if (__dirname.startsWith('C:\\snapshot\\')) {
        __dirname = path.dirname(process.argv[0]);
    }
}

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

// --config flag
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
        return configLoader(__dirname + '/default/config.json');

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

// --compile flag
if (args.compile) {

    try {
        execSync('npm -v');
    } catch (err) {
        console.error(chalk.red('npm is not installed. Please install npm to use the --compile flag'));
        process.exit(1);
    }

    const dist = path.join(config.dir, 'dist');
    const defaultDir = path.join(dist, 'default');

    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
    }

    if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir);
    }

    fs.readdirSync(config.dir).forEach(file => {
        if (file !== 'dist') {
            fs.copyFileSync(path.join(config.dir, file), path.join(defaultDir, file));
        }
    });

    //create package.json with project name and version
    const packageJson = {
        "name": config.name || "climine",
        "version": config.version || "1.0.0",
        "description": config.description || "Climine Runtime project",
        "main": "climine.cjs",
        "scripts": {
            "start": "node climine.cjs"
            },
        "dependencies": {
            "boxen": "^7.1.1",
            "chalk": "^4.1.2",
            "expr-eval": "^2.0.2",
            "minimist": "^1.2.8",
            "then-request": "^6.0.2"
        },
        "devDependencies": {
            "esbuild": "0.20.2"
        }
    }
    
    try {
        fs.writeFileSync(path.join(dist, 'package.json'), JSON.stringify(packageJson, null, 2));
    } catch (err) {
        console.error(chalk.red(`Error occurred while creating package.json`));
        console.error(err);
        process.exit(1);
    }

    try {
        execSync(`npx esbuild ./ --bundle --platform=node --outfile=${dist}/index.cjs`);
    } catch (err) {
        console.error(chalk.red(`Error occurred while compiling Climine Runtime project`));
        console.error(err);
        process.exit(1);
    }

    console.log(chalk.green(`Built Climine Runtime project to ${dist}`));
    process.exit(0);
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
