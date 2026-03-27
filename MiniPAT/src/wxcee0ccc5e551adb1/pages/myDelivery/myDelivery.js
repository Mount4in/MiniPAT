var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/notice/notice.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        data: {
            positionList: [],
            staticImageUrl: _api.default.staticImageUrl
        },
        onLoad: function onLoad(options) {
            this.getJobHunterJobApplyList();
        },
        getJobHunterJobApplyList: function getJobHunterJobApplyList() {
            var _this = this;
            util.request({
                url: _api.default.getJobHunterJobApplyList,
                method: "post",
                data: {
                    userId: app.globalData.userInfo.userId
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this.setData({
                        positionList: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {
                console.log(error);
            });
        },
        onShow: function onShow() {}
    });