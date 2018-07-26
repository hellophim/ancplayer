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
        "DEFAULT_VIDEO": "",
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
        get defaultImage() {
            return 'Video not found...';
        },
        get video() {
            if (this._url)
                return this._url;
            else return this.defaultImage;
        },
        get iframe() {
            if (this._url)
                return '<iframe width="560" height="315" src="{{_url}}?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'.render(this);
            else return this.defaultImage;
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

                    // Get first item set name
                    var firstEpi = epis[0],
                        name_episode = (index + 1).toString().trim();

                    var isHaveEpiName = firstEpi && !/^http|https/.test(firstEpi) && !list_server_name_pattern.test(firstEpi);
                    if (isHaveEpiName) {
                        name_episode = epis.shift().trim();
                    }

                    var ANCItem = function () {
                        return {
                            color: color_episode,
                            name: name_episode
                        }
                    }

                    // get episode name
                    epis.forEach(function (item, pos) {
                        // Get all link of episode 
                        if (/^http|https/.test(item) && list_server_name_pattern.test(item)) {
                            var ancitem = new ANCItem();
                            ancitem.stringId = new Date().getTime().toString();
                            ancitem.position = (pos + 1).toString().trim();
                            ancitem.data = item.toString().trim();
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
        var episodeArea = document.querySelector(this.default.EPISODE_SELECTOR);

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
                html += '<span class="anc_event_open anc_episode__name" data-index="' + episIndex + '" data-server="' + serveIndex + '">{{name}}<span class="anc_episode__position" style="background-color: {{color}};"> {{position}} </span></span>'.render(epi)
            }

            html += '\
                    </div> \
                </div> \
            </li> \
            ';
        }
        html += "</ul>";

        if (episodeArea)
            episodeArea.innerHTML = html;
    },

    buildPlayer: function (index, server) {
        var paramsUrl = (this.ancdata[server].data)[index].data;
        console.log(paramsUrl)
        this.template.url = paramsUrl;
        var videoArea = document.querySelector(this.default.VIDEO_SELECTOR);
        if (videoArea)
            videoArea.innerHTML = this.template.iframe;
    },

    deploy: (function () {

        var vm = this;
        this.mapSource.bind(this)();
        this.buildPlayer.bind(this)(0, "youtube.com");
        this.buildEpisodeView.bind(this)();

        var selectorEpisode = document.querySelectorAll(".anc_event_open");
        selectorEpisode.forEach(function (child) {
            child.addEventListener("click", function (e) {
                var elementAttr = e.target.attributes;
                var index = elementAttr["data-index"].value;
                var serve = elementAttr["data-server"].value;
                vm.buildPlayer.bind(vm)(index, serve);
            });
        });
    })


}

// Utilization

String.prototype.render = function () {

    var otherData = (arguments && arguments[0]) || window;

    return this.replace(/({{.*?}})/g, function (variableName) {
        var tempName = variableName.replace(/{{|}}/gi, "");
        return eval("otherData." + tempName) || variableName;
    });
}