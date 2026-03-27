var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/myResume/myResume.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            positionList: [],
            page: 1,
            total: 0,
            loadMore: false,
            //"上拉加载"的变量，默认false，隐藏
            nextPage: true,
            staticImageUrl: _api.default.staticImageUrl
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {},
        queryListByPage: function queryListByPage() {
            console.log(this.data.nextPage, "this.data.nextPage");
            if (this.data.nextPage) {
                this.setData({
                    page: this.data.page + 1
                });
                this.getCollectionList();
            } else {
                this.setData({
                    loadMore: true
                });
            }
        },
        cancleAll: function cancleAll() {
            var _this = this;
            util.request({
                url: _api.default.collectionAllNumber,
                method: "GET"
            }).then(function(result) {
                if (result.data.code === 0) {
                    wx.showToast({
                        title: _this.data.$language.myResume.cancelSuccess,
                        icon: 'none',
                        duration: 2000,
                        complete: function complete() {
                            setTimeout(function() {
                                _this.onScrollRefresh();
                            }, 1000);
                        }
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        getCollectionList: function getCollectionList() {
            var _this2 = this;
            util.request({
                url: _api.default.collectionList,
                method: "POST",
                data: {
                    limit: 10,
                    page: this.data.page,
                    userId: app.globalData.userInfo.userId
                }
            }).then(function(result) {
                wx.hideLoading();
                wx.hideNavigationBarLoading(); //完成停止加载
                wx.stopPullDownRefresh(); //停止下拉刷新
                if (result.data.code == 0) {
                    var positionListData = [];
                    if (_this2.data.page == 1) {
                        positionListData = result.data.data.records || [];
                    } else {
                        positionListData = _this2.data.positionList.concat(result.data.data.records);
                    }
                    _this2.setData({
                        positionList: positionListData,
                        total: parseInt(result.data.data.total),
                        nextPage: parseInt(result.data.data.pages) > _this2.data.page ? true : false,
                        loadMore: false
                    });
                } else {
                    _this2.setData({
                        loadMore: false,
                        nextPage: false
                    });
                    wx.showToast({
                        icon: 'none',
                        title: result.data.message
                    });
                }
            }).catch(function(error) {});
        },
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {},
        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function onShow() {
            this.getCollectionList();
        },
        /**
         * 生命周期函数--监听页面隐藏
         */
        onHide: function onHide() {},
        /**
         * 生命周期函数--监听页面卸载
         */
        onUnload: function onUnload() {},
        onScrollRefresh: function onScrollRefresh() {
            this.setData({
                page: 1
            });
            this.getCollectionList();
        },
        /**
         * 页面相关事件处理函数--监听用户下拉动作
         */
        onPullDownRefresh: function onPullDownRefresh() {
            wx.showLoading({
                title: this.data.$language.common.refreshing
            });
            this.onScrollRefresh();
        },
        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function onReachBottom() {
            if (!this.data.loadMore) {
                this.setData({
                    loadMore: true
                });
                this.queryListByPage();
            }
        },
        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function onShareAppMessage() {}
    });