var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var util = require("@/utils/util.js");
    var app = getApp();
    Component({
        options: {
            multipleSlots: true // 在组件定义时的选项中启用多slot支持
        },

        /**
         * 组件的属性列表
         */
        properties: {
            item: {
                type: Object
            },
            language: {
                type: Object,
                value: {}
            }
        },
        /**
         * 组件的初始数据
         */
        data: {
            staticImageUrl: _api.default.staticImageUrl,
            biographicalNotes: false,
            radio: 0,
            selectData: {},
            biographicalNotesList: []
        },
        /**
         * 组件的方法列表
         */
        methods: {
            onClick: function onClick(event) {
                var name = event.currentTarget.dataset.name;
                this.setData({
                    radio: name
                });
            },
            addJobApply: function addJobApply() {
                var _this = this;
                var params = {
                    email: this.data.selectData.email,
                    jobHunter: this.data.selectData.name,
                    mobile: this.data.selectData.mobile,
                    positionId: this.data.item.id,
                    positionName: this.data.item.positionName,
                    userId: app.globalData.userInfo.userId,
                    loginMobile: app.globalData.userInfo.phoneNumber
                };
                util.request({
                    url: _api.default.addJobApply,
                    method: "POST",
                    data: params
                }).then(function(result) {
                    if (result.data.code === 0) {
                        _this.setData({
                            biographicalNotes: false
                        });
                        // util.toastUtil('投递成功','none', 4000)
                        _this.setData({
                            biographicalNotes: false
                        });
                        console.log(_this.data.language, "this.data.$language");
                        wx.showToast({
                            title: _this.data.language.common.deliverySuccessful,
                            icon: "none",
                            duration: 3000,
                            complete: function complete() {
                                setTimeout(function() {
                                    _this.triggerEvent("addJobApply", _objectSpread2({}, _this.data.item));
                                }, 1000);
                            }
                        });
                    } else {
                        if (result.data.message == "该岗位已经停止招聘") {
                            _this.setData({
                                biographicalNotes: false
                            });
                            wx.showToast({
                                title: _this.data.language.stopRecruit,
                                icon: "none",
                                duration: 3000
                            });
                            return;
                        }
                        util.toastUtil(result.data.message);
                    }
                }).catch(function(error) {});
            },
            submit: function submit() {
                this.setData({
                    selectData: this.data.biographicalNotesList[this.data.radio]
                });
                console.log(this.data.selectData, this.data.item, "selectData");
                this.addJobApply();
            },
            onTrue: util.myDebounce(function(event) {
                var _this2 = this;
                if (app.globalData.loginStatus == 0) {
                    wx.navigateTo({
                        url: "/pages/login/login"
                    });
                    return;
                }
                var isBlue = this.data.item.isBlueCollar; // 是否是蓝领职位
                util.request({
                    url: _api.default.queryResumeList,
                    method: "POST",
                    data: {
                        loginMobile: app.globalData.userInfo.phoneNumber,
                        encryptMobile: app.globalData.userInfo.encryptPhone
                    }
                }).then(function(_ref) {
                    var resData = _ref.data;
                    var data = resData.data,
                        code = resData.code,
                        message = resData.message;
                    if (code === 0) {
                        // 蓝领招聘岗位且蓝领简历不存在   或   非蓝领招聘岗位且社招简历不存在
                        if (isBlue && !(data !== null && data !== void 0 && data.myBlueResume) || !isBlue && !(data !== null && data !== void 0 && data.myOpenResume)) {
                            var params = {
                                positionId: _this2.data.item.id,
                                positionName: _this2.data.item.positionName,
                                userId: app.globalData.userInfo.userId
                            };
                            wx.navigateTo({
                                url: "/pages/resumeDetial/resumeDetial?applyParam=".concat(JSON.stringify(params), "&signType=").concat(isBlue ? "blue" : "social")
                            });
                            return;
                        }
                        _this2.setData({
                            selectData: isBlue ? data.myBlueResume : data.myOpenResume
                        });
                        _this2.addJobApply();
                    } else {
                        util.toastUtil(message);
                    }
                }).catch(function(error) {});
            }, 300, false),
            onClose: function onClose() {
                this.setData({
                    biographicalNotes: false
                });
            }
        }
    });