# dropbox-js

JavaScript library for accessing the Dropbox API over OAuth.

API version: 1

## How to Use
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
dropbox.requestToken();
```
b) User must visit the url to grant authorization to the client

```javascript
dropbox.authorizeUrl();
```
c) Generate our access token

```javascript
dropbox.accessToken();
```
#### Step 3
Now we can access to the api functionality.

```javascript
dropbox.accountInfo(callbackFunction);
```

## Methods
more detail in [https://www.dropbox.com/developers/reference/api](https://www.dropbox.com/developers/reference/api)
#### setup(apiKey, apiSecret, [accessType, locale])
accessType can be "dropbox" or "sandbox"

#### accountInfo([callback, errorCallback])
#### metadata(path, [callback, errorCallback])
#### metadata(path, [callback, errorCallback])
#### put(path, body, [callback, errorCallback])
#### get(path, [callback, errorCallback])
#### search(path, query, [callback, errorCallback])
#### shares(path, [callback, errorCallback])
#### media(path, [callback, errorCallback])
#### delta(cursor, [callback, errorCallback])
#### revisions(path, [callback, errorCallback])
#### restore(path, rev, [callback, errorCallback])
#### copyRef(path, [callback, errorCallback])
#### thumbnails(path, format, size, [callback, errorCallback])
#### cp(root, fromPath, toPath, [callback, errorCallback])
#### mv(root, fromPath, toPath, [callback, errorCallback])
#### mkdir(path, [callback, errorCallback])
#### rm(path, [callback, errorCallback])

