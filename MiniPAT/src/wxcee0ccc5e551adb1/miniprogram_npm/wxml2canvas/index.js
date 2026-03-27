var _createForOfIteratorHelper2 = require("../../@babel/runtime/helpers/createForOfIteratorHelper");
    var _classCallCheck2 = require("../../@babel/runtime/helpers/classCallCheck");
    var _createClass2 = require("../../@babel/runtime/helpers/createClass");
    var _typeof2 = require("../../@babel/runtime/helpers/typeof");
    module.exports = function() {
        var __MODS__ = {};
        var __DEFINE__ = function __DEFINE__(modId, func, req) {
            var m = {
                exports: {},
                _tempexports: {}
            };
            __MODS__[modId] = {
                status: 0,
                func: func,
                req: req,
                m: m
            };
        };
        var __REQUIRE__ = function __REQUIRE__(modId, source) {
            if (!__MODS__[modId]) return require(source);
            if (!__MODS__[modId].status) {
                var m = __MODS__[modId].m;
                m._exports = m._tempexports;
                var desp = Object.getOwnPropertyDescriptor(m, "exports");
                if (desp && desp.configurable) Object.defineProperty(m, "exports", {
                    set: function set(val) {
                        if (_typeof2(val) === "object" && val !== m._exports) {
                            m._exports.__proto__ = val.__proto__;
                            Object.keys(val).forEach(function(k) {
                                m._exports[k] = val[k];
                            });
                        }
                        m._tempexports = val;
                    },
                    get: function get() {
                        return m._tempexports;
                    }
                });
                __MODS__[modId].status = 1;
                __MODS__[modId].func(__MODS__[modId].req, m, m.exports);
            }
            return __MODS__[modId].m.exports;
        };
        var __REQUIRE_WILDCARD__ = function __REQUIRE_WILDCARD__(obj) {
            if (obj && obj.__esModule) {
                return obj;
            } else {
                var newObj = {};
                if (obj != null) {
                    for (var k in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k];
                    }
                }
                newObj.default = obj;
                return newObj;
            }
        };
        var __REQUIRE_DEFAULT__ = function __REQUIRE_DEFAULT__(obj) {
            return obj && obj.__esModule ? obj.default : obj;
        };
        __DEFINE__(1711542553245, function(require, module, exports) {
            var __TEMP__ = require('./src/index');
            var Wxml2Canvas = __REQUIRE_DEFAULT__(__TEMP__);
            if (!exports.__esModule) Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = Wxml2Canvas;
        }, function(modId) {
            var map = {
                "./src/index": 1711542553246
            };
            return __REQUIRE__(map[modId], modId);
        });
        __DEFINE__(1711542553246, function(require, module, exports) {
            var __TEMP__ = require('./util');
            var Util = __REQUIRE_DEFAULT__(__TEMP__);
            var imageMode = ['scaleToFill', 'aspectFit', 'aspectFill', 'widthFix', 'top', 'bottom', 'center', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
            var Wxml2Canvas = /*#__PURE__*/ function() {
                function Wxml2Canvas() {
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                    _classCallCheck2(this, Wxml2Canvas);
                    this.device = wx.getSystemInfoSync && wx.getSystemInfoSync() || {};
                    if (!options.zoom) {
                        this.zoom = this.device.windowWidth / 375;
                    } else {
                        this.zoom = options.zoom || 1;
                    }
                    this.element = options.element;
                    this.object = options.obj;
                    this.width = options.width * this.zoom || 0;
                    this.height = options.height * this.zoom || 0;
                    this.destZoom = options.destZoom || 3;
                    this.destWidth = this.width * this.destZoom;
                    this.destHeight = this.height * this.destZoom;
                    this.translateX = options.translateX * this.zoom || 0;
                    this.translateY = options.translateY * this.zoom || 0;
                    this.gradientBackground = options.gradientBackground || null;
                    this.background = options.background || '#ffffff';
                    this.finishDraw = options.finish || function finish(params) {};
                    this.errorHandler = options.error || function error(params) {};
                    this.progress = options.progress || function progress(params) {};
                    this.textAlign = options.textAlign || 'left';
                    this.fullText = options.fullText || false;
                    this.font = options.font || '14px PingFang SC';
                    this._init();
                }
                _createClass2(Wxml2Canvas, [{
                    key: "draw",
                    value: function draw() {
                        var _this = this;
                        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                        var that = arguments.length > 1 ? arguments[1] : undefined;
                        var self = this;
                        this.data = data;
                        this.fef = that;
                        this.progress(10);
                        this._preloadImage(data.list).then(function(result) {
                            _this.progress(30);
                            self._draw();
                        }).catch(function(res) {
                            self.errorHandler(res);
                        });
                    }
                }, {
                    key: "measureWidth",
                    value: function measureWidth(text, font) {
                        if (font) {
                            this.ctx.font = font;
                        }
                        var res = this.ctx.measureText(text) || {};
                        return res.width || 0;
                    }
                }, {
                    key: "_init",
                    value: function _init() {
                        this.progressPercent = 0; // 绘制进度百分比
                        this.data = null;
                        this.ref = null;
                        this.allPic = [];
                        this.screenList = [];
                        this.asyncList = [];
                        this.imgUrl = '';
                        this.progressPercent = 0;
                        this.distance = 0;
                        this.progress(0);
                        this.ctx = wx.createCanvasContext(this.element, this.obj);
                        this.ctx.font = this.font;
                        this.ctx.setTextBaseline('top');
                        this.ctx.setStrokeStyle('white');
                        this.debug = this.device.platform === 'devtools' ? true : false;
                        this._drawBakcground();
                    }
                }, {
                    key: "_drawBakcground",
                    value: function _drawBakcground() {
                        if (this.gradientBackground) {
                            var line = this.gradientBackground.line || [0, 0, 0, this.height];
                            var color = this.gradientBackground.color || ['#fff', '#fff'];
                            var style = {
                                fill: {
                                    line: line,
                                    color: color
                                }
                            };
                            this._drawRectToCanvas(0, 0, this.width, this.height, style);
                        } else {
                            var _style = {
                                fill: this.background
                            };
                            this._drawRectToCanvas(0, 0, this.width, this.height, _style);
                        }
                    }
                }, {
                    key: "_draw",
                    value: function _draw() {
                        var self = this;
                        var list = this.data.list || [];
                        var index = 0;
                        var all = [];
                        var count = 0;
                        list.forEach(function(item) {
                            if (item.type === 'wxml') {
                                count += 3;
                            } else {
                                count += 1;
                            }
                        });
                        this.distance = 60 / (count || 1); // 进度条的间距
                        this.progressPercent = 30;
                        this.asyncList = list.filter(function(item) {
                            return item.delay == true;
                        });
                        list = list.filter(function(item) {
                            return item.delay != true;
                        });
                        drawList(list);
                        Promise.all(all).then(function(results) {
                            index = 0;
                            drawList(self.asyncList, true);
                            Promise.all(all).then(function(results) {
                                self.progress(90);
                                self._saveCanvasToImage();
                            });
                        }).catch(function(e) {
                            console.log(e);
                            self.errorHandler(e);
                        });

                        function drawList() {
                            var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                            var noDelay = arguments.length > 1 ? arguments[1] : undefined;
                            list.forEach(function(item, i) {
                                all[index++] = new Promise(function(resolve, reject) {
                                    var attr = item.style;
                                    item.progress = self.distance;
                                    if (noDelay) {
                                        item.delay = 0;
                                    }
                                    if (item.type === 'radius-image') {
                                        self._drawCircle(item, attr, resolve, reject, 'image');
                                    } else if (item.type === 'text') {
                                        self._drawText(item, attr, resolve, reject);
                                    } else if (item.type === 'line') {
                                        self._drawLine(item, attr, resolve, reject);
                                    } else if (item.type === 'circle') {
                                        self._drawCircle(item, attr, resolve, reject);
                                    } else if (item.type === 'rect') {
                                        self._drawRect(item, attr, resolve, reject);
                                    } else if (item.type === 'image') {
                                        self._drawRect(item, attr, resolve, reject, 'image');
                                    } else if (item.type === 'wxml') {
                                        self._drawWxml(item, attr, resolve, reject);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        }
                    }
                }, {
                    key: "_saveCanvasToImage",
                    value: function _saveCanvasToImage() {
                        var self = this;

                        // 延时保存有两个原因，一个是等待绘制delay的元素，另一个是安卓上样式会错乱
                        setTimeout(function() {
                            self.progress(95);
                            var obj = {
                                x: 0,
                                y: 0,
                                width: self.width,
                                height: self.height,
                                canvasId: self.element,
                                success: function success(res) {
                                    self.progress(100);
                                    self.imgUrl = res.tempFilePath;
                                    self.finishDraw(self.imgUrl);
                                },
                                fail: function fail(res) {
                                    self.errorHandler({
                                        errcode: 1000,
                                        errmsg: 'save canvas error',
                                        e: res
                                    });
                                }
                            };
                            if (self.destZoom !== 3) {
                                obj.destWidth = self.destWidth;
                                obj.destHeight = self.destHeight;
                            }
                            wx.canvasToTempFilePath(obj, self.object);
                        }, self.device.system.indexOf('iOS') === -1 ? 300 : 100);
                    }
                }, {
                    key: "_preloadImage",
                    value: function _preloadImage() {
                        var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                        var self = this;
                        var all = [];
                        var count = 0;
                        list.forEach(function(item, i) {
                            if (item.url && self._findPicIndex(item.url) === -1) {
                                // 避免重复下载同一图片
                                self.allPic.push({
                                    url: item.url,
                                    local: ''
                                });
                                all[count++] = new Promise(function(resolve, reject) {
                                    // 非http(s)域名的就不下载了
                                    if (!/^http/.test(item.url) || /^http:\/\/(tmp)|(usr)\//.test(item.url) || /^http:\/\/127\.0\.0\.1/.test(item.url)) {
                                        var imageInfo = function imageInfo(url) {
                                            wx.getImageInfo({
                                                src: url,
                                                success: function success(res) {
                                                    var index = self._findPicIndex(url);
                                                    if (index > -1) {
                                                        self.allPic[index].local = url;
                                                        self.allPic[index].width = res.width;
                                                        self.allPic[index].height = res.height;
                                                    }
                                                    resolve({
                                                        tempFilePath: url
                                                    });
                                                },
                                                fail: function fail(res) {
                                                    reject(res);
                                                }
                                            });
                                        };
                                        if (item.isBase64) {
                                            var fileManager = wx.getFileSystemManager();
                                            fileManager.writeFile({
                                                filePath: item.url,
                                                data: item.isBase64.replace(/data:image\/(.*);base64,/, ''),
                                                encoding: 'base64',
                                                success: function success(res) {
                                                    imageInfo(item.url);
                                                },
                                                fail: function fail(res) {
                                                    reject(res);
                                                }
                                            });
                                        } else {
                                            imageInfo(item.url);
                                        }
                                    } else {
                                        wx.downloadFile({
                                            url: item.url.replace(/^https?/, 'https'),
                                            success: function success(res) {
                                                wx.getImageInfo({
                                                    src: res.tempFilePath,
                                                    success: function success(img) {
                                                        var index = self._findPicIndex(item.url);
                                                        if (index > -1) {
                                                            self.allPic[index].local = res.tempFilePath;
                                                            self.allPic[index].width = img.width;
                                                            self.allPic[index].height = img.height;
                                                        }
                                                        resolve(res);
                                                    },
                                                    fail: function fail(res) {
                                                        reject(res);
                                                    }
                                                });
                                            },
                                            fail: function fail(res) {
                                                reject({
                                                    errcode: 1001,
                                                    errmsg: 'download pic error'
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        return Promise.all(all).then(function(results) {
                            return new Promise(function(resolve) {
                                resolve();
                            });
                        }).catch(function(results) {
                            return new Promise(function(resolve, reject) {
                                reject(results);
                            });
                        });
                    }
                }, {
                    key: "_findPicIndex",
                    value: function _findPicIndex(url) {
                        var index = this.allPic.findIndex(function(pic) {
                            return pic.url === url;
                        });
                        return index;
                    }
                }, {
                    key: "_drawRect",
                    value: function _drawRect(item, style, resolve, reject, isImage, isWxml) {
                        var zoom = this.zoom;
                        var leftOffset = 0;
                        var topOffset = 0;
                        var width = style.width;
                        var height = style.height;
                        var imgWidth = style.width;
                        var imgHeight = style.height;
                        var mode = null;
                        try {
                            item.x = this._resetPositionX(item, style);
                            item.y = this._resetPositionY(item, style);
                            var url;
                            if (isImage) {
                                var index = this._findPicIndex(item.url);
                                if (index > -1) {
                                    url = this.allPic[index].local;
                                    imgWidth = this.allPic[index].width;
                                    imgHeight = this.allPic[index].height;
                                } else {
                                    url = item.url;
                                }
                            }
                            style.padding = style.padding || [];
                            if (isWxml === 'inline-wxml') {
                                item.x = item.x + (style.padding[3] && style.padding[3] || 0);
                                item.y = item.y + (style.padding[0] && style.padding[0] || 0);
                            }
                            leftOffset = item.x + style.width + (style.padding[1] && style.padding[1] || 0);
                            if (!isWxml) {
                                width = width * zoom;
                                height = height * zoom;
                            }
                            if (style.dataset && style.dataset.mode && imageMode.indexOf(style.dataset.mode) > -1) {
                                mode = {
                                    type: style.dataset.mode,
                                    width: imgWidth,
                                    height: imgHeight
                                };
                            }
                            this._drawRectToCanvas(item.x, item.y, width, height, style, url, mode);
                            this._updateProgress(item.progress);
                            if (resolve) {
                                resolve();
                            } else {
                                return {
                                    leftOffset: leftOffset,
                                    topOffset: topOffset
                                };
                            }
                        } catch (e) {
                            reject && reject({
                                errcode: isImage ? 1003 : 1002,
                                errmsg: isImage ? 'drawImage error' : 'drawRect error',
                                e: e
                            });
                        }
                    }
                }, {
                    key: "_drawRectToCanvas",
                    value: function _drawRectToCanvas(x, y, width, height, style, url, mode) {
                        var _this2 = this;
                        var fill = style.fill,
                            border = style.border,
                            boxShadow = style.boxShadow;
                        this.ctx.save();
                        this._drawBoxShadow(boxShadow, function(res) {
                            // 真机上填充渐变色时，没有阴影，先画个相等大小的纯色矩形来实现阴影
                            if (fill && typeof fill !== 'string' && !_this2.debug) {
                                _this2.ctx.setFillStyle(res.color || '#ffffff');
                                _this2.ctx.fillRect(x, y, width, height);
                            }
                        });
                        if (url) {
                            // 开发者工具有bug，先不裁剪
                            if (mode) {
                                this._resetImageByMode(url, x, y, width, height, mode);
                            } else {
                                this.ctx.drawImage(url, x, y, width, height);
                            }
                        } else {
                            this._setFill(fill, function() {
                                _this2.ctx.fillRect(x, y, width, height);
                            });
                        }
                        this._drawBorder(border, style, function(border) {
                            var fixBorder = border.width;
                            _this2.ctx.strokeRect(x - fixBorder / 2, y - fixBorder / 2, width + fixBorder, height + fixBorder);
                        });
                        this.ctx.draw(true);
                        this.ctx.restore();
                    }
                }, {
                    key: "_resetImageByMode",
                    value: function _resetImageByMode(url, x, y, width, height, mode) {
                        var self = this;
                        var offsetX = 0;
                        var offsetY = 0;
                        var imgWidth = mode.width;
                        var imgHeight = mode.height;
                        switch (mode.type) {
                            case 'scaleToFill':
                                imgWidth = width;
                                imgHeight = height;
                                self.ctx.drawImage(url, x, y, width, height);
                                break;
                            case 'widthFix':
                                height = width / ((imgWidth || 1) / (imgHeight || 1));
                                self.ctx.drawImage(url, x, y, width, height);
                                break;
                            case 'aspectFit':
                                if (imgWidth > imgHeight) {
                                    var realHeight = width / ((imgWidth || 1) / (imgHeight || 1));
                                    offsetY = -(height - realHeight) / 2;
                                    imgWidth = width;
                                    imgHeight = realHeight;
                                } else {
                                    var realWidth = height / ((imgHeight || 1) / (imgWidth || 1));
                                    offsetX = -(width - realWidth) / 2;
                                    imgWidth = realWidth;
                                    imgHeight = height;
                                }
                                _clip();
                                break;
                            case 'aspectFill':
                                if (imgWidth > imgHeight) {
                                    var _realWidth = imgWidth / ((imgHeight || 1) / (height || 1));
                                    offsetX = (_realWidth - width) / 2;
                                    imgWidth = _realWidth;
                                    imgHeight = height;
                                } else {
                                    var _realHeight = imgHeight / ((imgWidth || 1) / (width || 1));
                                    offsetY = (_realHeight - height) / 2;
                                    imgWidth = width;
                                    imgHeight = _realHeight;
                                }
                                _clip();
                                break;
                            case 'top left':
                                _clip();
                                break;
                            case 'top':
                                offsetX = (mode.width - width) / 2;
                                _clip();
                                break;
                            case 'top right':
                                offsetX = mode.width - width;
                                _clip();
                                break;
                            case 'left':
                                offsetY = (mode.height - height) / 2;
                                _clip();
                                break;
                            case 'center':
                                offsetX = (mode.width - width) / 2;
                                offsetY = (mode.height - height) / 2;
                                _clip();
                                break;
                            case 'right':
                                offsetX = mode.width - width;
                                offsetY = (mode.height - height) / 2;
                                _clip();
                                break;
                            case 'bottom left':
                                offsetY = mode.height - height;
                                _clip();
                                break;
                            case 'bottom':
                                offsetX = (mode.width - width) / 2;
                                offsetY = mode.height - height;
                                _clip();
                                break;
                            case 'bottom right':
                                offsetX = mode.width - width;
                                offsetY = mode.height - height;
                                _clip();
                                break;
                            default:
                                imgWidth = width;
                                imgHeight = height;
                                break;
                        }

                        function _clip() {
                            self.ctx.save();
                            self.ctx.beginPath();
                            self.ctx.rect(x, y, width, height);
                            self.ctx.clip();
                            self.ctx.drawImage(url, x - offsetX, y - offsetY, imgWidth, imgHeight);
                            self.ctx.closePath();
                            self.ctx.restore();
                        }
                    }
                }, {
                    key: "_drawText",
                    value: function _drawText(item, style, resolve, reject, type, isWxml) {
                        var zoom = this.zoom;
                        var leftOffset = 0;
                        var topOffset = 0;
                        try {
                            style.fontSize = this._parseNumber(style.fontSize);
                            var fontSize = Math.ceil((style.fontSize || 14) * zoom);
                            this.ctx.setTextBaseline('top');
                            this.ctx.font = "".concat(style.fontWeight ? style.fontWeight : 'normal', " ").concat(fontSize, "px ").concat(style.fontFamily || 'PingFang SC');
                            this.ctx.setFillStyle(style.color || '#454545');
                            var text = item.text || '';
                            var textWidth = Math.floor(this.measureWidth(text, style.font || this.ctx.font));
                            var lineHeight = this._getLineHeight(style);
                            var textHeight = Math.ceil(textWidth / (style.width || textWidth)) * lineHeight;
                            var width = Math.ceil((style.width || textWidth) * (!isWxml ? zoom : 1));
                            var whiteSpace = style.whiteSpace || 'wrap';
                            var x = 0;
                            var y = 0;
                            if (typeof style.padding === 'string') {
                                style.padding = Util.transferPadding(style.padding);
                            }
                            item.x = this._resetPositionX(item, style);
                            item.y = this._resetPositionY(item, style, textHeight);
                            this._drawBoxShadow(style.boxShadow);
                            if (style.background || style.border) {
                                this._drawTextBackgroud(item, style, textWidth, textHeight, isWxml);
                            }

                            // 行内文本
                            if (type === 'inline-text') {
                                width = item.maxWidth;
                                if (item.leftOffset + textWidth > width) {
                                    // 如果上一个行内元素换行了，这个元素要继续在后面补足一行
                                    var lineNum = Math.max(Math.floor(textWidth / width), 1);
                                    var length = text.length;
                                    var singleLength = Math.floor(length / lineNum);
                                    var widthOffset = item.leftOffset ? item.leftOffset - item.originX : 0;
                                    var _this$_getTextSingleL = this._getTextSingleLine(text, width, singleLength, 0, widthOffset),
                                        currentIndex = _this$_getTextSingleL.endIndex,
                                        single = _this$_getTextSingleL.single,
                                        singleWidth = _this$_getTextSingleL.singleWidth;
                                    x = this._resetTextPositionX(item, style, singleWidth);
                                    y = this._resetTextPositionY(item, style);
                                    this.ctx.fillText(single, x, y);
                                    leftOffset = x + singleWidth;
                                    topOffset = y;

                                    // 去除第一行补的内容，然后重置
                                    text = text.substring(currentIndex, text.length);
                                    currentIndex = 0;
                                    lineNum = Math.max(Math.floor(textWidth / width), 1);
                                    textWidth = Math.floor(this.measureWidth(text, style.font || this.ctx.font));
                                    item.x = item.originX; // 还原换行后的x
                                    for (var i = 0; i < lineNum; i++) {
                                        var _this$_getTextSingleL2 = this._getTextSingleLine(text, width, singleLength, currentIndex),
                                            endIndex = _this$_getTextSingleL2.endIndex,
                                            _single = _this$_getTextSingleL2.single,
                                            _singleWidth = _this$_getTextSingleL2.singleWidth;
                                        currentIndex = endIndex;
                                        if (_single) {
                                            x = this._resetTextPositionX(item, style, _singleWidth, width);
                                            y = this._resetTextPositionY(item, style, i + 1);
                                            this.ctx.fillText(_single, x, y);
                                            if (i === lineNum - 1) {
                                                leftOffset = x + _singleWidth;
                                                topOffset = lineHeight * lineNum;
                                            }
                                        }
                                    }
                                    var last = text.substring(currentIndex, length);
                                    var lastWidth = this.measureWidth(last);
                                    if (last) {
                                        x = this._resetTextPositionX(item, style, lastWidth, width);
                                        y = this._resetTextPositionY(item, style, lineNum + 1);
                                        this.ctx.fillText(last, x, y);
                                        leftOffset = x + lastWidth;
                                        topOffset = lineHeight * (lineNum + 1);
                                    }
                                } else {
                                    x = this._resetTextPositionX(item, style, textWidth, width);
                                    y = this._resetTextPositionY(item, style);
                                    this.ctx.fillText(item.text, x, y);
                                    leftOffset = x + textWidth;
                                    topOffset = lineHeight;
                                }
                            } else {
                                // block文本，如果文本长度超过宽度换行
                                if (width && textWidth > width && whiteSpace !== 'nowrap') {
                                    var _lineNum = Math.max(Math.floor(textWidth / width), 1);
                                    var _length = text.length;
                                    var _singleLength = Math.floor(_length / _lineNum);
                                    var _currentIndex = 0;

                                    // lineClamp参数限制最多行数
                                    if (style.lineClamp && _lineNum + 1 > style.lineClamp) {
                                        _lineNum = style.lineClamp - 1;
                                    }
                                    for (var _i = 0; _i < _lineNum; _i++) {
                                        var _this$_getTextSingleL3 = this._getTextSingleLine(text, width, _singleLength, _currentIndex),
                                            _endIndex = _this$_getTextSingleL3.endIndex,
                                            _single2 = _this$_getTextSingleL3.single,
                                            _singleWidth2 = _this$_getTextSingleL3.singleWidth;
                                        _currentIndex = _endIndex;
                                        x = this._resetTextPositionX(item, style, _singleWidth2, width);
                                        y = this._resetTextPositionY(item, style, _i);
                                        this.ctx.fillText(_single2, x, y);
                                    }

                                    // 换行后剩余的文字，超过一行则截断增加省略号
                                    var _last = text.substring(_currentIndex, _length);
                                    var _lastWidth = this.measureWidth(_last);
                                    if (_lastWidth > width) {
                                        var _this$_getTextSingleL4 = this._getTextSingleLine(_last, width, _singleLength),
                                            _single3 = _this$_getTextSingleL4.single,
                                            _singleWidth3 = _this$_getTextSingleL4.singleWidth;
                                        _lastWidth = _singleWidth3;
                                        _last = _single3.substring(0, _single3.length - 1) + '...';
                                    }
                                    x = this._resetTextPositionX(item, style, _lastWidth, width);
                                    y = this._resetTextPositionY(item, style, _lineNum);
                                    this.ctx.fillText(_last, x, y);
                                } else {
                                    x = this._resetTextPositionX(item, style, textWidth, width);
                                    y = this._resetTextPositionY(item, style);
                                    this.ctx.fillText(item.text, x, y);
                                }
                            }
                            this.ctx.draw(true);
                            this._updateProgress(item.progress);
                            if (resolve) {
                                resolve();
                            } else {
                                return {
                                    leftOffset: leftOffset,
                                    topOffset: topOffset
                                };
                            }
                        } catch (e) {
                            reject && reject({
                                errcode: 1004,
                                errmsg: 'drawText error',
                                e: e
                            });
                        }
                    }
                }, {
                    key: "_drawTextBackgroud",
                    value: function _drawTextBackgroud(item, style, textWidth, textHeight, isWxml) {
                        if (!style.width) return;
                        var zoom = isWxml ? 1 : this.zoom;
                        var width = style.width || textWidth;
                        var height = style.height || textHeight;
                        var rectStyle = {
                            fill: style.background,
                            border: style.border
                        };
                        style.padding = style.padding || [0, 0, 0, 0];
                        width += (style.padding[1] || 0) + (style.padding[3] || 0);
                        height += (style.padding[0] || 0) + (style.padding[2] || 0);
                        width = width * zoom;
                        height = height * zoom;
                        this._drawRectToCanvas(item.x, item.y, width, height, rectStyle);
                    }
                }, {
                    key: "_drawCircle",
                    value: function _drawCircle(item, style, resolve, reject, isImage, isWxml) {
                        var zoom = this.zoom;
                        var r = style.r;
                        try {
                            item.x = this._resetPositionX(item, style);
                            item.y = this._resetPositionY(item, style);
                            var url;
                            if (isImage) {
                                var index = this._findPicIndex(item.url);
                                if (index > -1) {
                                    url = this.allPic[index].local;
                                } else {
                                    url = item.url;
                                }
                            }
                            if (!isWxml) {
                                r = r * zoom;
                            }
                            this._drawCircleToCanvas(item.x, item.y, r, style, url);
                            this._updateProgress(item.progress);
                            resolve && resolve();
                        } catch (e) {
                            reject && reject({
                                errcode: isImage ? 1006 : 1005,
                                errmsg: isImage ? 'drawCircleImage error' : 'drawCircle error',
                                e: e
                            });
                        }
                    }
                }, {
                    key: "_drawCircleToCanvas",
                    value: function _drawCircleToCanvas(x, y, r, style, url) {
                        var _this3 = this;
                        var fill = style.fill,
                            border = style.border,
                            boxShadow = style.boxShadow;
                        this.ctx.save();
                        this._drawBoxShadow(boxShadow, function(res) {
                            // 真机上填充渐变色时，没有阴影，先画个相等大小的纯色矩形来实现阴影
                            if (fill && typeof fill !== 'string' || url && res.color) {
                                _this3.ctx.setFillStyle(res.color || '#ffffff');
                                _this3.ctx.beginPath();
                                _this3.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI);
                                _this3.ctx.closePath();
                                _this3.ctx.fill();
                            }
                        });
                        if (url) {
                            this.ctx.save();
                            this.ctx.beginPath();
                            this.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI);
                            this.ctx.clip();
                            this.ctx.drawImage(url, x, y, r * 2, r * 2);
                            this.ctx.closePath();
                            this.ctx.restore();
                        } else {
                            this._setFill(fill, function() {
                                _this3.ctx.beginPath();
                                _this3.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI);
                                _this3.ctx.closePath();
                                _this3.ctx.fill();
                            });
                        }
                        this._drawBorder(border, style, function(border) {
                            _this3.ctx.beginPath();
                            _this3.ctx.arc(x + r, y + r, r + border.width / 2, 0, 2 * Math.PI);
                            _this3.ctx.stroke();
                            _this3.ctx.closePath();
                        });
                        this.ctx.draw(true);
                        this.ctx.restore();
                    }
                }, {
                    key: "_drawLine",
                    value: function _drawLine(item, style, resolve, reject, isWxml) {
                        var zoom = this.zoom;
                        try {
                            var x1 = item.x * zoom + this.translateX;
                            var y1 = item.y * zoom + this.translateY;
                            var x2 = item.x2 * zoom + this.translateX;
                            var y2 = item.y2 * zoom + this.translateY;
                            this._drawLineToCanvas(x1, y1, x2, y2, style);
                            this._updateProgress(item.progress);
                            resolve && resolve();
                        } catch (e) {
                            reject && reject({
                                errcode: 1007,
                                errmsg: 'drawLine error',
                                e: e
                            });
                        }
                    }
                }, {
                    key: "_drawLineToCanvas",
                    value: function _drawLineToCanvas(x1, y1, x2, y2, style) {
                        var stroke = style.stroke,
                            dash = style.dash,
                            boxShadow = style.boxShadow;
                        this.ctx.save();
                        if (stroke) {
                            this._setStroke(stroke);
                        }
                        this._drawBoxShadow(boxShadow);
                        if (dash) {
                            var _dash = [style.dash[0] || 5, style.dash[1] || 5];
                            var offset = style.dash[2] || 0;
                            this.ctx.setLineDash(_dash, offset || 0);
                        }
                        this.ctx.moveTo(x1, y1);
                        this.ctx.setLineWidth((style.width || 1) * this.zoom);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.stroke();
                        this.ctx.draw(true);
                        this.ctx.restore();
                    }

                    // 废弃，合并到_drawRect
                }, {
                    key: "_drawImage",
                    value: function _drawImage(item, style, resolve, reject, isWxml) {
                        var zoom = this.zoom;
                        try {
                            item.x = this._resetPositionX(item, style);
                            item.y = this._resetPositionY(item, style);
                            item.x = item.x + (style.padding[3] || 0);
                            item.y = item.y + (style.padding[0] || 0);
                            var index = this._findPicIndex(item.url);
                            var url = index > -1 ? this.allPic[index].local : item.url;
                            this._drawImageToCanvas(url, item.x, item.y, style.width * zoom, style.height * zoom, style);
                            this._updateProgress(item.progress);
                            resolve && resolve();
                        } catch (e) {
                            reject && reject({
                                errcode: 1012,
                                errmsg: 'drawRect error',
                                e: e
                            });
                        }
                    }

                    // 废弃，合并到_drawRect
                }, {
                    key: "_drawImageToCanvas",
                    value: function _drawImageToCanvas(url, x, y, width, height, style) {
                        var _this4 = this;
                        var fill = style.fill,
                            border = style.border,
                            boxShadow = style.boxShadow;
                        this.ctx.save();
                        this._drawBoxShadow(boxShadow);
                        this.ctx.drawImage(url, x, y, width, height);
                        this._drawBorder(border, style, function(border) {
                            var fixBorder = border.width;
                            _this4.ctx.strokeRect(x - fixBorder / 2, y - fixBorder / 2, width + fixBorder, height + fixBorder);
                        });
                        this.ctx.draw(true);
                        this.ctx.restore();
                    }
                }, {
                    key: "_drawWxml",
                    value: function _drawWxml(item, style, resolve, reject) {
                        var _this5 = this;
                        var self = this;
                        var all = [];
                        try {
                            this._getWxml(item, style).then(function(results) {
                                // 上 -> 下
                                var sorted = self._sortListByTop(results[0]);
                                var count = 0;
                                var progress = 0;
                                Object.keys(sorted).forEach(function(item) {
                                    count += sorted[item].length;
                                });
                                progress = _this5.distance * 3 / (count || 1);
                                all = _this5._drawWxmlBlock(item, sorted, all, progress, results[1]);
                                all = _this5._drawWxmlInline(item, sorted, all, progress, results[1]);
                                Promise.all(all).then(function(results) {
                                    resolve && resolve();
                                }).catch(function(e) {
                                    reject && reject(e);
                                });
                            });
                        } catch (e) {
                            reject && reject({
                                errcode: 1008,
                                errmsg: 'drawWxml error'
                            });
                        }
                    }
                }, {
                    key: "_drawWxmlBlock",
                    value: function _drawWxmlBlock(item, sorted, all, progress, results) {
                        var self = this;
                        // 用来限定位置范围，取相对位置
                        var limitLeft = results ? results.left : 0;
                        var limitTop = results ? results.top : 0;
                        Object.keys(sorted).forEach(function(top, topIndex) {
                            // 左 -> 右
                            var list = sorted[top].sort(function(a, b) {
                                return a.left - b.left;
                            });
                            list = list.filter(function(sub) {
                                return sub.dataset.type && sub.dataset.type.indexOf('inline') === -1;
                            });
                            list.forEach(function(sub, index) {
                                all[index] = new Promise(function(resolve2, reject2) {
                                    sub = self._transferWxmlStyle(sub, item, limitLeft, limitTop);
                                    sub.progress = progress;
                                    var type = sub.dataset.type;
                                    if (sub.dataset.delay) {
                                        setTimeout(function() {
                                            drawWxmlItem();
                                        }, sub.dataset.delay);
                                    } else {
                                        drawWxmlItem();
                                    }

                                    function drawWxmlItem() {
                                        if (type === 'text') {
                                            self._drawWxmlText(sub, resolve2, reject2);
                                        } else if (type === 'image') {
                                            self._drawWxmlImage(sub, resolve2, reject2);
                                        } else if (type === 'radius-image') {
                                            self._drawWxmlCircleImage(sub, resolve2, reject2);
                                        } else if (type === 'background-image') {
                                            self._drawWxmlBackgroundImage(sub, resolve2, reject2);
                                        }
                                    }
                                });
                            });
                        });
                        return all;
                    }
                }, {
                    key: "_drawWxmlInline",
                    value: function _drawWxmlInline(item, sorted, all, progress, results) {
                        var self = this;
                        var topOffset = 0;
                        var leftOffset = 0;
                        var lastTop = 0;
                        var limitLeft = results ? results.left : 0;
                        var limitTop = results ? results.top : 0;
                        var p = new Promise(function(resolve2, reject2) {
                            var maxWidth = 0;
                            var minLeft = Infinity;
                            var maxRight = 0;

                            // 找出同一top下的最小left和最大right，得到最大的宽度，用于换行
                            Object.keys(sorted).forEach(function(top) {
                                var inlineList = sorted[top].filter(function(sub) {
                                    return sub.dataset.type && sub.dataset.type.indexOf('inline') > -1;
                                });
                                inlineList.forEach(function(sub) {
                                    if (sub.left < minLeft) {
                                        minLeft = sub.left;
                                    }
                                    if (sub.right > maxRight) {
                                        maxRight = sub.right;
                                    }
                                });
                            });
                            maxWidth = Math.ceil(maxRight - minLeft || self.width);
                            Object.keys(sorted).forEach(function(top, topIndex) {
                                // 左 -> 右
                                var list = sorted[top].sort(function(a, b) {
                                    return a.left - b.left;
                                });

                                // 换行的行内元素left放到后面，version2.0.6后无法获取高度，改用bottom值来判断是否换行了
                                var position = -1;
                                for (var i = 0, len = list.length; i < len; i++) {
                                    if (list[i] && list[i + 1]) {
                                        if (list[i].bottom > list[i + 1].bottom) {
                                            position = i;
                                            break;
                                        }
                                    }
                                }
                                if (position > -1) {
                                    list.push(list.splice(position, 1)[0]);
                                }
                                var inlineList = list.filter(function(sub) {
                                    return sub.dataset.type && sub.dataset.type.indexOf('inline') > -1;
                                });
                                var originLeft = inlineList[0] ? inlineList[0].left : 0;
                                // 换行后和top不相等时，认为是换行了，要清除左边距；当左偏移量大于最大宽度时，也要清除左边距; 当左偏移小于左边距时，也要清除
                                if (Math.abs(topOffset + lastTop - top) > 2 || leftOffset - originLeft - limitLeft >= maxWidth || leftOffset <= originLeft - limitLeft - 2) {
                                    leftOffset = 0;
                                }
                                lastTop = +top;
                                topOffset = 0;
                                inlineList.forEach(function(sub, index) {
                                    sub = self._transferWxmlStyle(sub, item, limitLeft, limitTop);
                                    sub.progress = progress;
                                    var type = sub.dataset.type;
                                    if (type === 'inline-text') {
                                        var drawRes = self._drawWxmlInlineText(sub, leftOffset, maxWidth);
                                        leftOffset = drawRes.leftOffset;
                                        topOffset = drawRes.topOffset;
                                    } else if (type === 'inline-image') {
                                        var _drawRes = self._drawWxmlImage(sub) || {};
                                        leftOffset = _drawRes.leftOffset || 0;
                                        topOffset = _drawRes.topOffset || 0;
                                    }
                                });
                            });
                            resolve2();
                        });
                        all.push(p);
                        return all;
                    }
                }, {
                    key: "_drawWxmlInlineText",
                    value: function _drawWxmlInlineText(sub) {
                        var leftOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                        var maxWidth = arguments.length > 2 ? arguments[2] : undefined;
                        var text = sub.dataset.text || '';
                        if (sub.dataset.maxlength && text.length > sub.dataset.maxlength) {
                            text = text.substring(0, sub.dataset.maxlength) + '...';
                        }
                        var textData = {
                            text: text,
                            originX: sub.left,
                            x: leftOffset ? leftOffset : sub.left,
                            y: sub.top,
                            progress: sub.progress,
                            leftOffset: leftOffset,
                            maxWidth: maxWidth // 行内元素的最大宽度，取决于limit的宽度
                        };

                        if (sub.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                            sub.background = sub.backgroundColor;
                        } else {
                            sub.background = 'rgba(0, 0, 0, 0)';
                        }
                        if (sub.dataset.background) {
                            sub.background = sub.dataset.background;
                        }
                        var res = this._drawText(textData, sub, null, null, 'inline-text', 'wxml');
                        return res;
                    }
                }, {
                    key: "_drawWxmlText",
                    value: function _drawWxmlText(sub, resolve, reject) {
                        var text = sub.dataset.text || '';
                        if (sub.dataset.maxlength && text.length > sub.dataset.maxlength) {
                            text = text.substring(0, sub.dataset.maxlength) + '...';
                        }
                        var textData = {
                            text: text,
                            x: sub.left,
                            y: sub.top,
                            progress: sub.progress
                        };
                        if (sub.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                            sub.background = sub.backgroundColor;
                        } else {
                            sub.background = 'rgba(0, 0, 0, 0)';
                        }
                        if (sub.dataset.background) {
                            sub.background = sub.dataset.background;
                        }
                        this._drawText(textData, sub, resolve, reject, 'text', 'wxml');
                    }
                }, {
                    key: "_drawWxmlImage",
                    value: function _drawWxmlImage(sub, resolve, reject) {
                        var imageData = {
                            url: sub.dataset.url,
                            x: sub.left,
                            y: sub.top,
                            progress: sub.progress
                        };
                        var res = this._drawRect(imageData, sub, resolve, reject, 'image', 'inline-wxml');
                        return res;
                    }
                }, {
                    key: "_drawWxmlCircleImage",
                    value: function _drawWxmlCircleImage(sub, resolve, reject) {
                        var imageData = {
                            url: sub.dataset.url,
                            x: sub.left,
                            y: sub.top,
                            progress: sub.progress
                        };
                        sub.r = sub.width / 2;
                        this._drawCircle(imageData, sub, resolve, reject, true, 'wxml');
                    }
                }, {
                    key: "_drawWxmlBackgroundImage",
                    value: function _drawWxmlBackgroundImage(sub, resolve, reject) {
                        var url = sub.dataset.url;
                        var index = this._findPicIndex(url);
                        url = index > -1 ? this.allPic[index].local : url;
                        var size = sub.backgroundSize.replace(/px/g, '').split(' ');
                        var imageData = {
                            url: url,
                            x: sub.left,
                            y: sub.top,
                            progress: sub.progress
                        };
                        this._drawRect(imageData, sub, resolve, reject, 'image', 'wxml');
                    }
                }, {
                    key: "_getWxml",
                    value: function _getWxml(item, style) {
                        var self = this;
                        var query;
                        if (this.obj) {
                            query = wx.createSelectorQuery().in(this.obj);
                        } else {
                            query = wx.createSelectorQuery();
                        }
                        var p1 = new Promise(function(resolve, reject) {
                            // 会触发两次，要限制
                            var count = 0;
                            query.selectAll("".concat(item.class)).fields({
                                dataset: true,
                                size: true,
                                rect: true,
                                computedStyle: ['width', 'height', 'font', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'textAlign', 'color', 'lineHeight', 'border', 'borderColor', 'borderStyle', 'borderWidth', 'verticalAlign', 'boxShadow', 'background', 'backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom']
                            }, function(res) {
                                if (count++ === 0) {
                                    var formated = self._formatImage(res);
                                    var list = formated.list;
                                    res = formated.res;
                                    self._preloadImage(list).then(function(result) {
                                        resolve(res);
                                    }).catch(function(res) {
                                        reject && reject({
                                            errcode: 1009,
                                            errmsg: 'drawWxml preLoadImage error'
                                        });
                                    });
                                }
                            }).exec();
                        });
                        var p2 = new Promise(function(resolve, reject) {
                            if (!item.limit) {
                                resolve({
                                    top: 0,
                                    width: self.width / self.zoom
                                });
                            }
                            query.select("".concat(item.limit)).fields({
                                dataset: true,
                                size: true,
                                rect: true
                            }, function(res) {
                                resolve(res);
                            }).exec();
                        });
                        return Promise.all([p1, p2]);
                    }
                }, {
                    key: "_getLineHeight",
                    value: function _getLineHeight(style) {
                        var zoom = this.zoom;
                        if (style.dataset && style.dataset.type) {
                            zoom = 1;
                        }
                        var lineHeight;
                        if (!isNaN(style.lineHeight) && style.lineHeight > style.fontSize) {
                            lineHeight = style.lineHeight;
                        } else {
                            style.lineHeight = (style.lineHeight || '') + '';
                            lineHeight = +style.lineHeight.replace('px', '');
                            lineHeight = lineHeight ? lineHeight : (style.fontSize || 14) * 1.2;
                        }
                        return lineHeight * zoom;
                    }
                }, {
                    key: "_formatImage",
                    value: function _formatImage() {
                        var res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                        var list = [];
                        res.forEach(function(item, index) {
                            var dataset = item.dataset;
                            var uid = Util.getUid();
                            var filename = "".concat(wx.env.USER_DATA_PATH, "/").concat(uid, ".png");
                            if ((dataset.type === "image" || dataset.type === "radius-image") && dataset.url) {
                                var sub = {
                                    url: dataset.base64 ? filename : dataset.url,
                                    isBase64: dataset.base64 ? dataset.url : false
                                };
                                res[index].dataset = Object.assign(res[index].dataset, sub);
                                list.push(sub);
                            } else if (dataset.type === 'background-image' && item.backgroundImage.indexOf('url') > -1) {
                                var url = item.backgroundImage.replace(/url\((\"|\')?/, '').replace(/(\"|\')?\)$/, '');
                                var _sub = {
                                    url: dataset.base64 ? filename : url,
                                    isBase64: dataset.base64 ? url : false
                                };
                                res[index].dataset = Object.assign(res[index].dataset, _sub);
                                list.push(_sub);
                            }
                        });
                        return {
                            list: list,
                            res: res
                        };
                    }
                }, {
                    key: "_updateProgress",
                    value: function _updateProgress(distance) {
                        this.progressPercent += distance;
                        this.progress(this.progressPercent);
                    }
                }, {
                    key: "_sortListByTop",
                    value: function _sortListByTop() {
                        var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                        var sorted = {};

                        // 粗略地认为2px相差的元素在同一行
                        list.forEach(function(item, index) {
                            var top = item.top;
                            if (!sorted[top]) {
                                if (sorted[top - 2]) {
                                    top = top - 2;
                                } else if (sorted[top - 1]) {
                                    top = top - 1;
                                } else if (sorted[top + 1]) {
                                    top = top + 1;
                                } else if (sorted[top + 2]) {
                                    top = top + 2;
                                } else {
                                    sorted[top] = [];
                                }
                            }
                            sorted[top].push(item);
                        });
                        return sorted;
                    }
                }, {
                    key: "_parseNumber",
                    value: function _parseNumber(number) {
                        return isNaN(number) ? +(number || '').replace('px', '') : number;
                    }
                }, {
                    key: "_transferWxmlStyle",
                    value: function _transferWxmlStyle(sub, item, limitLeft, limitTop) {
                        var leftFix = +sub.dataset.left || 0;
                        var topFix = +sub.dataset.top || 0;
                        sub.width = this._parseNumber(sub.width);
                        sub.height = this._parseNumber(sub.height);
                        sub.left = this._parseNumber(sub.left) - limitLeft + (leftFix + (item.x || 0)) * this.zoom;
                        sub.top = this._parseNumber(sub.top) - limitTop + (topFix + (item.y || 0)) * this.zoom;
                        var padding = sub.dataset.padding || '0 0 0 0';
                        if (typeof padding === 'string') {
                            padding = Util.transferPadding(padding);
                        }
                        var paddingTop = Number(sub.paddingTop.replace('px', '')) + Number(padding[0]);
                        var paddingRight = Number(sub.paddingRight.replace('px', '')) + Number(padding[1]);
                        var paddingBottom = Number(sub.paddingBottom.replace('px', '')) + Number(padding[2]);
                        var paddingLeft = Number(sub.paddingLeft.replace('px', '')) + Number(padding[3]);
                        sub.padding = [paddingTop, paddingRight, paddingBottom, paddingLeft];
                        return sub;
                    }

                    /**
                     * 支持负值绘制，从右边计算
                     * @param {*} item
                     * @param {*} style
                     */
                }, {
                    key: "_resetPositionX",
                    value: function _resetPositionX(item, style) {
                        var zoom = this.zoom;
                        var x = 0;
                        if (style.dataset && style.dataset.type) {
                            zoom = 1;
                        }

                        // 通过wxml获取的不需要重置坐标
                        if (item.x < 0 && item.type) {
                            x = this.width + item.x * zoom - style.width * zoom;
                        } else {
                            x = item.x * zoom;
                        }
                        if (parseInt(style.borderWidth)) {
                            x += parseInt(style.borderWidth);
                        }
                        return x + this.translateX;
                    }

                    /**
                     * 支持负值绘制，从底部计算
                     * @param {*} item
                     * @param {*} style
                     */
                }, {
                    key: "_resetPositionY",
                    value: function _resetPositionY(item, style, textHeight) {
                        var zoom = this.zoom;
                        var y = 0;
                        if (style.dataset && style.dataset.type) {
                            zoom = 1;
                        }
                        if (item.y < 0) {
                            y = this.height + item.y * zoom - (textHeight ? textHeight : style.height * zoom);
                        } else {
                            y = item.y * zoom;
                        }
                        if (parseInt(style.borderWidth)) {
                            y += parseInt(style.borderWidth);
                        }
                        return y + this.translateY;
                    }

                    /**
                     * 文字的padding、text-align
                     * @param {*} item
                     * @param {*} style
                     * @param {*} textWidth
                     */
                }, {
                    key: "_resetTextPositionX",
                    value: function _resetTextPositionX(item, style, textWidth, width) {
                        var textAlign = style.textAlign || 'left';
                        var x = item.x;
                        if (textAlign === 'center') {
                            x = (width - textWidth) / 2 + item.x;
                        } else if (textAlign === 'right') {
                            x = width - textWidth + item.x;
                        }
                        var left = style.padding ? style.padding[3] || 0 : 0;
                        return x + left + this.translateX;
                    }

                    /**
                     * 文字的padding、text-align
                     * @param {*} item
                     * @param {*} style
                     * @param {*} textWidth
                     */
                }, {
                    key: "_resetTextPositionY",
                    value: function _resetTextPositionY(item, style) {
                        var lineNum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
                        var zoom = this.zoom;
                        if (style.dataset && style.dataset.type) {
                            zoom = 1;
                        }
                        var lineHeight = this._getLineHeight(style);
                        var fontSize = Math.ceil((style.fontSize || 14) * zoom);
                        var blockLineHeightFix = (style.dataset && style.dataset.type || '').indexOf('inline') > -1 ? 0 : (lineHeight - fontSize) / 2;
                        var top = style.padding ? style.padding[0] || 0 : 0;

                        // y + lineheight偏移 + 行数 + paddingTop + 整体画布位移
                        return item.y + blockLineHeightFix + lineNum * lineHeight + top + this.translateY;
                    }

                    /**
                     * 当文本超过宽度时，计算每一行应该绘制的文本
                     * @param {*} text
                     * @param {*} width
                     * @param {*} singleLength
                     * @param {*} currentIndex
                     * @param {*} widthOffset
                     */
                }, {
                    key: "_getTextSingleLine",
                    value: function _getTextSingleLine(text, width, singleLength) {
                        var currentIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
                        var widthOffset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
                        var offset = 0;
                        var endIndex = currentIndex + singleLength + offset;
                        var single = text.substring(currentIndex, endIndex);
                        var singleWidth = this.measureWidth(single);
                        while (Math.round(widthOffset + singleWidth) > width) {
                            offset--;
                            endIndex = currentIndex + singleLength + offset;
                            single = text.substring(currentIndex, endIndex);
                            singleWidth = this.measureWidth(single);
                        }
                        return {
                            endIndex: endIndex,
                            single: single,
                            singleWidth: singleWidth
                        };
                    }
                }, {
                    key: "_drawBorder",
                    value: function _drawBorder(border, style, callback) {
                        var zoom = this.zoom;
                        if (style.dataset && style.dataset.type) {
                            zoom = 1;
                        }
                        border = Util.transferBorder(border);
                        if (border && border.width) {
                            // 空白阴影，清空掉边框的阴影
                            this._drawBoxShadow();
                            if (border) {
                                this.ctx.setLineWidth(border.width * zoom);
                                if (border.style === 'dashed') {
                                    var dash = style.dash || [5, 5, 0];
                                    var offset = dash[2] || 0;
                                    var array = [dash[0] || 5, dash[1] || 5];
                                    this.ctx.setLineDash(array, offset);
                                }
                                this.ctx.setStrokeStyle(border.color);
                            }
                            callback && callback(border);
                        }
                    }
                }, {
                    key: "_drawBoxShadow",
                    value: function _drawBoxShadow(boxShadow, callback) {
                        boxShadow = Util.transferBoxShadow(boxShadow);
                        if (boxShadow) {
                            this.ctx.setShadow(boxShadow.offsetX, boxShadow.offsetY, boxShadow.blur, boxShadow.color);
                        } else {
                            this.ctx.setShadow(0, 0, 0, '#ffffff');
                        }
                        callback && callback(boxShadow || {});
                    }
                }, {
                    key: "_setFill",
                    value: function _setFill(fill, callback) {
                        if (fill) {
                            if (typeof fill === 'string') {
                                this.ctx.setFillStyle(fill);
                            } else {
                                var line = fill.line;
                                var color = fill.color;
                                var grd = this.ctx.createLinearGradient(line[0], line[1], line[2], line[3]);
                                grd.addColorStop(0, color[0]);
                                grd.addColorStop(1, color[1]);
                                this.ctx.setFillStyle(grd);
                            }
                            callback && callback();
                        }
                    }
                }, {
                    key: "_setStroke",
                    value: function _setStroke(stroke, callback) {
                        if (stroke) {
                            if (typeof stroke === 'string') {
                                this.ctx.setStrokeStyle(stroke);
                            } else {
                                var line = stroke.line;
                                var color = stroke.color;
                                var grd = this.ctx.createLinearGradient(line[0], line[1], line[2], line[3]);
                                grd.addColorStop(0, color[0]);
                                grd.addColorStop(1, color[1]);
                                this.ctx.setStrokeStyle(grd);
                            }
                            callback && callback();
                        }
                    }
                }]);
                return Wxml2Canvas;
            }();
            if (!exports.__esModule) Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = Wxml2Canvas;
        }, function(modId) {
            var map = {
                "./util": 1711542553247
            };
            return __REQUIRE__(map[modId], modId);
        });
        __DEFINE__(1711542553247, function(require, module, exports) {
            /**
             * 获取字符的长度，full为true时，一个汉字算两个长度
             * @param {String} str
             * @param {Boolean} full
             */

            function getTextLength(str, full) {
                var len = 0;
                for (var i = 0; i < str.length; i++) {
                    var c = str.charCodeAt(i);
                    //单字节加1 
                    if (c >= 0x0001 && c <= 0x007e || 0xff60 <= c && c <= 0xff9f) {
                        len++;
                    } else {
                        len += full ? 2 : 1;
                    }
                }
                return len;
            }

            /**
             * rgba(255, 255, 255, 1) => #ffffff
             * @param {String} color
             */
            function transferColor() {
                var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                var res = '#';
                color = color.replace(/^rgba?\(/, '').replace(/\)$/, '');
                color = color.split(', ');
                color.length > 3 ? color.length = 3 : '';
                var _iterator = _createForOfIteratorHelper2(color),
                    _step;
                try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                        var item = _step.value;
                        item = parseInt(item || 0);
                        if (item < 10) {
                            res += '0' + item;
                        } else {
                            res += item.toString(16);
                        }
                    }
                } catch (err) {
                    _iterator.e(err);
                } finally {
                    _iterator.f();
                }
                return res;
            }

            function transferBorder() {
                var border = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                var res = border.match(/(\w+)px\s(\w+)\s(.*)/);
                var obj = {};
                if (res) {
                    obj = {
                        width: +res[1],
                        style: res[2],
                        color: res[3]
                    };
                }
                return res ? obj : null;
            }

            /**
             * 内边距，依次为上右下左
             * @param {*} padding
             */
            function transferPadding() {
                    var padding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '0 0 0 0';
                    padding = padding.split(' ');
                    for (var i = 0, len = padding.length; i < len; i++) {
                        padding[i] = +padding[i].replace('px', '');
                    }
                    return padding;
                }
                /**
                 * type1: 0, 25, 17, rgba(0, 0, 0, 0.3)
                 * type2: rgba(0, 0, 0, 0.3) 0px 25px 17px 0px => (0, 25, 17, rgba(0, 0, 0, 0.3))
                 * @param {*} shadow
                 */
            function transferBoxShadow() {
                var shadow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                var type = arguments.length > 1 ? arguments[1] : undefined;
                if (!shadow || shadow === 'none') return;
                var color;
                var split;
                split = shadow.match(/(\w+)\s(\w+)\s(\w+)\s(rgb.*)/);
                if (split) {
                    split.shift();
                    shadow = split;
                    color = split[3] || '#ffffff';
                } else {
                    split = shadow.split(') ');
                    color = split[0] + ')';
                    shadow = split[1].split('px ');
                }
                return {
                    offsetX: +shadow[0] || 0,
                    offsetY: +shadow[1] || 0,
                    blur: +shadow[2] || 0,
                    color: color
                };
            }

            function getUid(prefix) {
                prefix = prefix || '';
                return prefix + 'xxyxxyxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0;
                    var v = c === 'x' ? r : r & 0x3 | 0x8;
                    return v.toString(16);
                });
            }
            if (!exports.__esModule) Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = {
                getTextLength: getTextLength,
                transferBorder: transferBorder,
                transferColor: transferColor,
                transferPadding: transferPadding,
                transferBoxShadow: transferBoxShadow,
                getUid: getUid
            };
        }, function(modId) {
            var map = {};
            return __REQUIRE__(map[modId], modId);
        });
        return __REQUIRE__(1711542553245);
    }();
    //miniprogram-npm-outsideDeps=[]
    //# sourceMappingURL=index.js.map