require("../../../../@babel/runtime/helpers/Arrayincludes");
    var _defineProperty2 = require("../../../../@babel/runtime/helpers/defineProperty");
    var _objectWithoutProperties2 = require("../../../../@babel/runtime/helpers/objectWithoutProperties");
    var _objectSpread2 = require("../../../../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _util = _interopRequireDefault(require("@/utils/util"));
    var _location = require("@/utils/location.js");
    var _event = _interopRequireDefault(require("@/utils/event.js"));
    var _excluded = ["errMsg"];

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var app = getApp();
    Component({
        properties: {
            applyParam: null // 简历投递参数
        },

        data: {
            detail: {
                mobile: app.globalData.userInfo.phoneNumber
            },
            isEdit: false
        },
        lifetimes: {
            attached: function attached() {
                this.getDetail();
            }
        },
        methods: {
            getDetail: function getDetail() {
                var _this = this;
                wx.showLoading();
                _util.default.request({
                    url: _api.default.queryResumeList,
                    method: "POST",
                    data: {
                        loginMobile: app.globalData.userInfo.phoneNumber,
                        encryptMobile: app.globalData.userInfo.encryptPhone
                    }
                }).then(function(_ref) {
                    var resData = _ref.data;
                    var data = resData.data,
                        code = resData.code;
                    if (code !== 0) return;
                    if (data.myBlueResume) {
                        _this.setData({
                            detail: data.myBlueResume,
                            isEdit: false
                        });
                    } else {
                        _this.setData({
                            isEdit: true
                        });
                    }
                }).finally(function() {
                    wx.hideLoading();
                });
            },
            onInput: function onInput(e) {
                console.log(e);
                var dataSet = e.target.dataset;
                var inputValue = e.detail.value;
                if (dataSet.type === "number" && inputValue.length) {
                    var regx = /^[1-9][0-9]*$/;
                    if (!regx.test(inputValue)) {
                        return this.data.detail[dataSet.prop];
                    }
                }
                this.data.detail[dataSet.prop] = e.detail.value;
                this.setData({
                    detail: _objectSpread2({}, this.data.detail)
                });
            },
            onLocation: function onLocation() {
                var _this2 = this;
                (0, _location.queryLocationAuthorize)({
                    success: function success(res) {
                        wx.chooseLocation({
                            latitude: res.latitude,
                            longitude: res.longitude,
                            success: function success(_ref2) {
                                var errMsg = _ref2.errMsg,
                                    reset = _objectWithoutProperties2(_ref2, _excluded);
                                if (!reset.name) return;
                                _this2.setData({
                                    detail: _objectSpread2(_objectSpread2({}, _this2.data.detail), {}, {
                                        targetWorkLocation: reset.name
                                    })
                                });
                            }
                        });
                    },
                    showModal: false
                });
            },
            onModify: function onModify() {
                this.setData({
                    isEdit: true
                });
            },
            onCancle: function onCancle() {
                // 无简历时，取消直接回退
                if (!this.data.detail.name) {
                    wx.navigateBack();
                    return;
                }
                this.setData({
                    isEdit: false
                });
                this.getDetail();
            },
            onRadioChange: function onRadioChange(e) {
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2({}, e.mark.prop, e.detail.value))
                });
            },
            onDisabilityChange: function onDisabilityChange(e) {
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), e.detail)
                });
            },
            sumbit: function sumbit() {
                var _this3 = this;
                if (!this.validInfo()) return;
                wx.showLoading({
                    title: "保存中..."
                });
                _util.default.request({
                    url: _api.default.submitResume,
                    method: "POST",
                    data: {
                        blueResume: _objectSpread2(_objectSpread2({}, this.data.detail), {}, {
                            genderDesc: this.data.detail.gender === "M" ? "男" : "女"
                        }),
                        resumeType: "my_blue",
                        loginMobile: app.globalData.userInfo.phoneNumber,
                        encryptMobile: app.globalData.userInfo.encryptPhone
                    }
                }).then(function(res) {
                    wx.hideLoading();
                    if (res.data.code !== 0) {
                        _util.default.toastUtil(res.data.message);
                        return;
                    }
                    if (!_this3.data.applyParam) {
                        //不需要投递
                        _util.default.toastUtil("提交成功");
                        _this3.setData({
                            isEdit: false
                        });
                        return;
                    }
                    _this3.data.applyParam && _this3.applyJob();
                }).catch(function() {
                    wx.hideLoading();
                });
            },
            applyJob: function applyJob() {
                var _this4 = this;
                wx.showLoading({
                    title: "投递中..."
                });
                _util.default.request({
                    url: _api.default.addJobApply,
                    method: "POST",
                    data: _objectSpread2(_objectSpread2({}, this.data.applyParam), {}, {
                        jobHunter: this.data.detail.name,
                        mobile: this.data.detail.mobile,
                        loginMobile: app.globalData.userInfo.phoneNumber
                    })
                }).then(function(result) {
                    if (result.data.code === 0) {
                        _util.default.toastUtil("投递成功");
                        _event.default.emit("delivered", {
                            id: _this4.data.applyParam.positionId
                        });
                    } else {
                        _util.default.toastUtil(result.data.message);
                    }
                    var t = setTimeout(function() {
                        wx.switchTab({
                            url: "/pages/position/position"
                        });
                        clearTimeout(t);
                        t = null;
                    }, 2000);
                });
            },
            validInfo: function validInfo() {
                var _this5 = this;
                var reauiredKeys = ["name", "gender", "age", "mobile", "expectedSalary"];
                var _this$data$detail = this.data.detail,
                    mobile = _this$data$detail.mobile,
                    age = _this$data$detail.age;
                var unValidKey = reauiredKeys.find(function(v) {
                    return [null, undefined, ""].includes(_this5.data.detail[v]);
                });
                if (unValidKey) {
                    _util.default.toastUtil("请完善个人信息中带 * 信息");
                    return false;
                }
                if (_util.default.formatPhone(mobile)) {
                    _util.default.toastUtil("请输入正确的手机号");
                    return false;
                }
                if (age < 1 || age > 100) {
                    _util.default.toastUtil("年龄限制在1~100");
                    return false;
                }
                var disabilitySet = this.selectComponent("#disabilitySet");
                return disabilitySet.valid();
            }
        }
    });