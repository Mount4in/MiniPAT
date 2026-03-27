var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/myCollection/myCollection.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            biographicalNotesList: [],
            staticImageUrl: _api.default.staticImageUrl
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {},
        goDetail: function goDetail(e) {
            console.log(e.currentTarget.dataset.item, "===");
            wx.navigateTo({
                url: '/pages/resumeUpload/resumeUpload',
                success: function success(res) {
                    res.eventChannel.emit('acceptDataFromOpenerPage', {
                        data: e.currentTarget.dataset.item
                    });
                }
            });
        },
        resumeList: function resumeList() {
            var _this = this;
            util.request({
                url: _api.default.resumeList,
                method: "GET"
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this.setData({
                        biographicalNotesList: result.data.data || []
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        addCollection: function addCollection() {
            wx.navigateTo({
                url: '/pages/resumeUpload/resumeUpload?length=' + this.data.biographicalNotesList.length
            });
        },
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {},
        delete: function _delete(e) {
            var _this2 = this;
            var id = e.currentTarget.dataset.id;
            util.request({
                url: _api.default.deleteResume,
                method: "POST",
                data: {
                    "id": id,
                    "userId": app.globalData.userInfo.userId
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this2.resumeList();
                    util.toastUtil(_this2.data.$language.common.deleteSuccessful);
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function onShow() {
            this.resumeList();
        },
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