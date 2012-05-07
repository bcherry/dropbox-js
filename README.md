# dropbox-js

JavaScript library for accessing the Dropbox API over OAuth.

API version: 1

## How to Use
See `index.html` for example.
#### Step 1
include these library

```html
 <script src="jquery-1.7.2.min.js"></script>
 <script src="oauth.js"></script>
 <script src="sha1.js"></script>
 <script src="dropbox.js"></script>
```
setup your consumer key and consumer secret

```javascript
dropbox.setup(API_KEY, API_SECRET);
```
#### Step 2
OAuth is a three step process.

a) Get a request token

```javascript
dropbox.requestToken(callbackFunction);
```
b) User must visit the url to grant authorization to the client

```javascript
dropbox.authorizeUrl(callbackUrl);
```
c) Generate our access token

```javascript
dropbox.accessToken(callbackFunction);
```
#### Step 3
Now we can access to the api functionality.

```javascript
dropbox.accountInfo(callbackFunction);
```

## Client Methods
### accountInfo([callback])
### metadata([callback])






