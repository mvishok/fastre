import { request } from 'http';
import chalk from 'chalk';

export async function update(v, request){
    try {
        const latest = JSON.parse((await request('GET', 'https://api.github.com/repos/climine/runtime/releases/latest', {
            headers: {
                'User-Agent': 'climine'
            }
        })).getBody());
        if (v.localeCompare(latest.tag_name, undefined, { numeric: true, sensitivity: 'base' }) === -1) {
            console.log(chalk.yellow(`Climine ${latest.tag_name} is available! Please consider upgrading.`));
        }
    } catch (err) {
        console.error(chalk.red('NOTE: Error occurred while checking for updates.'));
    }
}
    
export const makeRequest = (options) => {
    return new Promise((resolve, reject) => {
        const apiReq = request(options, apiRes => {
            let data = '';
            if (apiRes.statusCode < 200 || apiRes.statusCode > 299) {
                console.log(chalk.yellow(`${apiRes.statusCode} response from ${options.hostname} (${options.path})`));
            }
            apiRes.on('data', chunk => {
                data += chunk;
            });
            apiRes.on('end', () => {
                if (data === '') {
                    //empty response
                    console.log(chalk.yellow(`Empty response from ${options.hostname} (${options.path})`));
                    resolve({});
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (err) {
                        console.log(chalk.red(`Error parsing JSON response from ${options.hostname} (${options.path}):\n`), err.message);
                        reject(err);
                    }
                }
            });
        });
        apiReq.on('error', err => {
            console.log(chalk.red(`Error making request to ${options.hostname} (${options.path}):\n`), err);
            reject(err);
        });
        apiReq.end();
    });
};

export const ftype = (fileExtension) => {
    const contentTypeMap = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    };

    return contentTypeMap[fileExtension] || 'text/plain';
}

export const errorCodeToMessage = (errorCode) => {
    const errorMessages = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        408: 'Request Timeout',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
    };

    return errorMessages[errorCode] || 'Internal Server Error';
}