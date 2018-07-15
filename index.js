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

    },

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
        return source;
    },

    deploy: (function () {
        var videoArea = document.querySelector(this.default.VIDEO_SELECTOR);
        this.template.url = this.source;
        videoArea.innerHTML = this.template.video;

    })


}