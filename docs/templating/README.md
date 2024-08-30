# Introduction
Templating allows developers to create dynamic web pages by injecting dynamic content into static HTML files. This dynamic content can include data retrieved from confidential API requests, environment variables, or other sources, enabling personalized and interactive user experiences.

FASTRE uses a simple and intuitive templating engine, with HTML-like syntax that allows developers to embed dynamic content directly into their HTML files. This makes it easy to create dynamic web pages without the need for complex JavaScript code or server-side rendering.

>[!NOTE]
>Tags outside of a block is not accessible inside a block, and vice versa. Use `condition` attribute if you want to set value of existing tags inside an in condition.

# Parameters

By default, FASTRE loads the request parameters (i.e., GET and POST parameters) and makes them available as variables within the template. These parameters can be accessed directly by their names in the template code, just like regular variables.

# `data` tag

The `data` tag is used to inject dynamic content into HTML files. It allows you to reference variables, environment variables, data retrieved from API requests or expressions directly within your HTML code.

### Attributes of the `<data>` Tag

The `data` tag in FASTRE supports the following attributes:

- `id` (required)\
The `id` attribute specifies the unique identifier of the data to inject into the HTML file. This identifier is used to reference the data in other parts of the template or to retrieve data from API requests.

- `key` (optional)\
The `key` attribute specifies the key or property of the data to inject into the HTML file. This attribute is used to access nested properties or values within the data object.

- `val` (optional)\
The `val` attribute specifies a literal value to be assigned to the identifier. This attribute is used to assign static values directly within the HTML code.

- `type` (optional)\
The `type` attribute specifies the type of the value in `val` attribute. This attribute is used to assign static values directly within the HTML code.

- `eval` (optional)\
The `eval` attribute specifies an expression to evaluate and assign to the identifier. This attribute is used to perform calculations, transformations, or other operations on the data before assigning it to the identifier.

### Usage

1. Binding a variable to an HTML element:

```html
<h1>Hello, <data id="name"></data>!</h1>
```

2. Assigning a literal value to an identifier:

```html
<data id="x" val="5" type="number" />
<p>The value of x is: <data id="x"></data></p>
```

3. Evaluating an expression and assigning it to an identifier:

```html
<data id="y" eval="x * 2" />
<p>The value of y is: <data id="y"></data></p>
```

# `attr` tag
The `attr` tag is used to set attributes on HTML elements dynamically. It allows you to bind variables, environment variables, data retrieved from API requests or expressions to the attributes of HTML elements.

### Attributes of the `attr` Tag

- `id` (optional)\
The `id` attribute specifies the unique identifier of the target element to set the attribute on. Either `id` or `class` attribute is required.

- `class` (optional)\
The `class` attribute specifies the class name of the target elements to set the attribute on. Multiple classes can be specified by separating them with spaces. Either `id` or `class` attribute is required.

- `attr` (required)\
The `attr` attribute specifies the name of the attribute to set on the target elements. This attribute is required and determines the attribute to create or update.

- `val` (optional)\
The `val` attribute specifies the literal value to assign to the attribute. This attribute is used to set static values directly within the HTML code.

- `type` (optional)\
The `type` attribute specifies the type of the value in the `val` attribute. This attribute is used to assign static values directly within the HTML code.

- `eval` (optional)\
The `eval` attribute specifies an expression to evaluate and assign to the attribute. This attribute is used to perform calculations, transformations, or other operations on the data before assigning it to the attribute.

- `condition` (optional)\
The `condition` attribute specifies the condition for assigning the attribute. The condition must be true to set the attribute.

> [!NOTE]
> The requirement of either `id` or `class` attribute is mutually exclusive. You can only specify one of them, not both. One of them is required to target the HTML elements.

### Usage

1. Setting a static attribute value:

```html
<attr class="btn" attr="disabled" val="true" />
```

2. Setting an attribute value based on an expression:

```html
<attr id="myElement" attr="style" eval="result[0]['color']" />
```

> [!WARNING]
> Always use `condition` attribute instead of placing `attr` tag inside `if` tag (or any block). This is because `attr` tag looks for the target element in the current scope, so placing it inside `if` tag might not work as expected.

# `request` tag

### API Requests

In web development, API requests play a vital role in fetching data from external sources or interacting with backend services. These requests are made to specific endpoints on servers, allowing clients to retrieve information, submit data, or perform other actions.

API (Application Programming Interface) requests are HTTP requests sent from a client (such as a web browser or a mobile app) to a server, typically to retrieve or manipulate data. These requests follow the HTTP protocol and can use different HTTP methods, such as GET, POST, PUT, DELETE, etc., depending on the desired action.

### Making API Requests

In FASTRE, you can make API requests using the `request` tag, which allows you to fetch data from external sources and embed it directly into your HTML files. This tag supports various HTTP methods, including GET, POST, PUT, DELETE, and others, enabling you to interact with APIs and retrieve dynamic content for your web pages.

### Attributes of the `request` Tag

The `request` tag in FASTRE supports the following attributes:

- `to` (required)\
The `to` attribute specifies the URL of the API endpoint to send the request to. This can be a relative or absolute URL, depending on the location of the API server.

- `method` (optional)\
The `method` attribute specifies the HTTP method to use for the request, such as GET, POST, PUT, DELETE, etc. This attribute is required and determines the type of action to perform on the server.
By default, the method is set to GET.

- `headers` (optional)\
The `headers` attribute allows you to specify custom headers to include in the request. This can be useful for passing authentication tokens, API keys, or other information required by the server.

- `body` (optional)\
The `body` attribute allows you to include a request body with the API request. This is typically used for POST or PUT requests to send data to the server. It can contain JSON, form data, or other types of payloads.

- `id` (optional)\
The `id` attribute allows you to assign a unique identifier to the response of the request tag. This can be useful for referencing the response data in other parts of the template or for handling multiple requests in a single page.

> [!NOTE]
> If the `id` attribute is not provided, the response data will only be available within the scope of the `request` tag as the `inherit` variable.

### Example Usage

Here's an example of using the `request` tag in FASTRE to fetch data from an external API:

```html
<request to="https://api.example.com/data" method="GET" headers="Authorization: Bearer YOUR_API_KEY">
    <div>
        <h1>Data from API:</h1>
        <p><data id="inherit" key="message"></data></p>
    </div>
</request>
```

# `if` tag

The `if` tag is used to conditionally render content based on the value of an expression. It allows you to control the visibility of HTML elements, sections, or blocks based on specific conditions, enabling dynamic content rendering in your web pages.

### Syntax

The syntax of the `if` tag follows a simple `if-else` structure, with an optional `else` block to render content when the condition is false.

```html
<if condition="expression">
    <!-- Content to render if the condition is true -->
    <else>
        <!-- Content to render if the condition is false -->
    </else>
</if>
```

### Attributes of the `if` Tag

The `if` tag in FASTRE supports the following attributes:

- `condition` (required)\
The `condition` attribute specifies the expression to evaluate to determine whether to render the content inside the `if` block. This attribute is required and must be a valid JavaScript expression that returns a boolean value.

### Example Usage

Here's an example of using the `if` tag in FASTRE to conditionally render content based on the value of a variable:

```html
<if condition="isLoggedIn">
    <p>Welcome, <data id="username"></data>!</p>
    <button>Logout</button>
    <else>
        <p>Please log in to continue.</p>
        <button>Login</button>
    </else>
</if>
```

# `for` tag

The `for` tag is used to iterate over a collection of items and render content for each item in the collection. It allows you to create dynamic lists, tables, or other repeating elements based on the data retrieved from API requests, environment variables, or other sources.

### Syntax

The syntax of the `for` tag follows a simple `for-in` loop structure.
    
```html
<for id="results" key="item">
    <!-- Content to render for each item -->
    <data id="item"></data>
</for>
```

### Attributes of the `for` Tag

The `for` tag in FASTRE supports the following attributes:

- `id` (required)\
The `id` attribute specifies the unique identifier of the collection to iterate over. This identifier is used to reference the collection in other parts of the template or to retrieve data from API requests.

- `key` (optional)\
The `key` attribute specifies the variable name to represent each item in the collection. This attribute is used to access the properties or values of each item within the loop. If not provided, the default key is `inherit`.

### Example Usage

Here's an example of using the `for` tag in FASTRE to iterate over a list of items and render content for each item:

```html
<for id="results" key="item">
    <div>
        <h2><data id="item[title]"></data></h2>
        <p><data id="item[description]"></data></p>
        <if condition="item[price]>100">
            <p>Price is greater than 100</p>
            <else>
                <p>Price is less than or equal to 100</p>
            </else>
        </if>
    </div>
</for>
```

# `cookie` tag

<!-- cookie tag sets cookies. cookie is loaded by default into memory on request -->

The `cookie` tag is used to set cookies in the response headers. It allows you to store data on the client-side, enabling persistent user sessions, personalized content, and other features that require client-side storage.

Cookies are, by default, loaded into memory on request. This means that you can access cookies directly in your template code without the need for additional configuration or setup, just like regular variables.

### Syntax

The syntax of the `cookie` tag is straightforward, with attributes to specify the name, value, and other properties of the cookie.


```html
<cookie key="name" val="value" path="/" domain="example.com" secure="true" expires="2022-12-31T23:59:59Z" />
```

### Attributes of the `cookie` Tag

The `cookie` tag in FASTRE supports the following attributes:

- `key` (required)\
The `key` attribute specifies the name of the cookie to set. This attribute is required and determines the identifier of the cookie.

- `val` (optional)\
The `val` attribute specifies the value of the cookie to set. This attribute is required and determines the content of the cookie.

- `eval` (optional)\
The `eval` attribute specifies an expression to evaluate and assign to the cookie value. This attribute is used to perform calculations, transformations, or other operations on the data before assigning it to the cookie.

- `path` (optional)\
The `path` attribute specifies the path on the server where the cookie is valid. This attribute is used to restrict the cookie to specific URLs on the server.

- `domain` (optional)\
The `domain` attribute specifies the domain where the cookie is valid. This attribute is used to restrict the cookie to specific domains.

- `secure` (optional)\
The `secure` attribute specifies whether the cookie should only be sent over secure connections (HTTPS). This attribute is used to enhance the security of the cookie data.

- `expires` (optional)\
The `expires` attribute specifies the expiration date and time of the cookie. This attribute is used to determine when the cookie should expire and no longer be valid.

### Example Usage

```html
<cookie key="name" val="value" path="/" domain="example.com" secure="true" expires="2022-12-31T23:59:59Z" />
```

> [!NOTE]
> Either `val` or `eval` attribute is required. If both are provided, `eval` attribute will be used.
