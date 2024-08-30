<!-- 
feat: Add support for adding packages
-->

# Packages
Packages in FASTRE is similar to libraries in other programming languages. They are a collection of reusable components that can be imported into your project. Packages can be used to extend the functionality of FASTRE, such as adding new tags or modifying the behavior of existing tags.

## Package Manager
The recommended way to manage packages in FASTRE is to use the FADE package manager. FADE is a development environment that includes Fastre and Autobase. It allows you to easily install, update, and remove packages from your project.

Check out [FADE](https://fade.vishok.me/") for more information on how to use the package manager.

## Adding Packages Manually

### Structure
To add or create a package manually, you can create a new directory or file in the `packages/default` directory of your FASTRE Installation. The package should contain the necessary files and configurations to extend the functionality of FASTRE. 

### Adding a Package
After creating the package, you have to add it to the `packages.json` file in the `packages` directory. The `packages.json` file contains a list of all the packages installed in your FASTRE project. You can add the package by specifying the tag name and the entry point file of the package.

### Entry Point
The entry point file of the package is the main file that is loaded when the package is imported. It must export a default function named `main` that takes a `tag` object (A cheerio tag object) as an argument. This function is called when any of your code uses the tag defined in the package.

### Example
Here is an example of a simple package that adds a custom tag to FASTRE:

```javascript
// packages/default/custom-tag/index.js
export default function main(tag) {
    tag.addTag('custom-tag', (el, options) => {
        return `<div>${options.text}</div>`;
    });
}
```

```json
// packages/packages.json
{
    "custom-tag@1.0.0": "custom-tag/index.js"
}
```

In this example, the package adds a custom tag `custom-tag` that takes a `text` attribute and returns a `div` element with the text. The package is added to the `packages.json` file with the tag name and entry point file.

#### Usage
```html
<custom-tag text="Hello, World!"></custom-tag>
```

This will render as:
```html
<div>Hello, World!</div>
```

