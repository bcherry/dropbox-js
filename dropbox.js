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
      
    setup: function(consumerKey, consumerSecret) {
        this._consumerKey = consumerKey;
        this._consumerSecret = consumerSecret;
        this._requestCounter = $.now();
    },
  
    getRequestToken: function(callback) {
        var that = this;
        this._request({
            sendAuth: false,
            url: "/oauth/request_token",
            method: "POST",
            success: function(data) {
                console.log("request token", data);
                data = parseQueryString(data);
                that._oauthToken = data.oauth_token;
                that._oauthTokenSecret = data.oauth_token_secret;
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.error("request token error", data);
            }
        });
    },
    
    getAuthorizeUrl: function(callback) {
        var url = this.AUTH_SERVER + this.API_VERSION + "/oauth/authorize"
               + "?oauth_token=" + this._oauthToken;
        if (callback) {
            url += "&oauth_callback=" + callback;
        }
        return url;
    },
  
   /* authorize: function() {
        var that = this;
        this._request({
            url: AUTH_SERVER + API_VERSION + "/oauth/authorize",
            method: "GET",
            data: {
                oauth_token: this.oauthToken
            },
            success: function(data) {
                console.log("authentication response", data);
            },
            error: function(data) {
                console.error("authentication error", data);
            }
        });
    },*/
    
    getAccessToken: function(callback) {
        var that = this;
        this._request({
            url: "/oauth/access_token",
            method: "POST",
            data: {
                oauth_token: this._oauthToken,
                oauth_token_secret: this._oauthTokenSecret
            },
            success: function(data) {
                console.log("get access token", data);
                console.log("request token", data);
                data = parseQueryString(data);
                that._accessToken = data.oauth_token;
                that._accessTokenSecret = data.oauth_token_secret;
                if (callback) {
                    callback(data);
                }
            },
            error: function(data) {
                console.error("get access token error", data);
            }
        });
    },
    
    getInfo: function() {
        this._request({
            url: "/account/info",
            method: "GET",
            success: function(data) {
                console.log("account info", data);
            },
            error: function() {
                console.log("account info error", arguments);
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

       /* if (params.sendAuth && !this._accessToken) {
           throw "Authenticated method called before authenticating";
        }*/

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

        var oauthBits = {
            consumerSecret: this._consumerSecret
        };

        if (params.sendAuth) {
            oauthBits.tokenSecret = this._accessTokenSecret;
        }

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, oauthBits);
        
        $.ajax({
            type: params.method,
            url: params.url,
            data: OAuth.getParameterMap(message.parameters),

            success: params.success,
            error: params.error
        });
    }
};
