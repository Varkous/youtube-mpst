"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var main = document.querySelector('main');
var embedVideo = CheckElement(document.getElementById("embed-video")).checked;
var file = document.getElementById('file');
var querying = 0;
var id = null;
function CheckElement(element) {
    if (element)
        return element;
    else
        throw Error("Element does not exist. Reload page");
}
window.onload = gapi.client.setApiKey('AIzaSyCI6kajNUTHjsx1Z2xYSPj9A4RNdUd4r_0');
var PlaylistController = /** @class */ (function () {
    // ----------------------------------------------
    function PlaylistController() {
        var _this = this;
        this.current = {
            title: ['', document.getElementById('playlist-title')],
            // ===============
            list: { elements: document.getElementById('current-list'), data: {} },
            // ===============
            register: function (evt) {
                // -----------------------------------   
                if (Object.keys(_this.current.list.data).length === 0)
                    FormMsg("No playlist to register", "message3", "brown");
                var filename = "".concat(_this.current.title[0], ".json");
                var contentType = "application/json;charset=utf-8;";
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(_this.current.list.data)))], { type: contentType });
                    navigator.msSaveOrOpenBlob(blob, filename);
                }
                else {
                    var a = document.createElement('a');
                    a.download = filename;
                    a.href = "data:".concat(contentType, ",") + encodeURIComponent(JSON.stringify(_this.current.list.data));
                    a.click();
                    a.remove();
                }
                return;
            },
            // ===============
            clear: function () {
                _this.current.title[0] = '';
                _this.current.list.data = {};
                if (_this.current.title[1]) //Typescript
                    _this.current.title[1].innerText = '';
                if (_this.current.list.elements) //Typescript
                    _this.current.list.elements.innerHTML = '';
            }
        };
        // ==================-------=================
        this.original = {
            list: { elements: document.getElementById('original-list'), data: {} },
            // ===============
            clear: function () {
                if (_this.original.list.elements)
                    _this.original.list.elements.innerHTML = '';
                _this.original.list.data = {};
                CheckElement(file).value = '';
            },
            // ===============
            load: function (evt) {
                var reader = new FileReader();
                var file = document.getElementById("file");
                var importedFile = CheckElement(file).files[0];
                if (reader) {
                    reader.onload = function () {
                        _this.original.list.data = JSON.parse(reader.result);
                        for (var entry in _this.original.list.data) {
                            var song = _this.original.list.data[entry];
                            var bordercolor = song.title === "Deleted video" || song.title === "Private video" ? 'orange' : 'gray';
                            CheckElement(_this.original.list.elements).innerHTML += "\n            <li style=\"display: list-item; height: auto; border-color: ".concat(bordercolor, "\" id=\"").concat(song.id, "\">").concat(song.title, "\n              <span style=\"color: grey; float:right\">").concat(song.uploader, "</span>\n            </li>");
                        }
                    };
                    reader.readAsText(importedFile);
                    _this.original.clear();
                }
            }
        };
        // ==================-------=================
        this.all = document.getElementById('playlists');
    }
    // -----------------------------------   
    PlaylistController.prototype.get = function (evt) {
        var _this = this;
        evt.preventDefault();
        var username = CheckElement(document.getElementById('username')).value;
        gapi.client.load('youtube', 'v3', function () { return __awaiter(_this, void 0, void 0, function () {
            var channel, entries, playlistEntries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        FormMsg("Waiting on YouTube...", 'message1', 'lightblue');
                        return [4 /*yield*/, gapi.client.youtube.channels.list({
                                part: 'id',
                                forUsername: username
                            })];
                    case 1:
                        channel = _a.sent();
                        if (!channel.result.items)
                            return [2 /*return*/, FormMsg("Username invalid", 'message1', 'red')];
                        return [4 /*yield*/, gapi.client.youtube.playlists.list({
                                part: 'snippet',
                                channelId: channel.result.items[0].id,
                                maxResults: 500
                            })];
                    case 2:
                        entries = _a.sent();
                        playlistEntries = entries.result.items.map(MakePlayListing).join(' ');
                        CheckElement(this.all).innerHTML = playlistEntries;
                        FormMsg("Done", 'message1', 'lightblue');
                        return [2 /*return*/];
                }
            });
        }); });
    };
    // -----------------------------------   
    PlaylistController.prototype.remove_listing = function (listing) {
        CheckElement(listing).parentNode.removeChild(listing);
    };
    // -----------------------------------
    PlaylistController.prototype.query_songs = function (api_key, playlist_id, entries, page_token) {
        var _this = this;
        if (this.current.title[0] !== CheckElement(document.getElementById(playlist_id)).innerText) {
            CheckElement(this.current.list.elements).innerHTML = '';
            this.current.title[0] = CheckElement(document.getElementById(playlist_id)).innerText;
        }
        gapi.client.setApiKey(api_key);
        gapi.client.load('youtube', 'v3', function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // ================
                    return [4 /*yield*/, gapi.client.youtube.playlistItems.list({
                            part: 'snippet',
                            playlistId: playlist_id,
                            channelId: id,
                            pageToken: page_token ? page_token : '',
                            maxResults: entries
                        }).then(function (songs) {
                            songs = songs.result;
                            // ================
                            for (var _i = 0, _a = songs.items; _i < _a.length; _i++) {
                                var item = _a[_i];
                                var details = item.snippet;
                                _this.current.list.data[details.resourceId.videoId] = { title: details.title, uploader: details.videoOwnerChannelTitle, id: details.resourceId.videoId };
                                var entry = "\n          <li>\n            <a href=\"https://www.youtube.com/watch?v=".concat(details.resourceId.videoId, "\">").concat(details.title, "</a>\n            <span style=\"float:right\">").concat(details.videoOwnerChannelTitle, "</span>\n          </li>");
                                if (embedVideo)
                                    entry += "<iframe width=\"320\" height=\"215\"\n          src=\"https://www.youtube.com/embed/".concat(details.resourceId.videoId, "\">\n          </iframe>");
                                CheckElement(_this.current.list.elements).innerHTML += entry;
                            }
                            // ================
                            if (songs.nextPageToken)
                                return _this.query_songs(api_key, playlist_id, entries, songs.nextPageToken);
                            else
                                return CheckElement(_this.current.title[1]).innerText = _this.current.title[0] + " (".concat(songs.pageInfo.totalResults, ")");
                        })];
                    case 1:
                        // ================
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ;
    // ----------------------------------- 
    PlaylistController.prototype.compare = function () {
        var curr = this.current.list.data; //Current Playlist
        var orig = this.original.list.data; // Original Playlist
        document.querySelectorAll('i').forEach(function (e) { return e.remove(); });
        if (curr === orig || Object.keys(curr).length === 0)
            return FormMsg("No playlist to compare to", "message2", "brown");
        var _loop_1 = function (origsong) {
            var missingSong = document.getElementById(orig[origsong].id);
            var found = Object.values(curr).find(function (currsong) {
                currsong.title == orig[origsong].title && currsong.id == orig[origsong].id;
            });
            if (!found && missingSong) {
                orig[origsong].missing = true;
                missingSong.classList.add('missing');
                missingSong.innerHTML += "<i style=\"color: red\" class=\"missing\">Missing</i>";
            }
            else
                missingSong.classList.remove('missing');
        };
        for (var origsong in orig) {
            _loop_1(origsong);
        }
    };
    return PlaylistController;
}());
; // -----------------------------------> End of Class
var Playlists = new PlaylistController();
// -----------------------------------
function FormMsg(msg, element, color) {
    var field = document.getElementById(element);
    if (field) {
        field.style.color = color;
        field.innerText = msg;
        setTimeout(function () {
            field.innerText = '';
        }, 7000);
    }
}
// -----------------------------------
function MakePlayListing(item) {
    return item = "<li class=\"play-listing\">\n    <a href=\"https://youtube.com/playlist?list=".concat(item.id, "\" title=\"").concat(item.snippet.description, "\">\n      <img src=\"").concat(item.snippet.thumbnails["default"].url, "\" style=\"margin-right: 8px;\">\n      <span id=\"").concat(item.id, "\" style=\"color: skyblue; font-family: Helvetica;\">").concat(item.snippet.title, "</span>\n    </a>\n    <div class=\"playlist-inputs\" hidden>\n      <button class=\"add-song\" onclick=\"Playlists.current.clear(); Playlists.query_songs('AIzaSyCI6kajNUTHjsx1Z2xYSPj9A4RNdUd4r_0', '").concat(item.id, "', 50)\">Query Songs</button>\n      <button class=\"remove\" onclick=\"Playlists.remove_listing(this.parentNode.parentNode)\"><img src=\"/images/trash-small.svg\"></button>\n    </div>  \n  </li>");
}
