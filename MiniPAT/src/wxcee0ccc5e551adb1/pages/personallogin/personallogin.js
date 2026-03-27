var _defineProperty2 = require("../../@babel/runtime/helpers/defineProperty");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/personalCenter/personalCenter.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            phoneNumber: '',
            smsCode: "",
            checkCode: '',
            checkCodeValue: "",
            privacyPolicy: false,
            msg: '获取验证码',
            countdown: '',
            loginBtn: false,
            staticImageUrl: _api.default.staticImageUrl
        },
        goBack: function goBack() {
            wx.navigateBack();
        },
        bindIphnoeInput: function bindIphnoeInput(e) {
            this.setData({
                phoneNumber: e.detail.value
            });
        },
        bindCodeInput: function bindCodeInput(e) {
            this.setData({
                smsCode: e.detail.value
            });
        },
        bindCheckCodeInput: function bindCheckCodeInput(e) {
            this.setData({
                checkCodeValue: e.detail.value
            });
            console.log(this.data.checkCodeValue, !this.data.checkCodeValue, "checkCodeValue");
        },
        goLogin: function goLogin() {
            var _this = this;
            if (this.data.loginBtn) return;
            var locale = this.data.$language.defaultLogin;
            var msg = util.formatPhone(this.data.phoneNumber);
            if (msg) {
                util.toastUtil(locale.verifyPhone);
                return;
            }
            if (this.data.checkCodeValue == '') {
                if (this.data.checkCodeValue !== '0') {
                    util.toastUtil(locale.loginVerifyCode);
                    return;
                }
            }
            if (!this.data.smsCode) {
                util.toastUtil(locale.loginVerifySMSCode);
                return;
            }
            if (!this.data.privacyPolicy) {
                util.toastUtil(locale.verifyCheck);
                return;
            }
            wx.showLoading({
                title: locale.loggingIn
            });
            this.setData({
                loginBtn: true
            });
            var params = {
                "checkCode": this.data.checkCodeValue,
                "phoneNumber": this.data.phoneNumber,
                "smsCode": this.data.smsCode,
                "encryptUserId": app.globalData.userInfo.encryptUserId,
                'loginType': 0
            };
            util.request({
                url: _api.default.bindPhone,
                method: "post",
                data: params
            }).then(function(result) {
                if (result.data.code === 0) {
                    app.globalData.bindIphoneStatus = result.data.data.loginStatus;
                    app.globalData.userInfo.userId = result.data.data.userId;
                    if (result.header.authorization) {
                        wx.setStorageSync('token', result.header.authorization);
                        app.globalData.loginStatus = 1;
                    }
                    app.getUserInfo().then(function(res) {
                        wx.hideLoading();
                        wx.navigateBack({
                            delta: 2
                        });
                        // event.emit('refreshPostionData')
                    });
                    // app.getUserInfo()
                } else {
                    util.toastUtil(result.data.message);
                }
                _this.setData({
                    loginBtn: false
                });
            }).catch(function(error) {
                console.log(error);
                _this.setData({
                    loginBtn: false
                });
            });
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            var _this2 = this;
            app.wxLogin().then(function(res) {
                _this2.getCheckCode();
            });
        },
        onUnload: function onUnload() {
            this.clearTimer();
        },
        onShow: function onShow() {},
        goPrivacyPolicy: function goPrivacyPolicy() {
            var url = '/pages/privacyPolicyText/privacyPolicyText?type=policy';
            if (this.data.$language.locale == "en_US") {
                url = '/pages/privacyPolicyTextEn/privacyPolicyText?type=policy';
            }
            wx.navigateTo({
                url: url
            });
        },
        getCode: function getCode() {
            var _this3 = this;
            var locale = this.data.$language.defaultLogin;
            if (!this.data.privacyPolicy) {
                util.toastUtil(locale.verifyCheck);
                return;
            }
            var msg = util.formatPhone(this.data.phoneNumber);
            if (msg) {
                util.toastUtil(locale.verifyPhone);
                return;
            }
            if (this.data.countdown !== '') {
                util.toastUtil(locale.verifySMSCode);
                return;
            }
            if (!this.data.checkCodeValue) {
                util.toastUtil(locale.verifyCode);
                return;
            }
            util.request({
                url: _api.default.sendSms,
                method: "post",
                data: {
                    phoneNumber: this.data.phoneNumber,
                    userId: app.globalData.userInfo.userId,
                    checkCode: this.data.checkCodeValue
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    console.log("验证码：", result.data.data);
                    if (_this3.data.countdown === '') {
                        _this3.beginCount();
                    }
                    util.toastUtil({
                        title: locale.sendSuccess,
                        icon: 'none',
                        mask: true
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {
                console.log(error);
            });
        },
        clearTimer: function clearTimer() {
            clearInterval(this.timer);
            this.timer = null;
            this.setData({
                countdown: ''
            });
        },
        beginCount: function beginCount() {
            var _this4 = this;
            var time = 59;
            this.timer = setInterval(function() {
                if (time == 0) {
                    _this4.clearTimer();
                } else {
                    _this4.setData(_defineProperty2({}, 'countdown', "".concat(time)));
                    time--;
                }
            }, 1000);
        },
        getCheckCode: function getCheckCode() {
            var _this5 = this;
            util.request({
                url: _api.default.getCheckCode,
                method: "post",
                data: {
                    userId: app.globalData.userInfo.userId
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this5.setData({
                        checkCode: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {
                console.log(error);
            });
        },
        radioEvent: function radioEvent(e) {
            this.setData({
                privacyPolicy: !this.data.privacyPolicy
            });
        },
        onShareAppMessage: function onShareAppMessage() {}
    });