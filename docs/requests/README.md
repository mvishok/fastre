# Request Files
FASTRE request files (with a `.req` extension) are similar to standard HTML files. The key difference is that the response header is set to "application/json", meaning the response will be JSON-parsed. All other functionalities remain the same, including the use of FASTRE tags.

## Usage
To use a request file, simply create a new file with a `.req` extension and write your request as you would in a standard HTML file. For example:

```html
<request to="https://api.example.com/login" method="POST" headers="Authorization: Bearer YOUR_API_KEY" body="username=example&password=example">
    <div>
        <cookie name="session" value="{{response.session}}"></cookie>
        {"success": true, "message": "Login successful"}
    </div>
</request>
```

In this example, the request is sent to `https://api.example.com/login` with the method `POST`. The request includes a header `Authorization : Bearer YOUR_API_KEY` and a body `username=example&password=example`. The response is then parsed as JSON and the value of the `session` key is stored in a cookie named `session`.

After setting the cookie, the response is then displayed as JSON. The response will be displayed as:

```json
{
    "success": true,
    "message": "Login successful"
}
```