import chalk from 'chalk';

let l = true;

export function log (msg, type){
    
    switch (type){
        case 'info':
            if (l) console.log(chalk.blue.bold(`[INFO] ${msg}`));
            break;
        case 'warn':
            if (l) console.log(chalk.hex("#f5e042").bold(`[WARN] ${msg}`));
            break;
        case 'error':
            console.log(chalk.hex("#ff0000").bold(`[ERROR] ${msg}`));
            break;
        case 'success':
            if (l) console.log(chalk.hex("#00ff00").bold(`[SUCCESS] ${msg}`));
            break;
        case 'debug':
            if (l) console.log(chalk.hex("#ff00ff").bold(`[DEBUG] ${msg}`));
            break;
        default:
            if (l) console.log(chalk.hex("#04e1c3").bold(`[INFO] ${msg}`));
            break;
    }

    return true;
}

export function disableLogs(){
    l = false;
}