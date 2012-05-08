function parseQueryString(qs) {
    var vars = qs.split("&");
    var obj = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        obj[pair[0]] = unescape(pair[1]);
    }
    return obj;
}

var dropbox = {
    API_VERSION: "1",
    API_HOST: "https://api.dropbox.com/",
    API_CONTENT_HOST: "https://api-content.dropbox.com/",
    AUTH_HOST: "https://www.dropbox.com/",
      
    setup: function(consumerKey, consumerSecret, accessType, locale) {
        this._consumerKey = consumerKey;
        this._consumerSecret = consumerSecret;
        this._requestCounter = $.now();
        if (accessType == "dropbox") {
            this.root = "dropbox";
        }
        else {
            this.root = "sandbox";
        }
        if (locale) {
            this.locale = locale;
        }
    },
  
    requestToken: function(success, error) {
        var that = this;
        this._request({
            url: "/oauth/request_token",
            method: "POST",
            success: function(data) {
                console.log("request token", data);
                data = parseQueryString(data);
                that._requestToken = data.oauth_token;
                that._requestTokenSecret = data.oauth_token_secret;
                if (success) {
                    success(data);
                }
            },
            error: error
        });
    },
    
    authorizeUrl: function(callback) {
        var url = this.AUTH_HOST + this.API_VERSION + "/oauth/authorize"
               + "?oauth_token=" + this._requestToken;
        if (callback) {
            url += "&oauth_callback=" + encodeURIComponent(callback);
        }
        return url;
    },
    
    accessToken: function(success, error) {
        var that = this;
        console.log(this._requestToken);
        this._request({
            url: "/oauth/access_token",
            method: "POST",
            success: function(data) {
                console.log("access token", data);
                data = parseQueryString(data);
                that._accessToken = data.oauth_token;
                that._accessTokenSecret = data.oauth_token_secret;
                that._uid = data.uid;
                if (success) {
                    success(data);
                }
            },
            error: error
        });
    },
    
    accountInfo: function(success, error) {
        this._request({
            url: "/account/info",
            method: "GET",
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    metadata: function(path, success, error) {
        this._request({
            url: "/metadata/" + this.root + path ,
            method: "GET",
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    put: function(path, body, success, error) {
        this._request({
            host: this.API_CONTENT_HOST,
            url: "/files_put/" + this.root + path,
            method: "PUT",
            dataType: "json",
            contentType: "text/plain",
            headers: {
                "Content-Length": body.length
            },
            data: body,
            success: success,
            error: error
        });
    },
    
    get: function(path, success, error) {
        this._request({
            host: this.API_CONTENT_HOST,
            url: "/files/" + this.root + path,
            method: "GET",
            success: success,
            error: error
        });
    },
    
    getRev: function(path, rev, success, error) {
        this._request({
            host: this.API_CONTENT_HOST,
            url: "/files/" + this.root + path,
            method: "GET",
            data: {
                rev: rev
            },
            success: success,
            error: error
        });
    },
    
    search: function(path, query, success, error) {
        this._request({
            url: "/search/" + this.root + path,
            method: "GET",
            dataType: "json",
            data: {
                query: query
            },
            success: success,
            error: error
        });
    },
    
    shares: function(path, success, error) {
        this._request({
            url: "/shares/" + this.root + path,
            method: "POST",
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    media: function(path, success, error) {
        this._request({
            url: "/media/" + this.root + path,
            method: "POST",
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    delta: function(cursor, success, error) {
        this._request({
            url: "/delta",
            method: "POST",
            dataType: "json",
            data: {
                cursor: cursor
            },
            success: success,
            error: error
        });
    },
    
    revisions: function(path, success, error) {
        this._request({
            url: "/revisions/" + this.root + path,
            method: "GET",
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    restore: function(path, rev, success, error) {
        this._request({
            url: "/restore/" + this.root + path,
            method: "POST",
            dataType: "json",
            data: {
                rev: rev
            },
            success: success,
            error: error
        });
    },
    
    copyRef: function(path, success, error) {
        this._request({
            url: "/copy_ref/" + this.root + path,
            method: "GET",
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    thumbnails: function(path, format, size, success, error) {
        this._request({
            url: "/thumbnails/" + this.root + path,
            method: "GET",
            data: {
                format: format,
                size: size  
            },
            success: success,
            error: error
        });
    },
    
    cp: function(root, fromPath, toPath, success, error) {
        this._request({
            url: "/fileops/copy",
            method: "POST",
            data: {
                root: root,
                from_path: fromPath,
                to_path: toPath
            },
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    mv: function(root, fromPath, toPath, success, error) {
        this._request({
            url: "/fileops/move",
            method: "POST",
            data: {
                root: root,
                from_path: fromPath,
                to_path: toPath
            },
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    mkdir: function(root, path, success, error) {
        this._request({
            url: "/fileops/create_folder",
            method: "POST",
            data: {
                root: root,
                path: path
            },
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    rm: function(root, path, success, error) {
        this._request({
            url: "/fileops/delete",
            method: "POST",
            data: {
                root: root,
                path: path
            },
            dataType: "json",
            success: success,
            error: error
        });
    },
    
    _request: function(options) {
        var requestId = "dropboxjsonp" + (this._requestCounter++);
        // default options        
        params = $.extend({}, {
            host: this.API_HOST,
            apiVersion: this.API_VERSION,
            headers: {},
            contentType: "application/x-www-form-urlencoded",
        }, options || {});
        if (this.locale && (typeof params == "object")) {
            $.extend(params.data, {locale: this.locale});
        }
        
        // build url
        params.url = params.host + params.apiVersion + params.url;
        
        // build message
        var message = {
            action: params.url,
            method: params.method,
            parameters: {
                oauth_consumer_key: this._consumerKey,
                oauth_signature_method: "HMAC-SHA1",
                oauth_token: this._requestToken
            }
        };
        if (this._accessToken) {
            message.parameters.oauth_token = this._accessToken;
        }
        
        // build accessor
        var accessor = {
            consumerSecret: this._consumerSecret,
            tokenSecret: this._requestTokenSecret
        };
        if (this._accessTokenSecret) {
            accessor.tokenSecret = this._accessTokenSecret;
        }
        
        // generate timestamp and nonce, then sign
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        
        // build headers
        $.extend(params.headers, {
            "Authorization": OAuth.getAuthorizationHeader("", message.parameters)
        });
        
        $.ajax({
            url: params.url,
            type: params.method,
            dataType: params.dataType,
            contentType: params.contentType,
            headers: params.headers,
            data: params.data,
            success: function(data) {
                if (params.success) {
                    params.success(data);
                }
            },
            error: function(data) {
                if (params.error) {
                    params.error(data);
                }
            }
        });
    }
};
