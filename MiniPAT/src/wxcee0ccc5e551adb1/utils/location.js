Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.queryLocationAuthorize = queryLocationAuthorize;
    var _objectSpread2 = require("../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _util = _interopRequireDefault(require("./util"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // const util = require('./util.js')

    function openSettingModal(_ref) {
        var _success = _ref.success,
            fail = _ref.fail;
        wx.showModal({
            content: '为给您匹配附近的职位，请在“设置”中打开定位服务',
            success: function success(res) {
                if (res.confirm) {
                    wxOpenSetting({
                        success: _success,
                        fail: fail
                    });
                    return;
                }
                fail && fail();
            }
        });
    }

    function wxOpenSetting(_ref2) {
        var _success2 = _ref2.success,
            fail = _ref2.fail;
        wx.openSetting({
            success: function success(res) {
                if (res.authSetting['scope.userFuzzyLocation']) {
                    getCurrentLocation(_success2, fail);
                } else {
                    fail && fail();
                }
            }
        });
    }

    function queryLocationAuthorize(_ref3) {
        var _success3 = _ref3.success,
            _fail = _ref3.fail,
            _ref3$showModal = _ref3.showModal,
            showModal = _ref3$showModal === void 0 ? true : _ref3$showModal;
        wx.getSetting({
            success: function success(res) {
                console.log(res, "wx.getSetting-res");
                var authSetting = res.authSetting;
                if (authSetting['scope.userFuzzyLocation']) {
                    getCurrentLocation(_success3, _fail);
                } else if (authSetting['scope.userFuzzyLocation'] === false) {
                    showModal ? openSettingModal({
                        success: _success3,
                        fail: _fail
                    }) : wxOpenSetting({
                        success: _success3,
                        fail: _fail
                    });
                } else {
                    wx.authorize({
                        scope: 'scope.userFuzzyLocation',
                        success: function success() {
                            getCurrentLocation(_success3, _fail);
                        },
                        fail: function fail() {
                            showModal ? openSettingModal({
                                success: _success3,
                                fail: _fail
                            }) : wxOpenSetting({
                                success: _success3,
                                fail: _fail
                            });
                        }
                    });
                }
            }
        });
    }

    function getCurrentLocation(_success4, _fail2) {
        wx.getFuzzyLocation({
            type: 'gcj02',
            success: function success(res) {
                console.log("当前坐标信息：", res);
                _util.default.request({
                    url: _api.default.searchReverseRegion,
                    method: "POST",
                    data: {
                        "coordtype": "gcj02ll",
                        "latitude": res.latitude,
                        "longitude": res.longitude
                    }
                }).then(function(result) {
                    var _result$data$data;
                    _success4 && _success4(_objectSpread2({
                        latitude: res.latitude,
                        longitude: res.longitude
                    }, (_result$data$data = result.data.data) === null || _result$data$data === void 0 ? void 0 : _result$data$data.addressComponent));
                }).catch(function(error) {
                    _success4 && _success4({
                        latitude: res.latitude,
                        longitude: res.longitude
                    });
                });
            },
            fail: function fail(err) {
                _util.default.toastUtil('获取位置信息失败，请检微信查定位设置');
                var t = setTimeout(function() {
                    _fail2 && _fail2();
                    clearTimeout(t);
                    t = null;
                }, 2000);
            }
        });
    }