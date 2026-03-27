var _defineProperty2 = require("@babel/runtime/helpers/defineProperty");
    var _objectSpread2 = require("@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));
    require("@/utils/pageProxy.js");
    var _miniprogramI18nPlus = _interopRequireDefault(require("miniprogram-i18n-plus"));
    var _index = _interopRequireDefault(require("@/i18n/index"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // app.js

    var util = require('@/utils/util.js');
    try {
        var system = wx.getSystemInfoSync();
        system.language === 'en' ? _miniprogramI18nPlus.default.setLocale('en_US') : _miniprogramI18nPlus.default.setLocale("zh_CN");
    } catch (e) {
        _miniprogramI18nPlus.default.setLocale("zh_CN");
    }
    _miniprogramI18nPlus.default.loadTranslations(_index.default);
    App({
        onLaunch: function onLaunch() {
            this.updateManager();
            if (!wx.getStorageSync('token')) {
                this.globalData.loginStatus = 0;
                this.globalData.userInfo = {};
            } else {
                this.getUserInfo();
            }
        },
        wxLogin: function wxLogin() {
            var _this = this;
            return new Promise(function(resolve, reject) {
                wx.login({
                    success: function success(res) {
                        util.request({
                            url: _api.default.wxLogin,
                            method: "post",
                            data: {
                                code: res.code
                            }
                        }).then(function(result) {
                            console.log(result, "API.wxLogin");
                            if (result.data.code == 0) {
                                // 登录状态 0：已绑定手机号，1：未绑定手机号
                                _this.globalData.bindIphoneStatus = result.data.data.loginStatus;
                                _this.globalData.userInfo.userId = result.data.data.userId || '';
                                _this.globalData.userInfo.encryptUserId = result.data.data.encryptUserId || '';
                                if (!wx.getStorageSync('token')) {
                                    _this.globalData.loginStatus = 0;
                                    resolve(result);
                                    return;
                                } else {
                                    _this.getUserInfo();
                                }
                                resolve(result);
                            } else {
                                util.toastUtil(result.data.message);
                                reject(result);
                            }
                        }).catch(function(error) {
                            console.log(error);
                            reject(error);
                        });
                    }
                });
            });
        },
        getUserInfo: function getUserInfo() {
            var that = this;
            return new Promise(function(resolve, reject) {
                util.request({
                    url: _api.default.getUserInfo,
                    method: "post"
                }).then(function(result) {
                    console.log(result, "API.getUserInfo");
                    if (result.data.code == 0) {
                        result.data.data.phoneEncryptNumber = util.encryptPhone(result.data.data.phoneNumber);
                        that.globalData.loginStatus = 1;
                        that.globalData.userInfo = _objectSpread2(_objectSpread2(_objectSpread2({}, that.globalData.userInfo), result.data.data), {}, {
                            userId: result.data.data.id
                        });
                        resolve(result);
                        _event.default.emit('getTokenSuccess');
                    } else {
                        util.toastUtil(result.data.message);
                        reject(result);
                    }
                }).catch(function(error) {
                    reject(error);
                });
            });
        },
        updateManager: function updateManager() {
            var updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate(function(res) {
                // 请求完新版本信息的回调
                console.log('新版本:', res.hasUpdate);
            });
            updateManager.onUpdateReady(function() {
                // wx.showModal({
                //   title: '更新提示',
                //   content: '新版本已经准备好，需重启小程序',
                //   showCancel: false,
                //   success: function (res) {
                //     if (res.confirm) {
                //       // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                //       updateManager.applyUpdate()
                //     }
                //   }
                // })
                // 现微信有自带弹窗
                updateManager.applyUpdate();
            });
            updateManager.onUpdateFailed(function() {
                // 新版本下载失败
                wx.showModal({
                    title: '已经有新版本了哟~',
                    content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                    showCancel: false
                });
            });
        },
        globalData: _defineProperty2({
            userInfo: null,
            loginStatus: 0,
            //0未登录  1登录
            bindIphoneStatus: 1
        }, "userInfo", {
            userId: ''
        })
    });