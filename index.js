var ANCMedia = function (options) {

    if (!options && typeof options !== 'object') {
        this.default = Object.assign(this.default, options);
    }

    this.deploy.bind(this)();

};

ANCMedia.prototype = {

    default: {

        // properties setting
        height: '500px',
        width: '350px',

        // const setting
        "VIDEO_SELECTOR": '#ancVideo',
        "EPISODE_SELECTOR": '#ancEpisode',
        "LIST_SERVER": 'youtube.com,rapidvideo.com',
        "LIST_SERVER_NAME": 'Tube, Rapid'

    },

    ancdata: [],

    request: function (url, options) {
        var options = options || {
            method: 'GET'
        };
        return new Promise(function (resolve, reject) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", resolve);
            oReq.open(options.method, url);
            oReq.send();
        })
    },

    /**
     * template = List template such as : video, iframe, embed...
     */
    template: {
        set url(url) {
            this._url = url;
        },
        get color() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        get video() {
            return this._url;
        },
        get iframe() {
            return '<iframe width="560" height="315" src="https://www.youtube.com/embed/6NG4v2p2nug?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        }
    },

    /**
     * source = find all media content in HTML, suggest use tag <id style="display:none;">Name;link</id>
     */
    get source() {
        var source = document.getElementsByTagName('id')[0] && document.getElementsByTagName('id')[0].innerText;
        if (!source) {
            var content = document.getElementsByTagName('body')[0] && document.getElementsByTagName('body')[0].innerHTML;
            source = content && content.match(/\[id\](.*?)\[\/id\]/);
            source = source && source[1];
        }
        return source && source.split('|');
    },

    mapSource: function () {
        var list_server = this.default && this.default.LIST_SERVER && this.default.LIST_SERVER.split(',');
        var list_server_name = this.default && this.default.LIST_SERVER_NAME && this.default.LIST_SERVER_NAME.split(',');

        // define ancdata
        list_server.forEach(function (serve, index) {
            this.ancdata[serve.toString().trim()] = ({
                serverName: list_server_name[index].trim(),
                server: serve,
                data: []
            });
        }, this);

        // push data to ancdata
        if (this.source && Array.isArray(this.source)) {
            this.source.forEach(function (episode, index) {

                var epis = episode && episode.split(';');
                if (epis && Array.isArray(epis)) {

                    var color_episode = this.template.color;
                    var list_server_name_pattern = new RegExp(list_server.join('|'));

                    // get episode name
                    epis.forEach(function (item, pos) {
                        var ancitem = {
                            color: color_episode
                        };
                        if (!/^http|https/.test(item) && !list_server_name_pattern.test(item)) {
                            ancitem.name = item.toString().trim();
                        } else {
                            // If don't have name for episode, get index.
                            ancitem.name = (index + 1).toString().trim();
                        }
                        // Get all link of episode 
                        if (/^http|https/.test(item) && list_server_name_pattern.test(item)) {
                            ancitem.position = (pos + 1).toString().trim() || 1;
                            ancitem.positionReal = pos.toString().trim() || 0;
                            ancitem.data = item;
                            var serve = item.match(list_server_name_pattern);
                            if (serve.length && serve[0]) {
                                this.ancdata[serve[0]].data.push(ancitem);
                            }
                        }
                    }, this);
                }

            }, this);
        } else {
            new Error("Don't have data episode in HTML");
        }

        return this.ancdata;
    },

    buildEpisodeView: function () {
        var html = '<ul class="anc_server__episodes">';
        for (var serveIndex in this.ancdata) {

            var row = this.ancdata[serveIndex];
            html += '\
            <li class="anc_server__item">\
                <div class="anc_server__name"> {{serverName}} </div>\
                    <div class="anc_server__episode"> \
            '.render(row);

            for (var episIndex in row.data) {
                var epi = row.data[episIndex];
                html += '<span class="anc_episode__name">{{name}}<span class="anc_episode__position" style="background-color: {{color}};">{{positionReal}}</span></span>'.render(epi)
            }

            html += '\
                    </div> \
                </div> \
            </li> \
            ';
        }
        html += "</ul>"
        return html;
    },

    deploy: (function () {
        var videoArea = document.querySelector(this.default.VIDEO_SELECTOR);
        this.template.url = this.source;
        if (videoArea)
            videoArea.innerHTML = this.template.iframe;

        var episodeArea = document.querySelector(this.default.EPISODE_SELECTOR);
        this.mapSource.bind(this)();
        if (episodeArea)
            episodeArea.innerHTML = this.buildEpisodeView.bind(this)();
    })


}

// Utilization

String.prototype.render = function () {

    var otherData = (arguments && arguments[0]) || window;

    function getValue(obj, query) {
        var arr = query.split(".");
        while (arr.length && (obj = obj[arr.shift()]));
        return obj;
    }

    return this.replace(/{{.*?}}/g, function (variableName) {
        var tempName = variableName.replace(/{|}/gi, "");
        return getValue(otherData, tempName) || variableName;
    });
}