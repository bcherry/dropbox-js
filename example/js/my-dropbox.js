
var MyDropbox = {};

(function(w, d, MyDb) {

"use strict";

MyDb.dropbox = new DropBox({
    "key"    : "5174rmgqphgs4hr", 
    "secret" : "bzeduy52gi9pj38"
});

MyDb.init = function() {

    this.dropbox.loggedIn(function( loggedInStatus ) {
        ( !loggedInStatus ) ? this.login() : this.home();
    }.bind( this ));
   
};

MyDb.login = function() {

    query("#login").style.display = "block";
    query("#app").style.display = 'none';

    query("#loginButton").addEventListener('click', function() {

        this.dropbox.login(function( islogin ) {
             ( islogin ) ? this.home() : this.login();
        }.bind( this ));

    }.bind ( this ));

    
};

MyDb.home = function() {
    query("#login").style.display = "none";
    query("#app").style.display = 'block';
    this.menu();
    this.files.panel("/");
    //this.upload();
};

MyDb.upload = function() {

    var self = this;

    self.uploadId = 0;

    // validar compatibilidade
    //if (window.File && window.FileList && window.FileReader) {
    var body = query("body"),
        fileselect, filedrag;

    this.dragHover = function(event) {
        event.stopPropagation(); 
        event.preventDefault();
        event.target.className = (event.type == "dragover" ? "hover" : "");
        return false;
    }

    this.drop  = function(event) {

        event.stopPropagation();  
        event.preventDefault();

        self.dragHover(event);

        var files = event.target.files || event.dataTransfer.files;

        for (var key = 0, max = files.length; key < max; key++) {

            var file = files[key];

            query("#upload-list").innerHTML += tmpl("#tmpl-upload-line", {
                id   : ++self.uploadId,
                icon : "page_white",
                file : file.name,
                size : (file.size / 1024 | 0) + 'K' 
            });

            self.sendFile(
                file,
                self.uploadId,
                function(data, id) {

                    query("#upload-" + id).className = "alert-success";
                    query("#upload-loading-" + id).innerHTML = '<i class="icon-ok-sign"></i>';
                    query("#upload-img-" + id).setAttribute("src", "img/" + data.icon + "48.gif");

                }, function(error, id) {
                    query("#upload-" + id).className = "alert-error";
                    query("#upload-loading-" + id).innerHTML = '<i class="icon-remove-sign"></i>';
                }
            );
        }
    }

    this.sendFile = function(file, id, success, error) {
        var reader = new FileReader();
          reader.onload = function(e) {
              MyDb.dropbox.put(file, e.target.result, {
                  done: function( data ) {
                    success(data, id);
                  },
                  error : function(err) {
                    error(err.error, id);
                  }
              });
          }
          reader.readAsText(file);
    }

    body.innerHTML += tmpl('#tmpl-upload', {});
    body.innerHTML += '<div class="modal-backdrop fade in"></div>';

    fileselect = query("#fileselect");
    filedrag   = query("#file-drag");

    query(".upload-close").addEventListener('click', function() {
        body.removeChild(query("#panel-upload"));
        body.removeChild(query(".modal-backdrop"));
        self.home();
    });

    fileselect.addEventListener("change", self.drop, false);
    filedrag.addEventListener("drop", self.drop, false);
    filedrag.addEventListener("dragover",  self.dragHover, false);
    filedrag.addEventListener("dragleave", self.dragHover, false);
};

MyDb.account = function() {
    MyDb.dropbox.accountInfo({
        done: function( data ) {
            MyDb.showPanel("panel-account", data);
            var used = parseFloat((data.quota_info.normal * 100) / data.quota_info.quota).toFixed(2);
            query("#quota").setAttribute("style", "width: " + used + "%");
            query("#quota").innerHTML =  "<h6>" +  used + "% used </h6>";
        },
        error : MyDb.error
    });
}

MyDb.logout = function() {
    MyDb.dropbox.loggedOut();
    MyDb.login();
    window.location = "";
}

MyDb.menu = function() {
    querys("#menu a", function (el) {
        el.addEventListener('click', function() {
            MyDb[ this.getAttribute("href").substring( 1 ) ]();
        });
    });
}

MyDb.error = function(error) {

    var main = query("#main");

    var errorDiv = document.createElement("div");
    errorDiv.innerHTML = tmpl('#tmpl-error', error);

    main.parentNode.insertBefore(errorDiv, main);

    query(".alert-error .close").addEventListener('click', function() {
        query(".container").removeChild(this.parentNode.parentNode);
    });
}

MyDb.showPanel = function(panelId, data) {

    var $panel = query("#" + panelId);
    data = data || {};

    if (!query("#" + panelId)) {
        query("#main").innerHTML = tmpl('#tmpl-' + panelId, data);
    }

    querys("section", function(el) {
        el.style.display = 'none';
    });

    query("#" + panelId).style.display = 'block';
    query("#main").style.display = 'block';
    query("#app").style.display = 'block';
}

MyDb.files = {

    panel: function( path, callback ) {

        var self = this;

        MyDb.dropbox.metadata( path, {
            done: function( data ) {
                MyDb.showPanel("panel-files", {});
                self._render( data, callback );
            },
            error : MyDb.error
        });
    },

    _render: function( data, callback ) {

        var self = this;

        if ( data.contents.length ) {
            data["contents"] = tmpl('#tmpl-panel-files-contents', data.contents);
        } else {
            data["contents"] = "Vazio";
        }

        query("#main").innerHTML = tmpl('#tmpl-panel-files', data);

        this._breadCrumb( data.path );

        querys('[data-dir="true"]', function(el) {
            el.addEventListener('click', function() {
                MyDb.files.panel( this.getAttribute("data-path") );
            });
        });

        querys('[data-dir="false"]', function(el) {
            el.addEventListener('click', function() {
                MyDb.dropbox.media( this.getAttribute("data-path"), {
                    done: function(content) {
                        window.open(content.url);
                    }
                });
            });
        });

        query("#button-upload").addEventListener('click', function() {
            MyDb.upload();
        });

        if (callback) {
            callback();
        }
    },

    /**
     *
     */
    _breadCrumb : function( pathAll ) {

        var $breadcrumb = query( "#breadcrumb" ),
            trail       = pathAll.split( "/" ),
            root        = trail.shift(),
            current     = trail.pop(),
            breadCrumb  = "";

        // create home
        $breadcrumb.innerHTML = tmpl("#tmpl-breadcrumb-path", {
            name : "home",
            path : "/"
        });

        // create path
        trail.forEach(function( patch ) {

            $breadcrumb.innerHTML += tmpl("#tmpl-breadcrumb-path", {
                name : patch,
                path : breadCrumb += "/" + patch
            });
        });

        // create current
        $breadcrumb.innerHTML += tmpl("#tmpl-breadcrumb-current", {
            name : current
        });

        querys("#breadcrumb > li > a", function(el) {
            el.addEventListener('click', function() {
                MyDb.files.panel( this.getAttribute("data-path") );
            });
        });
    }
}

})(window, document, MyDropbox);

function query( selector ) {
    return document.querySelector( selector );
};

function querys( selector , each) {
    var elements = document.querySelectorAll( selector );
    if (each) {
        for (var key = 0, max = elements.length; key < max; key++) {
            each(elements[ key ] , key);
        }
    }

    return elements;
};

function tmpl( selector, listData ) {
    return document.querySelector(selector).innerHTML.tmpl(listData);
};

String.prototype.tmpl = function( listData ) {

    var template = this.toString(),
        returnTemplate = "";
    listData = listData || {};

    function replace(template, list) {

        Object.keys( list ).forEach(function( key ) {
            template = template.replace(
                new RegExp("\\{%" + key + "\\%}", "g"),
                this[ key ]
            );
        }, list);

        return template;
    };

    if (!listData.length) {
        return replace(template, listData);
    }

    listData.forEach(function(element) {
        returnTemplate += replace(template, element);
    });

    return returnTemplate;

};

