# dropbox-js

JavaScript library for accessing the Dropbox API over OAuth.

API version: 1.1

## How to Use
see `\example` for example usage.

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

