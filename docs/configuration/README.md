# Configuration

The configuration file is a JSON file that contains the configuration for a FASTRE application. The configuration file is mandatory. The configuration file's path can be specified using the --config option when running the application. The configuration file should be a JSON object.

The following is an example of a configuration file:

```json
{
    "port": 3000,
    "dir": "./",
    "env": ".env",
    "errors": {
        "404": "/error/404",
        "500": "/error/500"
    }
}
```

# port 

The `port` property allows you to specify the port that the FASTRE application will listen on. The default port is 8080.

> [!TIP]
> Think of a port as a virtual gateway through which data flows in and out of your computer or server. Just like a physical port on a ship or an airport terminal, a network port acts as a designated point of entry or exit for communication between devices over a network, such as the internet.
> Imagine your computer or server as a busy office building with multiple departments, each handling different tasks. Ports serve as the doors or entrances to these departments, allowing data packets to enter and exit specific areas of the building based on their intended destination.

### Customizing the Port

In the configuration file, you can specify a custom port number for your FASTRE application. For example, if you want your application to listen on port 3000, you can set the port property as follows:

```json
{
    "port": 3000
}
```

With this configuration, your Climine Runtime application will listen on port 3000 instead of the default port 8080. This can be useful if you have other services running on port 8080 or if you prefer a different port for your application.

> [!NOTE|label:Port Conflicts]
> When specifying a custom port, make sure it is not already in use by another application on your system. Otherwise, you may encounter port conflicts that prevent your Climine Runtime application from starting.

# dir

The `dir` property allows you to specify the directory where the FASTRE will look for files to serve. This property is mandatory.

### Customizing the Directory

In the configuration file, you can specify a custom directory for your FASTRE application. For example, if you want your application to serve files from a directory named public, you can set the dir property as follows:

```json
{
    "dir": "public"
}
```

# env

The `env` property allows you to specify the location of an environment variable file relative to the root directory of your FASTRE application, specified by the dir property.

> [!TIP]
> Environment variables are dynamic values that can affect the behavior of software applications. They are used to store configuration settings, sensitive information, and other parameters that may vary between different environments. Environment variables provide a flexible way to manage configuration values without hardcoding them into the application code.

By default, FASTRE loads environment variables from the system environment. However, you can specify an env property in the configuration file to load environment variables from a file named .env located in a specific directory.

Example:
```json
{
    "env": ".env"
}
```

The file should contain key-value pairs in the format KEY=VALUE, with each pair on a separate line.

.env
```
API_KEY=your-api-key
secret=your-secret
```

# errors

The `errors` property in the configuration file is an object that contains a mapping of error codes to error pages. When an error occurs, FASTRE will render the specified error page based on the error code. The error pages should be relative paths to the root directory of the application.

Example:
```json
{
    "errors": {
        "404": "/error/404.html",
        "500": "/error/500.html"
    }
}
```