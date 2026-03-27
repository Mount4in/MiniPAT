var _objectWithoutProperties2 = require("../../@babel/runtime/helpers/objectWithoutProperties");
    var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _location = require("@/utils/location.js");
    var _excluded = ["errMsg"]; // pages/addressSelect/addressSelect.js
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var util = require('@/utils/util.js');
    Page({
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
            staticImageUrl: _api.default.staticImageUrl,
            noLimitData: {
                text: "不限",
                value: "noLimit"
            },
            location: {
                name: ''
            }
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            var _optionsData$location;
            var optionsData = JSON.parse(options.backData);
            var isLocation = !!(optionsData !== null && optionsData !== void 0 && (_optionsData$location = optionsData.location) !== null && _optionsData$location !== void 0 && _optionsData$location.name);
            isLocation ? this.setData({
                location: optionsData.location
            }) : this.setData({
                countryCode: optionsData.countryCode || '',
                provinceCode: optionsData.provinceCode || '',
                cityCode: optionsData.cityCode || '',
                regionCode: optionsData.regionCode || '',
                countryName: optionsData.countryName || '',
                cityName: optionsData.cityName || '',
                provinceName: optionsData.provinceName || '',
                regionName: optionsData.regionName || '',
                location: optionsData.location || {
                    name: ''
                }
            });
            if (this.data.regionCode) {
                this.setData({
                    codeValue: this.data.regionCode
                });
                this.getRegionList();
            } else if (this.data.cityCode) {
                this.setData({
                    codeValue: this.data.cityCode
                });
                this.getCityList();
            } else if (this.data.provinceCode) {
                this.setData({
                    codeValue: this.data.provinceCode
                });
                this.getProvinceList();
            } else {
                this.setData({
                    codeValue: this.data.countryCode
                });
                this.getcountryList();
            }
        },
        changeBack: function changeBack() {
            this.setData({
                codeValue: this.data.countryCode,
                location: {
                    name: ''
                }
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
            var _this = this;
            util.request({
                url: _api.default.countryList,
                method: "GET"
            }).then(function(result) {
                if (result.data.code === 0) {
                    // result.data.data.unshift({
                    //   text: "不限",
                    //   value: "CHN-all",
                    // })
                    _this.setData({
                        addressOptions: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        getProvinceList: function getProvinceList() {
            var _this2 = this;
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
                    _this2.setData({
                        addressOptions: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        getCityList: function getCityList() {
            var _this3 = this;
            util.request({
                url: _api.default.cityList,
                method: "GET",
                data: {
                    countryCode: this.data.countryCode,
                    provinceCode: this.data.provinceCode
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
        getRegionList: function getRegionList() {
            var _this4 = this;
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
                    _this4.setData({
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
                    addressOptions: [],
                    location: {
                        name: ''
                    }
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
            this.goBackData();
        },
        chooseNoLimit: function chooseNoLimit(e) {
            this.setData({
                location: {
                    name: ''
                }
            });
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
                this.goBackData();
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
                this.goBackData();
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
                this.goBackData();
                return;
            }
            this.setData({
                regionCode: e.currentTarget.dataset.item.value,
                regionName: e.currentTarget.dataset.item.text,
                codeValue: e.currentTarget.dataset.item.value
            });
            this.goBackData();
        },
        goBackData: function goBackData() {
            var data = {
                countryName: this.data.countryName || this.data.location.countryName,
                cityName: this.data.cityName || this.data.location.city,
                provinceName: this.data.provinceName || this.data.location.shortProvince,
                regionName: this.data.regionName || this.data.location.district,
                countryCode: this.data.countryCode,
                provinceCode: this.data.provinceCode,
                cityCode: this.data.cityCode,
                regionCode: this.data.regionCode,
                location: this.data.location
            };
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.setData({
                back: data
            });
            wx.navigateBack({
                delta: 1
            });
        },
        onCurrentLocation: function onCurrentLocation() {
            var _this5 = this;
            (0, _location.queryLocationAuthorize)({
                success: function success(res) {
                    var countryName = res.countryName,
                        shortProvince = res.shortProvince,
                        city = res.city,
                        district = res.district,
                        town = res.town,
                        street = res.street,
                        latitude = res.latitude,
                        longitude = res.longitude;
                    _this5.onLocationChange(_objectSpread2(_objectSpread2({}, res), {}, {
                        address: "".concat(shortProvince).concat(city).concat(district).concat(town).concat(street),
                        latitude: latitude,
                        longitude: longitude,
                        name: district || city || shortProvince || countryName || ''
                    }));
                },
                showModal: false
            });
        },
        onLocation: function onLocation() {
            var _this6 = this;
            (0, _location.queryLocationAuthorize)({
                success: function success(res) {
                    wx.chooseLocation({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        success: function success(_ref) {
                            var errMsg = _ref.errMsg,
                                reset = _objectWithoutProperties2(_ref, _excluded);
                            if (!reset.name) return;
                            util.request({
                                url: _api.default.searchReverseRegion,
                                method: "POST",
                                data: {
                                    "coordtype": "gcj02ll",
                                    "latitude": reset.latitude,
                                    "longitude": reset.longitude
                                }
                            }).then(function(result) {
                                var _result$data$data;
                                var data = ((_result$data$data = result.data.data) === null || _result$data$data === void 0 ? void 0 : _result$data$data.addressComponent) || {};
                                var countryName = data.countryName,
                                    shortProvince = data.shortProvince,
                                    city = data.city,
                                    district = data.district,
                                    town = data.town,
                                    street = data.street;
                                _this6.onLocationChange(_objectSpread2(_objectSpread2({}, data), {}, {
                                    address: "".concat(shortProvince).concat(city).concat(district).concat(town).concat(street),
                                    latitude: reset.latitude,
                                    longitude: reset.longitude,
                                    name: reset.name || district || city || shortProvince || countryName || ''
                                }));
                            });
                        }
                    });
                },
                showModal: false
            });
        },
        onLocationChange: function onLocationChange(location) {
            var _this7 = this;
            this.setData({
                location: location,
                countryName: "",
                cityName: '',
                provinceName: "",
                regionName: "",
                countryCode: "",
                provinceCode: "",
                cityCode: "",
                regionCode: "",
                codeValue: null
            });
            var t = setTimeout(function() {
                _this7.goBackData();
                clearTimeout(t);
                t = null;
            }, 1000);
        }
    });