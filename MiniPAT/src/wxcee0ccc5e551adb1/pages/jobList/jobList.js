var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _defineProperty2 = require("../../@babel/runtime/helpers/defineProperty");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _location = require("@/utils/location.js");

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var util = require("@/utils/util.js");
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: _defineProperty2(_defineProperty2(_defineProperty2(_defineProperty2(_defineProperty2({
            backData: {},
            staticImageUrl: _api.default.staticImageUrl,
            positionListKeyWrod: "",
            positionList: [],
            nextPage: true,
            page: 1,
            total: 0,
            loadMore: false,
            //"上拉加载"的变量，默认false，隐藏
            companyIndex: -1,
            countryCode: "",
            provinceCode: "",
            cityCode: "",
            regionCode: "",
            companyList: [],
            latitude: "",
            longitude: "",
            id: "",
            activeName: "1",
            activeNameTemp: false,
            ytoExpressPositionCount: [],
            contentHeight: 0,
            active: "near"
        }, "latitude", null), "longitude", null), "filterSearch", {}), "firstShow", true), "preLoginStatus", app.globalData.loginStatus),
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            this.setData({
                id: options.id,
                longitude: options.longitude,
                latitude: options.latitude,
                backData: JSON.parse(options.backData || "{}"),
                active: options.longitude ? "near" : "time"
            });
            if (options.name === "圆通国际") {
                this.i18n.locale !== "en_US" && this.i18n.toggleLanguage("en_US");
            }
        },
        onUnload: function onUnload() {
            var locale = wx.getStorageSync("jobListLocale");
            if (locale && locale !== this.data.$language.locale) {
                this.i18n.toggleLanguage(locale);
            }
            wx.removeStorageSync("jobListLocale");
        },
        onShow: function onShow() {
            var loginStatus = app.globalData.loginStatus;
            // 刷新条件：1、回退时位置更新 2、回退时筛选条件更新  3、登录状态改变
            if (this.data.firstShow || loginStatus !== this.data.preLoginStatus || Object.keys(this.data.filterSearch).length) {
                this.getPositionTypeScroll();
            }
            this.setData({
                firstShow: false,
                preLoginStatus: loginStatus
            });
        },
        onRefresh: function onRefresh() {
            this.getYtoExpressPositionList();
        },
        onLoadMore: function onLoadMore() {
            if (!this.data.nextPage) return;
            if (!this.data.loadMore) {
                this.setData({
                    loadMore: true
                });
            }
            this.setData({
                page: this.data.page + 1
            });
            this.queryPositionList();
        },
        onChange: function onChange(event) {
            this.setData({
                activeName: event.detail,
                activeNameTemp: true
            });
            if (event.detail) {
                wx.showLoading({
                    title: "加载中~"
                });
                this.getYtoExpressPositionList();
            }
        },
        getYtoExpressPositionCount: function getYtoExpressPositionCount() {
            this.getYtoExpressPositionList();
        },
        getYtoExpressPositionList: function getYtoExpressPositionList() {
            this.setData({
                page: 1,
                nextPage: true,
                loadMore: false,
                total: 0
            });
            this.queryPositionList();
        },
        getPositionTypeScroll: function getPositionTypeScroll() {
            var _this = this;
            wx.pageScrollTo({
                scrollTop: 0
            });
            if (this.data.companyIndex !== -1) {
                this.onScrollRefresh();
                return;
            }
            util.request({
                url: _api.default.companyList,
                method: "GET"
            }).then(function(result) {
                if (result.data.code === 0) {
                    var idx = result.data.data.findIndex(function(item) {
                        return item.id == _this.data.id;
                    });
                    var objectData = {
                        圆通集团: "YTO Group",
                        圆通速递: "YTO Express delivery",
                        圆通国际: "YTO International",
                        圆通科技: "YTO Technology",
                        圆通航空: "YTO Aviation"
                    };
                    result.data.data.forEach(function(item) {
                        return item.nameen = objectData[item.name];
                    });
                    _this.setData({
                        companyList: result.data.data,
                        companyIndex: idx
                    });
                    _this.onScrollRefresh();
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        positionKeyWordChange: util.myDebounce(function(event) {
            this.setData({
                positionListKeyWrod: String(event.detail.value)
            });
            this.onScrollRefresh();
        }, 300, false),
        bindPickerCompanyChange: function bindPickerCompanyChange(e) {
            if (e.detail.value != this.data.companyIndex) {
                this.setData({
                    activeNameTemp: false
                });
            }
            this.setData({
                companyIndex: e.detail.value
            });
            var localeType = wx.getStorageSync("jobListLocale");
            var _this$data = this.data,
                companyList = _this$data.companyList,
                companyIndex = _this$data.companyIndex;
            if (!localeType) {
                var currentLocale = this.i18n.locale;
                if (currentLocale === "zh_CN" && companyList[companyIndex].name === "圆通国际") {
                    wx.setStorageSync("jobListLocale", "zh_CN");
                    this.i18n.toggleLanguage("en_US");
                } else {
                    wx.removeStorageSync("jobListLocale");
                }
            } else {
                if (localeType !== "en_US") {
                    var toLocale = "zh_CN";
                    if (companyList[companyIndex].name === "圆通国际") {
                        toLocale = "en_US";
                        wx.setStorageSync("jobListLocale", toLocale);
                    } else {
                        wx.removeStorageSync("jobListLocale");
                    }
                    this.i18n.locale !== toLocale && this.i18n.toggleLanguage(toLocale);
                }
            }
            this.onScrollRefresh();
        },
        queryListByPage: function queryListByPage() {
            if (!this.data.nextPage) return;
            if (!this.data.loadMore) {
                this.setData({
                    loadMore: true
                });
            }
            this.setData({
                page: this.data.page + 1
            });
            this.queryPositionList();
        },
        queryPositionList: function queryPositionList(recruitmentTypeId) {
            var _this2 = this;
            var params = _objectSpread2({
                keyword: this.data.positionListKeyWrod,
                limit: 10,
                page: this.data.page,
                positionTypeId: "",
                companyTypeId: this.data.companyList[this.data.companyIndex].id,
                recruitmentTypeId: recruitmentTypeId || "",
                countryCode: this.data.backData.countryCode,
                provinceCode: this.data.backData.provinceCode,
                cityCode: this.data.backData.cityCode,
                regionCode: this.data.backData.regionCode,
                countryName: this.data.backData.countryName == "不限" ? "" : this.data.backData.countryName || "",
                provinceName: this.data.backData.provinceName == "不限" ? "" : this.data.backData.provinceName || "",
                cityName: this.data.backData.cityName == "不限" ? "" : this.data.backData.cityName || "",
                regionName: this.data.backData.regionName == "不限" ? "" : this.data.backData.regionName || ""
            }, this.data.filterSearch);
            params.latitude = this.data.latitude;
            params.longitude = this.data.longitude;
            if (app.globalData.loginStatus == 1) {
                params.userId = app.globalData.userInfo.userId;
            }
            // 请求列表数据
            util.request({
                url: this.data.active === "near" ? _api.default.positionListNear : _api.default.positionList,
                method: "POST",
                data: params
            }).then(function(res) {
                wx.hideLoading();
                wx.hideNavigationBarLoading(); //完成停止加载
                wx.stopPullDownRefresh(); //停止下拉刷新
                if (res.data.code == 0) {
                    var listData = res.data.data.records || [];
                    listData.forEach(function(v) {
                        if (!v.distance) return;
                        var distanceTemp = (v.distance / 1000).toFixed(2);
                        v.distance = distanceTemp > 100 ? ">100KM" : "".concat(distanceTemp, "KM");
                    });
                    var positionList = [];
                    if (_this2.data.page == 1) {
                        positionList = listData;
                    } else {
                        positionList = _this2.data.positionList.concat(listData);
                    }
                    _this2.setData({
                        positionList: positionList,
                        total: parseInt(res.data.data.total),
                        nextPage: parseInt(res.data.data.pages) > _this2.data.page ? true : false,
                        loadMore: false
                    }, function() {});
                    _this2.setContentHeight();
                } else {
                    _this2.setData({
                        loadMore: false,
                        nextPage: false
                    });
                    wx.showToast({
                        icon: "none",
                        title: res.data.message
                    });
                }
            }).finally(function() {
                var scroller = _this2.selectComponent(".elem-scroller");
                if (scroller) scroller.setTriggered(false);
            });
        },
        pxToRpx: function pxToRpx(px) {
            //获取整个屏幕的宽度单位 px
            var windowWidth = wx.getSystemInfoSync().windowWidth;
            //用整个屏幕的px单位 除以 750
            var ratio = 750 / windowWidth;
            //用px单位除以 屏幕比
            return px * ratio;
        },
        setContentHeight: function setContentHeight() {
            var that = this;
            if (!that.data.positionList.length) {
                that.setData({
                    contentHeight: 310
                });
            }
        },
        onScrollRefresh: function onScrollRefresh() {
            this.setData({
                page: 1,
                nextPage: true,
                loadMore: false,
                total: 0
            });
            this.queryPositionList();
        },
        onPullDownRefresh: function onPullDownRefresh() {
            wx.showLoading({
                title: "刷新中..."
            });
            this.onScrollRefresh();
        },
        onReachBottom: function onReachBottom() {
            this.queryListByPage();
        },
        changeSort: function changeSort(e) {
            this.setData({
                active: e.target.dataset.src
            });
            e.target.dataset.src === "time" && this.onScrollRefresh();
            e.target.dataset.src === "near" && this.onNearPosition();
        },
        // 附近职位
        onNearPosition: function onNearPosition() {
            var _this3 = this;
            // 已经选择了位置，查找已选位置附近的
            if (Object.keys(this.data.backData).length > 0) {
                if (this.data.latitude) {
                    // 经纬度存在，直接查询
                    this.onScrollRefresh();
                    return;
                }
                // 经纬度不存在，用当前选择的省市区换取经纬度信息
                var _this$data$backData = this.data.backData,
                    countryName = _this$data$backData.countryName,
                    provinceName = _this$data$backData.provinceName,
                    cityName = _this$data$backData.cityName,
                    regionName = _this$data$backData.regionName;
                util.request({
                    url: _api.default.searchAddressPoint,
                    method: "POST",
                    data: {
                        addressDetail: "人民政府",
                        city: cityName,
                        county: countryName,
                        province: provinceName,
                        town: regionName,
                        wayBillNo: ""
                    }
                }).then(function(res) {
                    var _res$data, _res$data$data;
                    var location = res === null || res === void 0 ? void 0 : (_res$data = res.data) === null || _res$data === void 0 ? void 0 : (_res$data$data = _res$data.data) === null || _res$data$data === void 0 ? void 0 : _res$data$data.location;
                    location && _this3.setData({
                        latitude: location.lat,
                        longitude: location.lng
                    });
                    _this3.onScrollRefresh();
                });
                return;
            }
            //获取当前定位，查询当前定位附近职位
            (0, _location.queryLocationAuthorize)({
                success: function success(res) {
                    _this3.setData({
                        latitude: res.latitude,
                        longitude: res.longitude
                    });
                    _this3.onScrollRefresh();
                },
                fail: function fail() {
                    // 拒绝定位授权，查询最新职位
                    _this3.setData({
                        active: "time"
                    });
                }
            });
        },
        onFilter: function onFilter() {
            wx.navigateTo({
                url: "/pages/positionFilter/positionFilter?filter=" + JSON.stringify(this.data.filterSearch)
            });
        },
        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function onShareAppMessage() {}
    });