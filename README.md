# Climine Runtime

Climine Runtime is a lightweight and straightforward runtime environment for web development designed to streamline the process of building dynamic websites, without the complexity of traditional backend setups or server-side scripting languages. With Climine Runtime, developers can easily convert static HTML/CSS/JS designs into dynamic web applications by integrating API responses directly into their HTML markup.

## Who is it for?
 - **Beginners:** Climine Runtime offers a user-friendly solution for those new to web development, providing a gentle introduction to dynamic web content.

 - **Small Projects:** For quickly prototyping and deploying simple dynamic websites without the need for extensive backend infrastructure.
## Installation

To install Climine Runtime, you have a couple of options:

 - ### Using Pre-built Binaries
 You can download pre-built binaries for your operating system from the [Releases](https://github.com/climine/climine-runtime/releases/latest) page. Once downloaded, extract the archive and add the executable to your system's PATH.
    
 - ### Compiling from Source
 If pre-built binaries are unavailable for your operating system, you can compile Climine Runtime from source. Follow these steps:
 
 1. Clone the repository: 
 ```bash
 git clone https://github.com/climine/climine-runtime.git
 ```
 2. Navigate to the project directory: 
 ```bash
 cd runtime
 ```
 3. Install dependencies: 
 ```bash
 npm install
 ```
 4. Build the project: 
 ```bash
 npm run build
 ```
 5. The compiled binary will be available in the dist directory.
  
  
That's it! You're now ready to use Climine Runtime.

## Usage/Examples

Let's walk through an example of using Climine Runtime to create a simple dynamic website. We'll start by defining our project structure and then showcase the contents of the configuration files, HTML markup, and API request file.


### Project Structure
```bash
my-climine-project/
├── config.json
├── index.html
└── index.json

```

### Configuration (config.json)
```json
{
    "port": 8080,
    "dir": "./",
    "errors": {
        "404": "/error/404/"
    }
}
```

### API Request File (index.json)
```json
{
    "request1": {
        "to": "https://api.example.com/data&q={{query}}",
        "method": "GET",
        "headers": {
            "Content-Type": "application/json"
        },
        "require": {
            "query": null
        }
    }
}
```

### HTML Markup (index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Climine Project</title>
</head>
<body>
  <h1>Welcome to Climine Runtime!</h1>
  <p>This is a dynamic website powered by Climine.</p>
  <p>Here's some dynamic content:</p>
  <p>{{ request1.responseKey }}</p>
</body>
</html>
```

In this example, `config.json` defines the configuration for the Climine Runtime. `index.html` contains the HTML markup, while `index.json` defines an API request that fetches dynamic data to be inserted into that HTML markup
## Features

- **API Requests:** Define and execute API requests directly within HTML files using simple configuration syntax.

 - **HTTP Method Support:** Handle GET and POST variables when users visit Climine projects, allowing for dynamic interaction with client-side content.

 - **Custom Error Pages:** Configure error pages for graceful error responses

 - **Dynamic Content Rendering:** Automatically render dynamic content fetched from API responses directly into HTML markup.

 - **Minimal Configuration:** Requires minimal setup and configuration for rapid development of dynamic websites.
## Support

For support or inquiries, please use the [Issues](https://github.com/climine/climine-runtime/issues) section on this GitHub Repo. We'll do our best to assist you promptly!
## License

Climine Runtime is licensed under the [MIT](https://github.com/climine/climine-runtime/blob/main/LICENSE) License. See LICENSE for more information.

