var _objectWithoutProperties2 = require("../../@babel/runtime/helpers/objectWithoutProperties");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _excluded = ["addressOptions", "codeValue", "staticImageUrl"]; // pages/addressSelect/addressSelect.js
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var util = require('@/utils/util.js');
    Component({
        properties: {
            showLimit: {
                type: Boolean,
                value: true
            },
            value: {
                type: Object,
                value: {}
            }
        },
        /**
         * 页面的初始数据
         */
        data: {
            countryName: "",
            cityName: '',
            provinceName: "",
            regionName: "",
            countryCode: "",
            provinceCode: "",
            cityCode: "",
            regionCode: "",
            addressOptions: [],
            codeValue: null,
            staticImageUrl: _api.default.staticImageUrl
        },
        created: function created() {
            var _this = this;
            var t = setTimeout(function() {
                clearTimeout(t);
                t = null;
                var value = _this.data.value;
                _this.setData({
                    countryCode: value.countryCode || '',
                    provinceCode: value.provinceCode || '',
                    cityCode: value.cityCode || '',
                    regionCode: value.regionCode || '',
                    countryName: value.countryName || '',
                    cityName: value.cityName || '',
                    provinceName: value.provinceName || '',
                    regionName: value.regionName || ''
                });
                if (_this.data.regionCode) {
                    _this.setData({
                        codeValue: _this.data.regionCode
                    });
                    _this.getRegionList();
                } else if (_this.data.cityCode) {
                    _this.setData({
                        codeValue: _this.data.cityCode
                    });
                    _this.getCityList();
                } else if (_this.data.provinceCode) {
                    _this.setData({
                        codeValue: _this.data.provinceCode
                    });
                    _this.getProvinceList();
                } else {
                    _this.setData({
                        codeValue: _this.data.countryCode
                    });
                    _this.getcountryList();
                }
            });
        },
        methods: {
            changeBack: function changeBack() {
                this.setData({
                    codeValue: this.data.countryCode
                });
                this.setData({
                    cityCode: "",
                    cityName: '',
                    regionCode: "",
                    regionName: "",
                    provinceName: "",
                    provinceCode: "",
                    countryCode: ""
                });
                this.getcountryList();
            },
            changeBack1: function changeBack1() {
                this.setData({
                    codeValue: this.data.provinceCode
                });
                this.setData({
                    cityCode: "",
                    cityName: "",
                    regionCode: "",
                    regionName: "",
                    provinceCode: ""
                });
                this.getProvinceList();
            },
            changeBack2: function changeBack2() {
                this.setData({
                    codeValue: this.data.cityCode
                });
                this.setData({
                    regionCode: "",
                    regionName: "",
                    cityCode: ""
                });
                this.getCityList();
            },
            changeBack3: function changeBack3() {},
            getcountryList: function getcountryList() {
                var _this2 = this;
                util.request({
                    url: _api.default.countryList,
                    method: "GET"
                }).then(function(result) {
                    if (result.data.code === 0) {
                        // result.data.data.unshift({
                        //   text: "不限",
                        //   value: "CHN-all",
                        // })
                        _this2.setData({
                            addressOptions: result.data.data
                        });
                    } else {
                        util.toastUtil(result.data.message);
                    }
                }).catch(function(error) {});
            },
            getProvinceList: function getProvinceList() {
                var _this3 = this;
                util.request({
                    url: _api.default.provinceList,
                    method: "GET",
                    data: {
                        countryCode: this.data.countryCode,
                        provinceCode: "",
                        cityCode: ""
                    }
                }).then(function(result) {
                    if (result.data.code === 0) {
                        _this3.setData({
                            addressOptions: result.data.data
                        });
                    } else {
                        util.toastUtil(result.data.message);
                    }
                }).catch(function(error) {});
            },
            getCityList: function getCityList() {
                var _this4 = this;
                util.request({
                    url: _api.default.cityList,
                    method: "GET",
                    data: {
                        countryCode: this.data.countryCode,
                        provinceCode: this.data.provinceCode
                    }
                }).then(function(result) {
                    if (result.data.code === 0) {
                        _this4.setData({
                            addressOptions: result.data.data
                        });
                    } else {
                        util.toastUtil(result.data.message);
                    }
                }).catch(function(error) {});
            },
            getRegionList: function getRegionList() {
                var _this5 = this;
                util.request({
                    url: _api.default.regionList,
                    method: "GET",
                    data: {
                        countryCode: this.data.countryCode,
                        provinceCode: this.data.provinceCode,
                        cityCode: this.data.cityCode
                    }
                }).then(function(result) {
                    if (result.data.code === 0) {
                        _this5.setData({
                            addressOptions: result.data.data
                        });
                    } else {
                        util.toastUtil(result.data.message);
                    }
                }).catch(function(error) {});
            },
            chooseCity: function chooseCity(e) {
                if (!this.data.countryCode || this.data.countryCode == 'noLimit') {
                    this.setData({
                        countryCode: e.currentTarget.dataset.item.value,
                        countryName: e.currentTarget.dataset.item.text,
                        codeValue: e.currentTarget.dataset.item.value,
                        cityCode: "",
                        cityName: '',
                        regionCode: "",
                        regionName: "",
                        provinceName: "",
                        provinceCode: "",
                        addressOptions: []
                    });
                    this.getProvinceList();
                    return;
                }
                if (!this.data.provinceCode || this.data.provinceCode == 'noLimit') {
                    this.setData({
                        provinceCode: e.currentTarget.dataset.item.value,
                        provinceName: e.currentTarget.dataset.item.text,
                        codeValue: e.currentTarget.dataset.item.value,
                        cityCode: "",
                        cityName: "",
                        regionCode: "",
                        regionName: ""
                    });
                    this.getCityList();
                    return;
                }
                if (!this.data.cityCode || this.data.cityCode == 'noLimit') {
                    this.setData({
                        cityCode: e.currentTarget.dataset.item.value,
                        cityName: e.currentTarget.dataset.item.text,
                        codeValue: e.currentTarget.dataset.item.value,
                        regionCode: "",
                        regionName: ""
                    });
                    this.getRegionList();
                    return;
                }
                this.setData({
                    regionCode: e.currentTarget.dataset.item.value,
                    regionName: e.currentTarget.dataset.item.text,
                    codeValue: e.currentTarget.dataset.item.value
                });
                this.finishedChoose();
            },
            chooseNoLimit: function chooseNoLimit(e) {
                if (!this.data.countryCode || this.data.countryCode == 'noLimit') {
                    this.setData({
                        countryCode: e.currentTarget.dataset.item.value,
                        countryName: e.currentTarget.dataset.item.text,
                        codeValue: e.currentTarget.dataset.item.value,
                        cityCode: "",
                        cityName: '',
                        regionCode: "",
                        regionName: "",
                        provinceName: "",
                        provinceCode: ""
                    });
                    this.finishedChoose();
                    return;
                }
                if (!this.data.provinceCode || this.data.provinceCode == 'noLimit') {
                    this.setData({
                        provinceCode: e.currentTarget.dataset.item.value,
                        provinceName: e.currentTarget.dataset.item.text,
                        codeValue: e.currentTarget.dataset.item.value,
                        cityCode: "",
                        cityName: "",
                        regionCode: "",
                        regionName: ""
                    });
                    this.finishedChoose();
                    return;
                }
                if (!this.data.cityCode || this.data.cityCode == 'noLimit') {
                    this.setData({
                        cityCode: e.currentTarget.dataset.item.value,
                        cityName: e.currentTarget.dataset.item.text,
                        codeValue: e.currentTarget.dataset.item.value,
                        regionCode: "",
                        regionName: ""
                    });
                    this.finishedChoose();
                    return;
                }
                this.setData({
                    regionCode: e.currentTarget.dataset.item.value,
                    regionName: e.currentTarget.dataset.item.text,
                    codeValue: e.currentTarget.dataset.item.value
                });
                this.finishedChoose();
            },
            finishedChoose: function finishedChoose() {
                var _this$data = this.data,
                    addressOptions = _this$data.addressOptions,
                    codeValue = _this$data.codeValue,
                    staticImageUrl = _this$data.staticImageUrl,
                    reset = _objectWithoutProperties2(_this$data, _excluded);
                this.triggerEvent('choose', reset);
            }
        }
    });