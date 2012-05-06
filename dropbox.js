var dropbox = {
    API_VERSION: "1",
    SERVER: ".dropbox.com",
    API_SERVER: "https://api" + SERVER,
    AUTH_SERVER: "https://www" + SERVER,
      
    setup: function(consumerKey, consumerSecret) {
        this._consumerKey = consumerKey;
        this._consumerSecret = consumerSecret;
        this._requestCounter = $.now();
    },
  
    requestToken: function() {
        var that = this;
        this._request({
            url: API_SERVER + "/oauth/request_token",
            method: "POST",
            success: function(data) {
                console.log("request token", data);
                that._oauthToken = data.oauth_token;
                that._oauthTokenSecret = data.oauth_token_secret;
            },
            error: function(data) {
                console.error("request token error", data);
            }
        });
    },
  
    authorize: function() {
        var that = this;
        this._request({
            url: AUTH_SERVER + "/oauth/authorize",
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
    },
    
    accessToken: function() {
        var that = this;
        this._request({
            url: AUTH_SERVER + "/oauth/access_token",
            method: "POST",
            data: {
                oauth_token: this._oauthToken,
                oauth_token_secret: this._oauthTokenSecret
            },
            success: function(data) {
                console.log("get access token", data);
                that._accessToken = data.token;
                that._accessTokenSecret = data.secret;
            },
            error: function(data) {
                console.error("get access token error", data);
            }
        });
    },
    
    getInfo: function() {
        this._request({
            url: API_SERVER + "/account/info", 
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
            method: "GET",
            success: $.noop,
            error: $.noop
        }, req || {});

        if (params.sendAuth && !this._accessToken) {
           throw "Authenticated method called before authenticating";
        }

        var message = {
            action: params.url,
            method: params.method,
            parameters: {
                oauth_consumer_key: this._consumerKey,
                oauth_signature_method: "HMAC-SHA1",
                callback: requestId
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
            dataType: "jsonp",
            method: params.method,
            url: params.url,
            data: OAuth.getParameterMap(message.parameters),
            jsonpCallback: requestId,

            success: params.success,
            error: params.error
        });
    }
};
