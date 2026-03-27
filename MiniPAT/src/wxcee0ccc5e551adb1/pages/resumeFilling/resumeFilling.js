// pages/resumeFilling/resumeFilling.js
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            h5Url: '',
            options: {}
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            this.setData({
                options: options
            });
        },
        onShow: function onShow() {
            var _this = this;
            if (this.data.h5Url) return;
            var t = setTimeout(function() {
                _this.loadH5();
                clearTimeout(t);
            }, 500);
        },
        loadH5: function loadH5() {
            var _this$data$options = this.data.options,
                q = _this$data$options.q,
                applyId = _this$data$options.applyId;
            var host = this.getHost();
            var tel = app.globalData.userInfo.phoneNumber;
            if (!tel) {
                wx.navigateTo({
                    url: '/pages/login/login'
                });
                return;
            }
            if (q) {
                //微信扫二维码进入
                var url = decodeURIComponent(q);
                var urlArr = url.split('/');
                var applyQrId = urlArr[urlArr.length - 1];
                this.setData({
                    h5Url: "".concat(host, "resume/applyPersonInfo?applyQrId=").concat(applyQrId, "&mini=true&tel=").concat(tel)
                });
            } else {
                //微信推送消息进入
                var token = wx.getStorageSync('token');
                this.setData({
                    h5Url: "".concat(host, "resume/applyPersonInfo?applyId=").concat(applyId, "&mini=true&token=").concat(token, "&tel=").concat(tel)
                });
            }
        },
        getHost: function getHost() {
            var obj = wx.getAccountInfoSync();
            var t = Date.now();
            return obj.miniProgram.envVersion === 'release' ? "https://hr-zp.yto.net.cn:9002/webview/".concat(t, "/#/") : "https://hr-zp.yto56test.com:9002/webview/".concat(t, "/#/");
        }
    });