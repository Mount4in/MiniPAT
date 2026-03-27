var _defineProperty2 = require("../../../../@babel/runtime/helpers/defineProperty");
    var _objectSpread2 = require("../../../../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _util = _interopRequireDefault(require("@/utils/util"));

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Component({
        properties: {
            info: {},
            isEdit: false
        },
        observers: {
            info: function info(val) {
                this.setData({
                    detail: val,
                    selectValues: {
                        disabilityType: (val.disabilityTypeCode || "").split(","),
                        disabilityLevel: (val.disabilityLevelCode || "").split(",")
                    }
                });
            }
        },
        data: {
            detail: {},
            selectValues: {
                disabilityType: [],
                disabilityLevel: []
            },
            dictList: {}
        },
        lifetimes: {
            attached: function attached() {
                this.getDicList();
            }
        },
        methods: {
            getDicList: function getDicList() {
                var _this = this;
                _util.default.request({
                    url: _api.default.getDictList,
                    method: "POST",
                    data: {
                        categoryCodeList: ["DISABILITY_TYPE", "RECRUIT_DISABILITY_LEVEL"]
                    }
                }).then(function(res) {
                    _this.setData({
                        dictList: res.data.data || {}
                    });
                });
            },
            getData: function getData() {
                var _this$data$detail = this.data.detail,
                    disabilityFlag = _this$data$detail.disabilityFlag,
                    disabilityLevelCode = _this$data$detail.disabilityLevelCode,
                    disabilityLevelDesc = _this$data$detail.disabilityLevelDesc,
                    disabilityTypeCode = _this$data$detail.disabilityTypeCode,
                    disabilityTypeDesc = _this$data$detail.disabilityTypeDesc;
                return {
                    disabilityFlag: disabilityFlag,
                    disabilityLevelCode: disabilityLevelCode,
                    disabilityLevelDesc: disabilityLevelDesc,
                    disabilityTypeCode: disabilityTypeCode,
                    disabilityTypeDesc: disabilityTypeDesc
                };
            },
            onRadioChange: function onRadioChange(e) {
                var value = +e.detail.value;
                this.changeDetail(_objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2({}, e.mark.prop, value)));
                if (value === 0) {
                    this.changeDetail(_objectSpread2(_objectSpread2({}, this.data.detail), {}, {
                        disabilityLevelCode: null,
                        disabilityLevelDesc: null,
                        disabilityTypeCode: null,
                        disabilityTypeDesc: null
                    }));
                    this.setData({
                        selectValues: {
                            disabilityType: [],
                            disabilityLevel: []
                        }
                    });
                }
            },
            onSelectChange: function onSelectChange(e) {
                var detail = e.detail,
                    mark = e.mark;
                this.changeDetail(_objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2(_defineProperty2({}, "".concat(mark.prop, "Code"), detail.map(function(v) {
                    return v.dictCode;
                }).join(",")), "".concat(mark.prop, "Desc"), detail.map(function(v) {
                    return v.dictDesc;
                }).join(","))));
            },
            changeDetail: function changeDetail(detail) {
                this.setData({
                    detail: detail
                });
                this.triggerEvent("change", detail);
            },
            valid: function valid() {
                var _this$data$detail2 = this.data.detail,
                    disabilityFlag = _this$data$detail2.disabilityFlag,
                    disabilityLevelCode = _this$data$detail2.disabilityLevelCode,
                    disabilityTypeCode = _this$data$detail2.disabilityTypeCode;
                if (disabilityFlag !== 1) return true;
                if (!disabilityLevelCode || !disabilityTypeCode) {
                    _util.default.toastUtil("请完善个人信息中带 * 信息");
                    return false;
                }
                return true;
            }
        }
    });