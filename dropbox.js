/**
 * Simple JavaScript library for accessing the Dropbox API
 *
 * - options:
 *     key      his access secret
 *     secret    his access secret
 *     acessType path specified, valid values are sandbox and dropbox.
 *
 * @param {Object} options list of parameters received by the constructor
 * 
 */
var DropBox = function(options) {

    var self = this;

    // default const values
    this.API_VERSION      = "1";
    this.API_HOST         = "https://api.dropbox.com/";
    this.API_CONTENT_HOST = "https://api-content.dropbox.com/";
    this.AUTH_HOST        = "https://www.dropbox.com/";

    //private parameters
    this._consumerKey    = options.key || "";
    this._consumerSecret = options.secret || "";
    this._token          = null;
    this._tokenSecret    = null;
    this._root           = (options.accessType == "sandbox")
                         ? "sandbox"
                         : "dropbox";

    // XXX FIXME :: Autenticacao automatica
    if ( window.location.search ) {
        window.opener.authTempDropBOX();
        window.close();
    }


    /**
     * methods public
     *
     */
    return {

        /**
         * check that this current accession logged
         *
         * @param {function()} callback false: not logged / true: logged
         * return void 
         */
        loggedIn: function( callback ) {

            callback(self.localToken.get());

        },

        /**
         * clears the token in session
         *
         * return void 
         */
        loggedOut: function() {
            // clean old tokens
            self.localToken.unset();
        },

        /**
         * creates redirects to login oauth
         *
         * @param {function()} callback false: not logged / true: logged
         * 
         * @return void
         */
        login: function( callback ) {

            // clean old tokens
            self.localToken.unset();

            // requests authorization to access
            self.oauthRequestToken({
                done : function( data ) {

                    // creates a temporary function for authentication
                    // this will be executed  by the pop-up after being
                    // directed by dropbox
                    window.authTempDropBOX = function() {

                        self.oauthAccessToken({
                            done: function( data ) {
                                delete window.authTempDropBOX;
                                callback( true );
                            },
                            error : function() {
                                callback( false );
                            }
                        });
                    }

                    // redirects the dropbox for authorized access
                    self.oauthAuthorize( window.location.href );

                },
                error: function() {
                    callback( false );
                }
            });
        },

        /**
         * Retrieves file and folder metadata.
         *
         * @param String path     The path to the file or folder
         * @param Object callback callback success or error
         *
         * @return void
         */
        metadata: function( path, callback ) {
            self.request({
                url      : "/metadata/" + self._root + encodeURI( path ),
                method   : "GET",
                dataType : "json",
                done     : callback.done,
                error    : callback.error
            });
        },

        /**
         * Retrieves information about the user account
         *
         * @param Object callback callback success or error
         *
         * @return void
         */
        accountInfo: function( callback ) {
            self.request({
                url      : "/account/info",
                method   : "GET",
                dataType : "json",
                done     : callback.done,
                error    : callback.error
            });
        },

        /**
         * Returns a link directly to a file.
         *
         * @param String path     The path to the file or folder
         * @param Object callback callback success or error
         *
         * @return void
         */
        media: function( path, callback ) {
            self.request({
                url: "/media/" + self._root + encodeURI( path ),
                method   : "GET",
                dataType : "json",
                done     : callback.done,
                error    : callback.error
            });
        },

        /**
         * Uploads a file using PUT semantics.
         *
         * @param String path     The path to the file or folder
         * @param String content  The file contents to be uploaded. 
         * @param Object callback callback success or error
         *
         * @return void
         */
        put: function( path, content, callback ) {

            self.request({
                host        : self.API_CONTENT_HOST,
                url         : "/files_put/" + self._root + "/" + encodeURI( path ),
                method      : "PUT",
                dataType    : "json",
                contentType : "text/plain",
                headers     : {
                    "Content-Length": content.length
                },
                data        : content,
                done        : callback.done,
                error       : callback.error
            });
        },
        
        /**
         * Downloads a file
         * 
         * @param String path     The path to the file or folder
         * @param Object callback callback success or error
         *
         * @return void
         */
        get: function( path, success, callback ) {
            self.request({
                host   : self.API_CONTENT_HOST,
                url    : "/files/" + self._root + encodeURI( path ),
                method : "GET",
                done   : callback.done,
                error  : callback.error
            });
        },

        /**
         * Gets a thumbnail for an image
         * 
         * @param String path   The path to the file or folder
         * @param String format format jpeg (default) or png
         * @param String size   One of the following values (default: s):
         *  - size
         *      xs  32x32
         *      s   64x64
         *      m   128x128
         *      l   640x480
         *      xl  1024x768
         *
         * @param Object callback callback success or error
         *
         * @return void
         */
        thumbnails: function( path, format, size, callback ) {
            self.request({
                host   : self.API_CONTENT_HOST,
                url    : "/thumbnails/" + self._root +  encodeURI( path ),
                method : "GET",
                data   : {
                    format: format,
                    size: size  
                },
                done   : callback.done,
                error  : callback.error
            });
        },

        search: function( path, query, callback ) {
            self.request({
                host     : self.API_HOST,
                url      : "/search/" + self._root + encodeURI(path),
                method   : "GET",
                dataType : "json",
                data     : {
                    query: query
                },
                done     : callback.done,
                error    : callback.error
            });
        },

        shares: function( path, callback ) {
            self.request({
                url      : "/shares/" + self._root + encodeURI(path),
                method   : "POST",
                dataType : "json",
                done     : callback.done,
                error    : callback.error
            });
        },

        move: function( fromPath, toPath, callback ) {
            self.request({
                url      : "/fileops/move",
                method   : "POST",
                data     : {
                    root     : self._root,
                    from_path: fromPath,
                    to_path  : toPath
                },
                dataType : "json",
                done     : callback.done,
                error    : callback.error
            });
        },

        createFolder: function( path, callback ) {
            self.request({
                host: self.API_HOST,
                url: "/fileops/create_folder",
                method: "POST",
                data: {
                    root: self._root,
                    path: path
                },
                dataType: "json",
                done     : callback.done,
                error    : callback.error
            });
        },

        rm: function( path, callback ) {
            self.request({
                url     : "/fileops/delete",
                method  : "POST",
                data: {
                    root : self._root,
                    path : path
                },
                dataType : "json",
                done     : callback.done,
                error    : callback.error
            });
        }
    }
}


/**
 * private methods
 */
DropBox.prototype = {

    /**
     * get key access to the dropbox api
     *
     * options :
     *  - done  success 
     *  - error error in get key access
     *
     * @param {Object} Objects options
     *
     * @return void
     */
    oauthRequestToken : function( options ) {

        this.request({
            url    : "/oauth/request_token",
            method : "POST",
            error  : (options.error || false),
            done   : function( data ) {

                data = this.queryString.parse( data );

                this._token       = data.oauth_token;
                this._tokenSecret = data.oauth_token_secret;

                if ( options.done ) {
                    options.done( data );
                }

            }.bind(this)
        });
    },

    /**
     * validates the key and the authentication token
     *
     * options :
     *  - done  success 
     *  - error error in get key access
     *
     * @param {Object} Objects options
     *
     * @return void
     */
    oauthAccessToken: function( options ) {

        this.request({
            url    : "/oauth/access_token",
            method : "POST",
            error  : (options.error || false),
            done   : function( data ) {

                // parse url parameters
                data = this.queryString.parse( data );

                //Local stores in session for future access
                this.localToken.set( data.oauth_token, data.oauth_token_secret );

                if ( options.done ) {
                    options.done( data );
                }

            }.bind(this)
        });
    },

    /**
     * redirects the dropbox to the User authorizes access
     *
     * @param {String} callbackURL url callback
     *
     * @return {Object} Object window open
     */
    oauthAuthorize: function( callbackURL ) {

        var url = this.AUTH_HOST + this.API_VERSION + "/oauth/authorize"
                + "?oauth_token=" + this._token;

        if ( callbackURL ) {
            url += "&oauth_callback=" + encodeURIComponent( callbackURL );
        }

        return window.open( url, 'about:blank', 'width=950,height=650' );
    },

    /**
     * working with query strings
     */
    queryString : {

        /**
         * convert JSON to query string
         *
         * @param {Object} data Object
         * 
         * @return String
         */
        set: function( data ) {

            var query = [];
            data = data || {};

            Object.keys( data ).forEach(function( key ) {
                query.push( key + "=" + this[ key ]);
            }, data );

            return query.join( "&" );
        },

        /**
         * implement parser in arguments url
         *
         * @param {String} qs arguments url
         * 
         * @return {Object} 
         */
        parse : function( qs ) {

            var obj = {},
                pair = null;

            qs.split( "&" ).forEach(function( parameters ) {
                pair = parameters.split( "=", 2 );
                obj[ pair[0] ] = unescape( pair[1] );
            });

            return obj;
        }
    },

    /**
     * Management access token in local cache
     *
     */
    localToken : {

        /**
         * Unset local Token
         *
         * @return void
         */
        unset: function() {
            window.sessionStorage.removeItem( "_dropbox-token" );
            window.sessionStorage.removeItem( "_dropbox-secret" );
        },

        /**
         * add local Token
         *
         * @param String token       token access dropbox
         * @param String tokenSecret secret access dropbox
         * 
         * @return void
         */
        set: function( token, tokenSecret ) {
            window.sessionStorage.setItem( "_dropbox-token", token );
            window.sessionStorage.setItem( "_dropbox-secret", tokenSecret );
        },

        /**
         * get data in local Token
         *
         * @return {Object|Boolean}
         */
        get: function() {
            var data = {
                token       : window.sessionStorage.getItem( "_dropbox-token" ),
                tokenSecret : window.sessionStorage.getItem( "_dropbox-secret" )
            };

            return (!data.token || !data.tokenSecret) ? false : data;
        }
    },

    /**
     * making the HTTP request to the dropbox api
     *
     * options:
     *  - host        define host api
     *  - apiVersion  define api version
     *  - headers     add headers request
     *  - contentType set content-type request
     *  - method      set method (POST|GET|DELETE|PUT)
     *  - data        Object parameters in query string
     *  - dataType    type return (JSON|text-plain)
     *  - done        callback success
     *  - error       callback error
     * 
     * @param {Object} options
     * 
     * @return void
     */
    request : function( options ) {

        
        var tokenSession = this.localToken.get(),
            message = {},
            accessor = {},
            http = null,
            dataSend = null,
            returnData = null,
            params = {
                done        : function(data) {},
                error       : function(data) {},
                host        : this.API_HOST,
                apiVersion  : this.API_VERSION,
                headers     : {},
                contentType : "application/x-www-form-urlencoded"
            };

        if ( tokenSession.token ) {
            this._token = tokenSession.token;
        }

        if ( tokenSession.tokenSecret ) {
            this._tokenSecret = tokenSession.tokenSecret;
        }

       
        
        // merge default options
        Object.keys( options ).forEach(function ( key ) {
            params[key]  = options[key];
        }, options);
        // build url
        params.url = params.host + params.apiVersion + params.url;

        // build message
        message = {
            action     : params.url,
            method     : params.method,
            parameters : {
                oauth_consumer_key     : this._consumerKey,
                oauth_signature_method : "HMAC-SHA1",
                oauth_token            : this._token
            }
        };

        // build accessor
        accessor = {
            consumerSecret : this._consumerSecret,
            tokenSecret    : this._tokenSecret
        };

        // generate timestamp and nonce, then sign
        OAuth.setTimestampAndNonce( message );
        OAuth.SignatureMethod.sign( message, accessor );
        params.headers.Authorization = OAuth.getAuthorizationHeader(
            "", message.parameters
        );

        // create XMLRequest
        if ( window.XMLHttpRequest ) {

            http = new XMLHttpRequest();

        } else if ( window.ActiveXObject ) {

            try {
                http = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                params.error( {'error' : 'Browser does not bearable'} );
                return;
            }

        }

        // create query string
        if (typeof params.data == "object") {
            dataSend = this.queryString.set( params.data ) || "";
        } else {
            dataSend = params.data;
        }

        if ( params.method == "GET" && dataSend ) {

            params.url += "?" + encodeURI( dataSend );
            dataSend = "";

        }

        http.open(params.method, params.url, true);

        Object.keys( params.headers ).forEach(function( key ) {
            http.setRequestHeader( key , this[ key ] );
        }, params.headers);

        if ( params.contentType ) {
            http.setRequestHeader( "Content-Type", params.contentType );
        }

        http.send(dataSend);
        http.onreadystatechange = function() {
            if ( http.readyState == 4 ) {

                if ( http.status == 200 ) {

                    //returnData['Content-type'] = http.getResponseHeader('Content-type');

                    if ( params.done ) {
                        params.done(((params.dataType == "json") 
                                       ?  eval( '(' + http.responseText + ')' )
                                       :  http.responseText), returnData);
                    }

                } else {
                    if ( params.error ) {
                        params.error((params.dataType == "json") 
                                    ?  eval( '(' + http.responseText + ')' )
                                    :  http.responseText);
                    }
                }
            }
        }
    }
};