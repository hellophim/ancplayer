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
        get video() {
            return this._url;
        },
        get iframe() {
            return '<iframe src="https://www.rapidvideo.com/v/FT73KJTN5R" scrolling="no" align="bottom" width="800px" height="300px" marginheight="200px" frameborder= 0 allow= autoplay encrypted-media allowfullscreen></iframe>';
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
            this.ancdata.push({
                server: serve,
                name: list_server_name[index],
                data: []
            });
        }, this);

        // push data to ancdata
        if (this.source && Array.isArray(this.source)) {
            this.source.forEach(function (episode, index) {

                var epis = episode && episode.split(';');
                if (epis && Array.isArray(epis)) {

                    var ancitem = {};
                    var list_server_name_pattern = new RegExp(list_server.join('|'));

                    epis.forEach(function (item) {
                        if (!/^http|https/.test(item) && !list_server_name_pattern.test(item)) {
                            ancitem.name = item;
                        }
                    });
                }

                console.log(ancitem);
            });
        } else {
            new Error("Don't have data episode in HTML");
        }
    },

    deploy: (function () {
        var videoArea = document.querySelector(this.default.VIDEO_SELECTOR);
        this.template.url = this.source;
        videoArea.innerHTML = this.template.video;

        this.mapSource.bind(this)();
    })


}