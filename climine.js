#!/usr/bin/env node
import boxen from 'boxen';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
const v = '0.1.4';
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
import readline from 'readline-sync';

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

// --init flag
//create a new Climine project in args.init directory
if (args.init && typeof args.init === 'string') {
    const initDir = args.init ? path.resolve(args.init) : process.cwd();
    
    if (!fs.existsSync(initDir)) {
        fs.mkdirSync(initDir);
    }

    //ask for project name, version, description, dir, port
    const name = readline.question('Project name: ');
    const version = readline.question('Version: ');
    const description = readline.question('Description: ');
    const dir = readline.question('Directory: ');
    const port = readline.question('Port: ');

    const config = { name, version, description, dir, port };
    
    let projectDir;
    if (config.dir !== '.' && config.dir !== './') {
        projectDir = path.join(initDir, config.dir);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir);
        }
    } else {
        projectDir = initDir;
    }
    const configPath = path.join(initDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>@font-face{font-family:mono;src:url(mono.ttf)}::-webkit-scrollbar{width:2px}body{background-color:#000;font-family:mono}*{margin:0;padding:0;list-style:none;text-decoration:none;color:#fff}.logo{order:1;font-size:2rem;font-weight:800}nav{display:flex;justify-content:space-between;align-items:center;height:64px;margin-left:50px;margin-right:50px}nav ul{display:flex;order:2}nav ul a{color:#000;font-size:1.6rem;margin-left:2rem}.container{height:600px;padding:20px;margin-left:40px;margin-right:40px;display:flex;flex-direction:row-reverse;justify-content:space-between;align-items:center;gap:40px}.container img{width:100%;height:280px;border:2px solid #00eecf;border-radius:5px}.hero-text{width:80%}.hero-text h1{font-size:3.3rem;margin-bottom:12px;color:#00eecf;font-family:mono}.hero-text p{font-size:1.4rem;margin-bottom:12px}button{padding:1em 2.1em 1.1em;border-radius:4px;margin:8px;border:none;background-color:#00eecf;color:#000;font-weight:800;font-size:.85em;text-transform:uppercase;text-align:center;box-shadow:0 -.2rem 0 #00eecf inset}button:hover{cursor:pointer}.download:hover{background-color:#fff;box-shadow:0 -.2rem 0 #fff inset}.docs:hover{background-color:#6dbd4b;box-shadow:0 -.2rem 0 #6dbd4b inset}.github:hover{background-color:#24292e;box-shadow:0 -.2rem 0 #24292e inset;color:#fff!important}@media (max-width:884px){.container{margin-top:10px;flex-direction:column}.hero-text{width:100%;text-align:center}.hero-text h1{font-size:3rem}}@media (max-width:678px){.hero-text h1{font-size:2rem}}@media (max-width:428px){nav ul{display:none}}</style></head><body><main><div class="container"><img src="../climine.png" alt="Climine Runtime"><div class="hero-text"><center><h1>${name} v${version}</h1><p>${description}</p><p style="color:green">Project ${name} created successfully!</p></center></div></div></main></body></html>`
    fs.writeFileSync(path.join(projectDir, 'index.html'), html);

    //copy climine.png to projectDir
    fs.copyFileSync(path.resolve(__dirname, 'default/climine.png'), path.join(projectDir, 'climine.png'));

    //copy mono.ttf to projectDir
    fs.copyFileSync(path.resolve(__dirname, 'default/mono.ttf'), path.join(projectDir, 'mono.ttf'));

    console.log(chalk.green(`Created Climine project in ${initDir}`));

    process.exit(0);
} else if (args.init) {
    console.error(chalk.red('Invalid directory specified for --init flag'));
    process.exit(1);
}


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
let configPath;
const config = args.config ? 
    (() => {
        //if args .config is relative path, resolve it to absolute path using process.cwd()
        configPath = path.isAbsolute(args.config) ? path.resolve(args.config) : path.resolve(process.cwd(), args.config);
        console.log(configPath)
        console.log(chalk.blue(`Using config file ${configPath}`));
        return configLoader(configPath);
    })() :
    (() => {
        console.log(chalk.blue('No config file specified. Using default configuration \\default\\config.json'));
        return configLoader(path.resolve(__dirname, 'default/config.json'));
    })();

// --port flag
if (args.port) {
    if (isNaN(args.port)) {
        console.log(chalk.red('Port must be a number'));
        process.exit(1);
    }
    config.port = args.port;
    console.log(chalk.blue(`Using port ${config.port}`));
}

// --compile flag
if (args.compile) {

    try {
        execSync('npm -v');
    } catch (err) {
        console.error(chalk.red('npm is not installed. Please install npm to use the --compile flag'));
        process.exit(1);
    }

    const dist = path.join(path.dirname(configPath), 'dist');
    const defaultDir = path.join(dist, 'default');

    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
    }

    if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir);
    }

    fs.readdirSync(config.dir).forEach(file => {
        if (file !== 'dist') {
            if (file === 'node_modules' || file==='package.json' || file === 'package-lock.json' || file === 'dist' || file === 'default' || file === 'config.json') {
                return;
            }
            fs.cpSync(path.join(config.dir, file), path.join(defaultDir, file), {recursive: true});
        }
    });

    config.dir = './';
    fs.writeFileSync(path.join(dist, '/default/config.json'), JSON.stringify(config, null, 2));

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
        execSync(`npx esbuild ${__dirname} --bundle --platform=node --outfile=${dist}/index.cjs`);
    } catch (err) {
        console.error(chalk.red(`Error occurred while compiling Climine Runtime project`));
        console.error(err);
        process.exit(1);
    }

    console.log(chalk.green(`Built Climine Runtime project to ${dist}`));
    process.exit(0);
}

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

//include environment variables from current environment
memory = { ...process.env, ...memory };

const server = http.createServer(async (req, res) => {
    await serve(req, res, config, memory);
});

if (!config.port) {
    config.port = 8080;
    console.log(chalk.yellow('No port specified in config file. Using default port 8080'));
}

if (config.port < 1024 || config.port > 49151) {
    console.log(chalk.red('Port must be between 1024 and 49151'));
    process.exit(1);
}

server.listen(config.port, () => {
    performance.mark('end');
    performance.measure('start to end', 'start', 'end');
    const started = performance.getEntriesByName('start to end')[0].duration.toFixed(2);
    console.log(chalk.green(`Climine has started successfully in ${started} ms`));

    console.log(chalk.white(`Climine Runtime Environment is running on http://localhost:${config.port} serving files from ${config.dir}`));
});
