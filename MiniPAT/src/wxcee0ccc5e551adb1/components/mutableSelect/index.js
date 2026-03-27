var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _defineProperty2 = require("../../@babel/runtime/helpers/defineProperty");
    Component({
        properties: {
            options: {
                type: Array,
                value: []
            },
            labelKey: {
                type: String,
                default: "label"
            },
            valueKey: {
                type: String,
                default: "value"
            },
            value: {
                type: Array,
                default: []
            },
            labelInValue: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        observers: {
            options: function options(val) {
                if (!(val !== null && val !== void 0 && val.length)) return;
                this.setData({
                    optionsList: val
                });
                this.initSelectedItems();
            },
            value: function value() {
                this.initSelectedItems();
            }
        },
        data: {
            showed: false,
            optionsList: [],
            selectedItems: []
        },
        methods: {
            initSelectedItems: function initSelectedItems() {
                var _this$data = this.data,
                    options = _this$data.options,
                    labelKey = _this$data.labelKey,
                    valueKey = _this$data.valueKey,
                    value = _this$data.value;
                if (!(value !== null && value !== void 0 && value.length)) return;
                if (!(options !== null && options !== void 0 && options.length)) {
                    this.setData({
                        selectedItems: value.map(function(v) {
                            return _defineProperty2(_defineProperty2({}, labelKey, v), valueKey, v);
                        })
                    });
                    return;
                }
                this.setData({
                    selectedItems: options.filter(function(v) {
                        return value.indexOf(v[valueKey]) > -1;
                    }),
                    optionsList: options.map(function(v) {
                        return _objectSpread2(_objectSpread2({}, v), {}, {
                            checked: value.indexOf(v[valueKey]) > -1
                        });
                    })
                });
            },
            onShowedSelected: function onShowedSelected() {
                this.setData({
                    showed: true
                });
            },
            onChange: function onChange(e) {
                var _this$data2 = this.data,
                    options = _this$data2.options,
                    valueKey = _this$data2.valueKey;
                var val = e.detail.value;
                this.setData({
                    optionsList: options.map(function(v) {
                        return _objectSpread2(_objectSpread2({}, v), {}, {
                            checked: val.indexOf(v[valueKey]) > -1
                        });
                    })
                });
            },
            onConfirm: function onConfirm() {
                var _this$data3 = this.data,
                    labelInValue = _this$data3.labelInValue,
                    optionsList = _this$data3.optionsList,
                    valueKey = _this$data3.valueKey;
                var values = optionsList.filter(function(v) {
                    return v.checked;
                }).map(function(v) {
                    return labelInValue ? v : v[valueKey];
                });
                this.triggerEvent("change", values);
                this.setData({
                    showed: false,
                    selectedItems: optionsList.filter(function(v) {
                        return v.checked;
                    })
                });
            },
            onCancel: function onCancel() {
                var _this$data4 = this.data,
                    options = _this$data4.options,
                    valueKey = _this$data4.valueKey,
                    selectedItems = _this$data4.selectedItems;
                this.setData({
                    showed: false,
                    optionsList: options.map(function(v) {
                        return _objectSpread2(_objectSpread2({}, v), {}, {
                            checked: selectedItems.map(function(v) {
                                return v[valueKey];
                            }).indexOf(v[valueKey]) > -1
                        });
                    })
                });
            }
        }
    });