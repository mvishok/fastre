import { request } from 'http';
import chalk from 'chalk';

export const makeRequest = (options) => {
    return new Promise((resolve, reject) => {
        const apiReq = request(options, apiRes => {
            let data = '';
            if (apiRes.statusCode < 200 || apiRes.statusCode > 299) {
                //non 2xx status code
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
    let contentType = 'text/plain';
    switch (fileExtension) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;

        default:
            break;
    }
    return contentType;
}

export const errorCodeToMessage = (errorCode) => {
    let message = '';
    switch (errorCode) {
        case 400:
            message = 'Bad Request';
            break;
        case 401:
            message = 'Unauthorized';
            break;
        case 403:
            message = 'Forbidden';
            break;
        case 404:
            message = 'Not Found';
            break;
        case 405:
            message = 'Method Not Allowed';
            break;
        case 408:
            message = 'Request Timeout';
            break;
        case 429:
            message = 'Too Many Requests';
            break;
        case 500:
            message = 'Internal Server Error';
            break;
        default:
            break;
    }
    return message;
}