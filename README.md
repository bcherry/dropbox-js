# dropbox-js

JavaScript library for accessing the Dropbox API over OAuth.

API version: 1

### How to Use
#### Step 1
include these library

```
 <script src="jquery-1.4.3.js"></script>
 <script src="oauth.js"></script>
 <script src="sha1.js"></script>
 <script src="dropbox.js"></script>
```
setup your consumer key and consumer secret

```
dropbox.setup(API_KEY, API_SECRET);
```
#### Step 2
OAuth is a three step process.

a) Get a request token

```
dropbox.getRequestToken(callbackFunction);
```
b) User must visit the url to grant authorization to the client

```
dropbox.getAuthorizeUrl(callbackUrl);
```
c) Generate our access token

```
dropbox.getAccessToken(callbackFunction);
```
#### Step 3
Now we can access to the api functionality.

```
dropbox.getAccountInfo(callbackFunction);
```






