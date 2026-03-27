var _wxml2canvas = _interopRequireDefault(require("wxml2canvas"));
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/position-info/index.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        data: {
            itemData: {},
            itemShare: "",
            staticImageUrl: _api.default.staticImageUrl,
            options: {
                scene: true,
                id: true
            },
            locations: false
        },
        onLoad: function onLoad(options) {
            console.log(options, "options");
            this.setData({
                options: options,
                locations: !!options.latitude
            });
        },
        onShow: function onShow() {
            var _this = this;
            console.log(app.globalData.loginStatus, "getEnterOptionsSync");
            if (wx.getStorageSync('token')) {
                console.log('存在token');
                if (app.globalData.loginStatus !== 1) {
                    _event.default.on('getTokenSuccess', this, function() {
                        _event.default.remove('getTokenSuccess', _this);
                        console.log('是否进入getTokenSuccess函数');
                        if (_this.data.options.scene) {
                            console.log('菊花码进来的');
                            _this.getSharePositionIdByKey(_this.data.options.scene);
                        } else {
                            console.log('微信分享进来');
                            _this.getDetailData();
                        }
                    });
                } else {
                    if (this.data.options.scene) {
                        console.log('菊花码进来的');
                        this.getSharePositionIdByKey(this.data.options.scene);
                    } else {
                        console.log('微信分享进来');
                        this.getDetailData();
                    }
                }
            } else {
                console.log('没有token');
                if (this.data.options.scene) {
                    this.getSharePositionIdByKey(this.data.options.scene);
                } else {
                    this.getDetailData();
                }
            }
        },
        getSharePositionIdByKey: function getSharePositionIdByKey(scene) {
            var _this2 = this;
            util.request({
                url: _api.default.getSharePositionIdByKey,
                method: "GET",
                data: {
                    key: scene
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    console.log(result.data.data);
                    _this2.data.options.id = result.data.data;
                    _this2.setData({
                        options: _this2.data.options
                    });
                    _this2.getDetailData();
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        addJobApply: function addJobApply() {
            this.getDetailData();
            // event.emit('changeItemData', this.data.options.id)
        },
        favoritePostion: function favoritePostion() {
            var _this3 = this;
            if (app.globalData.loginStatus == 0) {
                wx.navigateTo({
                    url: "/pages/login/login"
                });
                return;
            }
            var status = 0;
            if (this.data.itemData.isFavorite) {
                status = 1;
            } else {
                status = 0;
            }
            util.request({
                url: _api.default.collectionCancel,
                method: "POST",
                data: {
                    positionId: this.data.options.id,
                    status: status,
                    userId: app.globalData.userInfo.userId
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    if (status == 0) {
                        wx.showToast({
                            title: _this3.data.$language.positioncollection,
                            icon: 'none',
                            duration: 2000
                        });
                    } else {
                        wx.showToast({
                            title: _this3.data.$language.cancelCollection,
                            icon: 'none',
                            duration: 2000
                        });
                    }
                    _this3.getDetailData();
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        getDetailData: function getDetailData() {
            var _this4 = this;
            var params = {
                positionId: this.data.options.id
            };
            if (app.globalData.loginStatus == 1) {
                params.userId = app.globalData.userInfo.userId;
            }
            if (this.data.options.latitude) {
                params.latitude = this.data.options.latitude;
                params.longitude = this.data.options.longitude;
            }
            util.request({
                url: _api.default.positionDetail,
                method: "POST",
                data: params
            }).then(function(_ref) {
                var _ref$data = _ref.data,
                    code = _ref$data.code,
                    data = _ref$data.data,
                    message = _ref$data.message;
                if (code === 0) {
                    if (data.distance) {
                        data.distance = (data.distance / 1000).toFixed(2) + 'KM';
                    }
                    _this4.setData({
                        itemData: data
                    });
                    if (!data.addressLatitude || !data.addressLongitude) {
                        _this4.setData({
                            locations: false
                        });
                    }
                } else {
                    util.toastUtil(message);
                }
            }).catch(function(error) {});
        },
        onShare: function onShare() {
            var _this5 = this;
            wx.showLoading({
                title: this.data.$language.timeloading
            });
            util.request({
                url: _api.default.sharePosition,
                method: "POST",
                data: {
                    page: "pages/position-info/index",
                    positionId: this.data.options.id,
                    userId: app.globalData.userInfo.userId
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this5.tempFile(result.data.data);
                } else {
                    util.toastUtil(result.data.message);
                    wx.hideLoading();
                }
            }).catch(function(error) {});
        },
        tempFile: function tempFile(base64Value) {
            var time = new Date().getTime();
            var imgPath = wx.env.USER_DATA_PATH + "/poster" + time + "share" + ".png";
            var imageData = base64Value.replace(/^data:image\/\w+;base64,/, "");
            var fs = wx.getFileSystemManager();
            fs.writeFileSync(imgPath, imageData, "base64");
            fs.close();
            this.setData({
                itemShare: imgPath
            });
            console.log(this.data.itemShare, "this.data.itemShare");
            this.toggleShow(true);
            wx.hideLoading();
        },
        doClose: function doClose() {
            this.toggleShow(false);
        },
        toggleShow: function toggleShow(boolean) {
            this.setData({
                show: boolean
            });
        },
        drawMyCanvas: function drawMyCanvas() {
            wx.showLoading({
                title: this.data.$language.savingLoading
            });
            var that = this;
            var query = wx.createSelectorQuery().in(this);
            query.select('#my-canvas').fields({
                // 选择需要生成canvas的范围
                size: true,
                scrollOffset: false
            }, function(data) {
                var width = data.width;
                var height = data.height;
                that.setData({
                    width: width,
                    height: height
                });
                setTimeout(function() {
                    that.startDraw();
                }, 1500);
            }).exec();
        },
        startDraw: function startDraw() {
            var that = this;
            var drawMyImage = new _wxml2canvas.default({
                element: 'myCanvas',
                // canvas的id,
                obj: that,
                // 传入当前组件的this
                width: that.data.width * 2,
                height: that.data.height * 2,
                background: '#fff',
                // 生成图片的背景色
                progress: function progress(percent) { // 进度
                },
                finish: function finish(url) {
                    // 生成的图片
                    wx.hideLoading();
                    that.savePoster(url);
                },
                error: function error(res) {
                    // 失败原因
                    console.log(res, '失败原因');
                    wx.hideLoading();
                }
            }, this);
            var data = {
                list: [{
                    type: 'wxml',
                    class: '.my_canvas .my_draw_canvas',
                    // my_canvas要绘制的wxml元素根类名， my_draw_canvas单个元素的类名（所有要绘制的单个元素都要添加该类名）
                    limit: '.my_canvas',
                    // 要绘制的wxml元素根类名
                    x: 0,
                    y: 0
                }]
            };
            // 绘制canvas
            drawMyImage.draw(data, this);
        },
        savePoster: function savePoster(url) {
            var that = this;
            wx.saveImageToPhotosAlbum({
                filePath: url,
                success: function success() {
                    wx.showToast({
                        title: that.data.$language.resumeUpload.submitSuccess,
                        icon: 'none'
                    });
                },
                fail: function fail(err) {
                    if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
                        wx.showModal({
                            title: that.data.$language.common.tip,
                            content: that.data.$language.authorizationalbum,
                            showCancel: false,
                            success: function success(modalSuccess) {
                                wx.openSetting({
                                    success: function success(settingdata) {
                                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                            wx.saveImageToPhotosAlbum({
                                                filePath: url,
                                                success: function success() {
                                                    wx.showToast({
                                                        title: that.data.$language.resumeUpload.submitSuccess,
                                                        icon: 'success',
                                                        duration: 2000
                                                    });
                                                }
                                            });
                                        } else {
                                            wx.showToast({
                                                title: that.data.$language.authorizationFail,
                                                icon: 'none',
                                                duration: 1500
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        },
        gengduo: function gengduo() {
            wx.switchTab({
                url: '/pages/position/position',
                success: function success() {
                    // event.emit('refreshPostionData')
                }
            });
        },
        deliver: function deliver(e) {
            if (this.data.itemData.status == 2) {
                util.toastUtil(this.data.$language.stopRecruit);
                return;
            }
            var biographicalNotes = this.selectComponent('#biographicalNotes');
            biographicalNotes.onTrue();
        },
        onShareAppMessage: function onShareAppMessage() {
            var positionName = '';
            if (this.data.$language.locale === 'en_US' && this.data.itemData.positionNameEn) {
                positionName = this.data.itemData.positionNameEn;
            } else {
                positionName = this.data.itemData.positionName;
            }
            return {
                title: positionName + ',' + this.data.$language.hotRecruit + '~',
                imageUrl: this.data.staticImageUrl + 'share.png?v=1',
                path: 'pages/position-info/index?id=' + this.data.itemData.id
            };
        },
        onNavMap: function onNavMap() {
            var mapContext = wx.createMapContext("mapNav", this);
            var _this$data$itemData = this.data.itemData,
                addressLatitude = _this$data$itemData.addressLatitude,
                addressLongitude = _this$data$itemData.addressLongitude,
                addressName = _this$data$itemData.addressName,
                fullAddress = _this$data$itemData.fullAddress;
            mapContext.openMapApp({
                latitude: addressLatitude,
                longitude: addressLongitude,
                destination: fullAddress || addressName || ''
            });
        },
        onCall: function onCall() {
            wx.makePhoneCall({
                phoneNumber: this.data.itemData.recruitPhone
            });
        }
    });