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
    API_SERVER: "https://api.dropbox.com/",
    AUTH_SERVER: "https://www.dropbox.com/",
      
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
        var url = this.AUTH_SERVER + this.API_VERSION + "/oauth/authorize"
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
            data: {
                oauth_token: this._requestToken,
                oauth_token_secret: this._requestTokenSecret
            },
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
            dataType: "json",
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
            dataType: "json",
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
    
    _request: function(req) {
        var requestId = "dropboxjsonp" + (this._requestCounter++);
        params = $.extend({}, {
            sendAuth: true,
            success: $.noop,
            error: $.noop
        }, req || {});
        params.url = this.API_SERVER + this.API_VERSION + params.url;

        if (params.sendAuth && !this._accessToken) {
           throw "Authenticated method called before authenticating";
        }

        var message = {
            action: params.url,
            method: params.method,
            parameters: {
                oauth_consumer_key: this._consumerKey,
                oauth_signature_method: "HMAC-SHA1",
            }
        };
        $.extend(message.parameters, params.data);
        if (params.sendAuth) {
            message.parameters.oauth_token = this._accessToken;
        }
        
        var accessor = {
            consumerSecret: this._consumerSecret,
            tokenSecret: this._requestTokenSecret
        };
        if (params.sendAuth) {
            accessor.tokenSecret = this._accessTokenSecret;
        }
        
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        
        $.ajax({
            type: params.method,
            dataType: params.dataType,
            url: params.url,
            data: OAuth.getParameterMap(message.parameters),
            success: params.success,
            error: params.error
        });
    }
};
