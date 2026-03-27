var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/personalCenter/personalCenter.js

    var util = require("@/utils/util.js");
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            loginStatus: 0,
            logoffStatus: false,
            userData: {},
            staticImageUrl: _api.default.staticImageUrl,
            deliveryNum: 0,
            collectionNum: 0,
            avatarUrl: ""
        },
        userLoginOut: function userLoginOut() {
            var _this = this;
            wx.showModal({
                title: this.data.$language.common.tip,
                content: this.data.$language.mine.showModalDesc,
                confirmText: this.data.$language.common.confirm,
                cancelText: this.data.$language.common.cancel,
                confirmColor: "#824C96",
                success: function success(res) {
                    if (res.confirm) {
                        util.request({
                            url: _api.default.userLoginOut,
                            method: "GET"
                        }).then(function(result) {
                            console.log(result, "API.userLoginOut");
                            if (result.data.code == 0) {
                                app.globalData.loginStatus = 0;
                                app.globalData.userInfo = {};
                                wx.setStorageSync("token", "");
                                _this.setData({
                                    loginStatus: 0,
                                    resumeNum: 0,
                                    deliveryNum: 0,
                                    collectionNum: 0
                                });
                                util.toastUtil(_this.data.$language.mine.exitSuccessful);
                                // event.emit('refreshPostionData')
                            } else {
                                util.toastUtil(result.data.message);
                            }
                        }).catch(function(error) {});
                    }
                }
            });
        },
        toPage: function toPage(e) {
            if (this.data.loginStatus == 0) {
                wx.navigateTo({
                    url: "/pages/login/login"
                });
                return;
            }
            var pageName = e.currentTarget.dataset.pagename;
            // 前往人事助手H5页面
            if (pageName === "personnelAssistant") {
                this.toPersonnelAssistant(e.currentTarget.dataset.src);
                return;
            }
            wx.navigateTo({
                url: e.currentTarget.dataset.src
            });
        },
        toPersonnelAssistant: function toPersonnelAssistant(page) {
            var obj = wx.getAccountInfoSync();
            var host = obj.miniProgram.envVersion === "release" ? "https://yzs.yto.net.cn" : "https://yzs.yto56test.com";
            var phone = encodeURIComponent(app.globalData.userInfo.encryptPhone);
            var Authorization = wx.getStorageSync("token");
            var lang = this.data.$language.locale.toLowerCase();
            var url = encodeURIComponent("".concat(host, "/applet/entry?Authorization=").concat(Authorization, "&lang=").concat(lang, "&phone=").concat(phone));
            wx.navigateTo({
                url: "".concat(page, "?h5Url=").concat(url)
            });
        },
        goCompanyProfile: function goCompanyProfile() {
            wx.switchTab({
                url: "/pages/companyProfile/companyProfile"
            });
        },
        logoff: function logoff() {
            this.setData({
                logoffStatus: true
            });
        },
        onlogoffStatusClose: function onlogoffStatusClose() {
            this.setData({
                logoffStatus: false
            });
        },
        onlogoffStatusSubmit: function onlogoffStatusSubmit() {
            var _this2 = this;
            util.request({
                url: _api.default.userLoginOff,
                method: "get"
            }).then(function(result) {
                if (result.data.code === 0) {
                    wx.setStorageSync("token", "");
                    _this2.setData({
                        logoffStatus: false,
                        loginStatus: 0,
                        resumeNum: 0,
                        deliveryNum: 0,
                        collectionNum: 0
                    });
                    app.globalData.loginStatus = 0;
                    app.globalData.userInfo = {};
                    util.toastUtil(_this2.data.$language.mine.cancelAccountTips);
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {
                console.log(error);
            });
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {},
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {},
        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function onShow() {
            var _this3 = this;
            this.getAvatar();
            if (wx.getStorageSync("token")) {
                if (app.globalData.loginStatus !== 1) {
                    _event.default.on("getTokenSuccess", this, function() {
                        _event.default.remove("getTokenSuccess", _this3);
                        _this3.setData({
                            loginStatus: app.globalData.loginStatus,
                            userData: app.globalData.userInfo
                        });
                        _this3.getNumber();
                    });
                    return;
                }
                this.setData({
                    loginStatus: app.globalData.loginStatus,
                    userData: app.globalData.userInfo
                });
                this.getNumber();
            } else {
                this.setData({
                    loginStatus: app.globalData.loginStatus,
                    userData: app.globalData.userInfo,
                    resumeNum: 0,
                    deliveryNum: 0,
                    collectionNum: 0
                });
            }
        },
        getAvatar: function getAvatar() {
            var _app$globalData$userI,
                _app$globalData$userI2,
                _this4 = this;
            if (!((_app$globalData$userI = app.globalData.userInfo) !== null && _app$globalData$userI !== void 0 && _app$globalData$userI.headerImg)) {
                this.setData({
                    avatarUrl: "".concat(_api.default.staticImageUrl, "default.png?v=1")
                });
                return;
            }
            util.request({
                url: _api.default.fileDownload,
                method: "get",
                responseType: "arraybuffer",
                data: {
                    path: (_app$globalData$userI2 = app.globalData.userInfo) === null || _app$globalData$userI2 === void 0 ? void 0 : _app$globalData$userI2.headerImg
                }
            }).then(function(res) {
                var codeImg = "data:image/png;base64," + wx.arrayBufferToBase64(res.data);
                _this4.setData({
                    avatarUrl: codeImg
                });
            });
        },
        getNumber: function getNumber() {
            this.getDeliveryNum(); //投递数量
            this.getCollectionNum(); //收藏数量
        },
        getDeliveryNum: function getDeliveryNum() {
            var _this5 = this;
            util.request({
                url: _api.default.positionNumber,
                method: "get"
            }).then(function(result) {
                if (result.data.code === 0) {
                    if (Number(result.data.data) >= 100) {
                        result.data.data = "99+";
                    }
                    _this5.setData({
                        deliveryNum: result.data.data
                    });
                } else {}
            }).catch(function(error) {});
        },
        getCollectionNum: function getCollectionNum() {
            var _this6 = this;
            util.request({
                url: _api.default.collectionNumber,
                method: "get"
            }).then(function(result) {
                if (result.data.code === 0) {
                    if (Number(result.data.data) >= 100) {
                        result.data.data = "99+";
                    }
                    _this6.setData({
                        collectionNum: result.data.data
                    });
                } else {}
            }).catch(function(error) {});
        },
        onChooseAvatar: function onChooseAvatar(e) {
            var _this7 = this;
            var avatarUrl = e.detail.avatarUrl;
            wx.showLoading({
                title: "上传中..."
            });
            wx.uploadFile({
                url: _api.default.fileUpload,
                //仅为示例，非真实的接口地址
                filePath: avatarUrl,
                name: "multipartFile",
                formData: {
                    //调用上传接口需要的参数
                    type: "image",
                    name: Date.now() + "" //后端需要用它来获取文件的名字
                },

                header: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "".concat(wx.getStorageSync("token")) || ""
                },
                success: function success(res) {
                    var resData = JSON.parse(res.data);
                    if (resData.code !== 0) {
                        return util.toastUtil(resData.message);
                    }
                    _this7.updateInfo(resData.data.path, avatarUrl);
                },
                fail: function fail(err) {
                    console.log(err);
                    wx.hideLoading();
                }
            });
        },
        updateInfo: function updateInfo(path, avatarUrl) {
            var _this8 = this;
            util.request({
                url: _api.default.updateAvatar,
                method: "POST",
                data: {
                    headerImg: path
                }
            }).then(function(result) {
                if (result.data.code !== 0) {
                    return util.toastUtil(result.data.message);
                }
                _this8.setData({
                    avatarUrl: avatarUrl
                });
                util.toastUtil("头像已更新");
            }).catch(function(error) {
                wx.hideLoading();
            });
        }
    });