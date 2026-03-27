var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/notice/notice.js

    var app = getApp();
    var util = require('@/utils/util.js');
    Page({
        data: {
            staticImageUrl: _api.default.staticImageUrl,
            notification: {
                loading: false,
                list: [],
                params: {}
            }
        },
        onLoad: function onLoad(options) {},
        onShow: function onShow() {
            var _this = this;
            if (wx.getStorageSync('token')) {
                if (app.globalData.loginStatus !== 1) {
                    _event.default.on('getTokenSuccess', this, function() {
                        _event.default.remove('getTokenSuccess', _this);
                        _this.getJobApplyNoticeList();
                    });
                    return;
                }
                this.getJobApplyNoticeList();
            } else {
                this.setData({
                    'notification.list': []
                });
                wx.showModal({
                    title: this.data.$language.common.tip,
                    content: this.data.$language.notice.showModalDesc,
                    confirmText: this.data.$language.notice.showModalConfirm,
                    cancelText: this.data.$language.common.cancel,
                    confirmColor: '#824C96',
                    success: function success(res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: "/pages/login/login"
                            });
                        }
                    },
                    fail: function fail(err) {
                        console.log('err', err);
                    }
                });
            }
        },
        onClickPostionItem: function onClickPostionItem(row) {
            console.log('row', row);
            var item = row.mark.item;
            // 面试中
            if (item.applyStatus === 2) {
                var instance = this.selectComponent('.popup-invitation');
                instance.doOpen(_objectSpread2(_objectSpread2({}, item.jobApplyNoticeDetailVo), {}, {
                    positionNameEn: item.positionNameEn
                }));
                return;
            }
            // 补充简历
            if (item.applyStatus === 99) {
                wx.navigateTo({
                    url: '/pages/resumeFilling/resumeFilling?applyId=' + item.id
                });
            }
        },
        onRefresh: function onRefresh() {
            if (!wx.getStorageSync('token')) {
                util.toastUtil(this.data.$language.common.pleaseLogIn);
                var scroller = this.selectComponent('.elem-scroller');
                scroller.setTriggered(false);
                return;
            }
            this.getJobApplyNoticeList();
        },
        getJobApplyNoticeList: function getJobApplyNoticeList() {
            var _this2 = this;
            this.setData({
                'notification.loading': true
            });
            util.request({
                url: _api.default.getJobApplyNoticeList,
                method: "GET"
            }).then(function(res) {
                console.log('res', res);
                if (res.data.code !== 0) {
                    return util.toastUtil(res.data.message);
                }
                var datas = res.data.data || [];
                datas.forEach(function(v) {
                    // 未补充简历
                    if (+v.applyStatus === 2 && v.submitFlag === 0) {
                        v.applyStatus = 99;
                    }
                });
                _this2.setData({
                    'notification.list': datas
                });
            }).finally(function() {
                var scroller = _this2.selectComponent('.elem-scroller');
                scroller.setTriggered(false);
                _this2.setData({
                    'notification.loading': false
                });
            });
        },
        onLoadMore: function onLoadMore() {}
    });