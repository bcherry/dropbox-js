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
      
    setup: function(consumerKey, consumerSecret, accessType) {
        this._consumerKey = consumerKey;
        this._consumerSecret = consumerSecret;
        this._requestCounter = $.now();
        if (accessType == "dropbox") {
            this.root = "dropbox";
        }
        else {
            this.root = "sandbox";
        }
    },
  
    requestToken: function(callback) {
        var that = this;
        this._request({
            sendAuth: false,
            url: "/oauth/request_token",
            dataType: "text",
            method: "POST",
            success: function(data) {
                console.log("request token", data);
                data = parseQueryString(data);
                that._requestToken = data.oauth_token;
                that._requestTokenSecret = data.oauth_token_secret;
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.error("request token error", data);
            }
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
    
    accessToken: function(callback) {
        var that = this;
        console.log(this._requestToken);
        this._request({
            sendAuth: false,
            url: "/oauth/access_token",
            method: "POST",
            dataType: "text",
            success: function(data) {
                console.log("access token", data);
                data = parseQueryString(data);
                that._accessToken = data.oauth_token;
                that._accessTokenSecret = data.oauth_token_secret;
                that._uid = data.uid;
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.error("access token error", data);
            }
        });
    },
    
    accountInfo: function(callback) {
        this._request({
            url: "/account/info",
            method: "GET",
            success: function(data) {
                console.log("account info", data);
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.log("account info error", data);
            }
        });
    },
    
    metadata: function(path, callback, errorCallback) {
        this._request({
            url: "/metadata/" + this.root + path ,
            method: "GET",
            success: function(data) {
                console.log("metadata", data);
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.error("metadata error", data);
                if (errorCallback) {
                    errorCallback(data);
                }
            }
        });
    },
    
    put: function(path, body, callback, errorCallback) {
        this._request({
            host: this.API_CONTENT_HOST,
            url: "/files_put/" + this.root + path,
            method: "PUT",
            contentType: "text/plain",
            headers: {
                "Content-Length": body.length
            },
            data: body,
            success: function(data) {
                console.log("file put", data);
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.error("file put error", data);
                if (errorCallback) {
                    errorCallback(data);
                }
            }
        });
    },
    
    
    
    _request: function(options) {
        var requestId = "dropboxjsonp" + (this._requestCounter++);
        // default options
        params = $.extend({}, {
            host: this.API_HOST,
            apiVersion: this.API_VERSION,
            sendAuth: true,
            headers: {},
            success: $.noop,
            error: $.noop,
            dataType: "json",
            contentType: "application/x-www-form-urlencoded",
        }, options || {});
        if (params.sendAuth && !this._accessToken) {
           throw "Authenticated method called before authenticating";
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
        if (params.sendAuth) {
            message.parameters.oauth_token = this._accessToken;
        }
        
        // build accessor
        var accessor = {
            consumerSecret: this._consumerSecret,
            tokenSecret: this._requestTokenSecret
        };
        if (params.sendAuth) {
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
            success: params.success,
            error: params.error
        });
    }
};
