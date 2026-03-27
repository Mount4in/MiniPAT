var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/login/login.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            staticImageUrl: _api.default.staticImageUrl,
            privacyPolicy: false,
            privacyPolicyShow: false
        },
        onClose: function onClose() {
            this.setData({
                privacyPolicyShow: false
            });
        },
        checkPrivacyPolicy: function checkPrivacyPolicy() {
            if (!this.data.privacyPolicy) {
                util.toastUtil(this.data.$language.login.checkTip);
                return;
            }
            this.setData({
                privacyPolicyShow: true
            });
        },
        getPhoneNumber: function getPhoneNumber(e) {
            var _this = this;
            if (!e.detail.code) {
                // util.toastUtil(e.detail.errMsg)
                return;
            }
            util.request({
                url: _api.default.getUserPhone,
                method: "GET",
                data: {
                    code: e.detail.code
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this.loginEvent(e.detail.code, result.data.data.phoneNumber);
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {
                console.log(error);
            });
        },
        loginEvent: function loginEvent(code, phoneNumber) {
            var params = {
                "code": code,
                "encryptUserId": app.globalData.userInfo.encryptUserId,
                'loginType': 1,
                'phoneNumber': phoneNumber
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
                            delta: 1
                        });
                        // event.emit('refreshPostionData')
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
        toPage: function toPage(e) {
            wx.navigateTo({
                url: e.currentTarget.dataset.src
            });
        },
        goPrivacyPolicy: function goPrivacyPolicy() {
            var url = '/pages/privacyPolicyText/privacyPolicyText?type=policy';
            if (this.data.$language.locale == "en_US") {
                url = '/pages/privacyPolicyTextEn/privacyPolicyText?type=policy';
            }
            wx.navigateTo({
                url: url
            });
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            app.wxLogin();
        },
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {},
        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function onShow() {},
        /**
         * 生命周期函数--监听页面隐藏
         */
        onHide: function onHide() {},
        /**
         * 生命周期函数--监听页面卸载
         */
        onUnload: function onUnload() {},
        /**
         * 页面相关事件处理函数--监听用户下拉动作
         */
        onPullDownRefresh: function onPullDownRefresh() {},
        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function onReachBottom() {},
        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function onShareAppMessage() {}
    });