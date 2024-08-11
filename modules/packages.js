import { addPackage } from "../storage/global.js";
import { resolve } from 'path';
import { existsSync, readFileSync } from "fs";
import { log } from "./log.js";

export function loadPackages() {
    log('Loading packages...', 'info');

    const packagesJson = resolve(`${import.meta.dirname}/../packages/packages.json`);
    const packagesPath = resolve(`${import.meta.dirname}/../packages`);
    if (!existsSync(packagesJson)) {
        log('Packages not found', 'error');
        return;
    }

    //load packages.json into packages object dynamically
    let packages = {};
    try {
        packages = JSON.parse(readFileSync(packagesJson, 'utf-8'));
    } catch (e) {
        log('Error loading packages.json', 'error');
        return;
    }

    //syntax: {"packagename@version": "path"}
    //check if path exists and append to global packages
    for (const key in packages) {
        if (!key.includes('@')) {
            log(`Invalid package name ${key}`, 'warn');
            continue;
        }
        if (!packages[key].endsWith('.js')) {
            log(`Invalid package path ${packages[key]}`, 'warn');
            continue;
        }

        const packagePath = resolve(`${packagesPath}/${packages[key]}`);

        if (existsSync(packagePath)) {
            addPackage(key.split('@')[0], packagePath);
        } else {
            log(`Package path ${packages[key]} not found`, 'warn');
        }
    }

    log('Loaded '+Object.keys(packages).length+' packages', 'info');
}