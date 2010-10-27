var dropbox = {
  setup: function(consumerKey, consumerSecret) {
    this._consumerKey = consumerKey;
    this._consumerSecret = consumerSecret;
    this._requestCounter = $.now();
  },

  authenticate: function(email, password, callback) {
    var that = this;

    this._request("/token", {
      sendAuth: false,

      success: function(data) {
        console.log("authentication response", data);
        that._accessToken = data.token;
        that._accessTokenSecret = data.secret;

        if (callback) {
          callback();
        }
      },
      error: function() {
        console.error("authentication error", arguments);
      }
    }, {
      email: email,
      password: password
    });
  },

  getInfo: function() {
    this._request("/account/info", {
      success: function(data) {
        console.log("account info", data);
      },

      error: function() {
        console.log("account info error", arguments);
      }
    });
  },

  _request: function(path, params, data) {
    var requestId = "dropboxjsonp" + (this._requestCounter++);
    params = $.extend({}, {
      subdomain: "api", // some methods need api-content.dropbox.com
      apiVersion: "0",
      sendAuth: true,

      method: "GET",
      success: $.noop,
      error: $.noop
    }, params || {});

    if (params.sendAuth && !this._accessToken) {
      throw "Authenticated method called before authenticating";
    }

    var url = "https://" + params.subdomain + ".dropbox.com/" + params.apiVersion + path;

    var message = {
      action: url,
      method: params.method,
      parameters: {
        oauth_consumer_key: this._consumerKey,
        oauth_signature_method: "HMAC-SHA1",
        callback: requestId
      }
    };

    $.extend(message.parameters, data);

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
      url: url,
      data: OAuth.getParameterMap(message.parameters),
      jsonpCallback: requestId,

      success: params.success,
      error: params.error
    });
  }
};
