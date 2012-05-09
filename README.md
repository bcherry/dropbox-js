# dropbox-js

JavaScript library for accessing the Dropbox API over OAuth.

API version: 1

## How to Use
see `index.html` for example usage.
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
#### login(token, tokenSecret, [uid])
#### getToken()

#### accountInfo([success, error])
#### metadata(path, [success, error])
#### put(path, body, [success, error])
#### get(path, [success, error])
#### getRev(path, rev, [success, error])
#### search(path, query, [success, error])
#### shares(path, [success, error])
#### media(path, [success, error])
#### delta(cursor, [success, error])
#### revisions(path, [success, error])
#### restore(path, rev, [success, error])
#### copyRef(path, [success, error])
#### thumbnails(path, format, size, [success, error])
#### cp(root, fromPath, toPath, [success, error])
#### mv(root, fromPath, toPath, [success, error])
#### mkdir(path, [success, error])
#### rm(path, [success, error])

