var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _regeneratorRuntime2 = require("../../@babel/runtime/helpers/regeneratorRuntime");
    var _asyncToGenerator2 = require("../../@babel/runtime/helpers/asyncToGenerator");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _location = require("@/utils/location.js");
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/position/position.js

    var util = require("@/utils/util.js");
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            backData: {},
            staticImageUrl: _api.default.staticImageUrl,
            positionType: "",
            positionListKeyWrod: "",
            positionList: [],
            nextPage: true,
            page: 1,
            total: 0,
            loadMore: false,
            //"上拉加载"的变量，默认false，隐藏
            categoryIndex: 2,
            recruitmentCategoryList: [],
            positionIndex: -1,
            addressOptions: [],
            fieldNames: {
                text: "countryDesc",
                value: "countryCode"
            },
            countryCode: "",
            provinceCode: "",
            cityCode: "",
            regionCode: "",
            addressSelect: false,
            fieldValue: "工作地点",
            addressValue: "",
            mpFollow: 0,
            positioningValue: "不限",
            latitude: "",
            longitude: "",
            active: "near",
            groupSector: [_api.default.staticImageUrl + "group.png?v=1", _api.default.staticImageUrl + "expressDelivery.png?v=1", _api.default.staticImageUrl + "international.png?v=1", _api.default.staticImageUrl + "technology.png?v=1", _api.default.staticImageUrl + "aviation.png?v=1"],
            filterSearch: {},
            firstShow: true,
            companyList: [],
            preLoginStatus: app.globalData.loginStatus
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad() {
            this.getPositionTypeScroll();
        },
        onShow: function onShow() {
            var _this = this;
            return _asyncToGenerator2( /*#__PURE__*/ _regeneratorRuntime2().mark(function _callee() {
                var pages, currPage, backData, loginStatus;
                return _regeneratorRuntime2().wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                        case 0:
                            if (_this.data.recruitmentCategoryList.length) {
                                _context.next = 3;
                                break;
                            }
                            _context.next = 3;
                            return _this.getRecruitmentCategoryList().catch(function() {});
                        case 3:
                            pages = getCurrentPages();
                            currPage = pages[pages.length - 1];
                            backData = currPage.data.back;
                            console.log("backData==>", backData);
                            if (backData) {
                                _this.setData({
                                    backData: backData,
                                    positioningValue: backData.location.name || _this.formatBackDataName(backData.regionName) || _this.formatBackDataName(backData.cityName) || _this.formatBackDataName(backData.provinceName) || backData.countryName,
                                    countryCode: currPage.data.back.countryCode == "noLimit" ? "" : currPage.data.back.countryCode,
                                    provinceCode: currPage.data.back.provinceCode == "noLimit" ? "" : currPage.data.back.provinceCode,
                                    cityCode: currPage.data.back.cityCode == "noLimit" ? "" : currPage.data.back.cityCode,
                                    regionCode: currPage.data.back.regionCode == "noLimit" ? "" : currPage.data.back.regionCode,
                                    fieldValue: "".concat(currPage.data.back.countryName).concat(currPage.data.back.provinceName ? "/" : "").concat(currPage.data.back.provinceName).concat(currPage.data.back.cityName ? "/" : "").concat(currPage.data.back.cityName).concat(currPage.data.back.regionName ? "/" : "").concat(currPage.data.back.regionName),
                                    latitude: backData.location.latitude || "",
                                    longitude: backData.location.longitude || ""
                                });
                            } else {
                                _this.setData({
                                    backData: {},
                                    countryCode: "",
                                    provinceCode: "",
                                    cityCode: "",
                                    regionCode: "",
                                    fieldValue: _this.data.$language.workLocation
                                });
                            }
                            if (!wx.getStorageSync("token")) {
                                _context.next = 13;
                                break;
                            }
                            if (!(app.globalData.loginStatus !== 1)) {
                                _context.next = 12;
                                break;
                            }
                            _event.default.on("getTokenSuccess", _this, function() {
                                _event.default.remove("getTokenSuccess", _this);
                                _this.setData({
                                    mpFollow: app.globalData.loginStatus == 1 && app.globalData.userInfo.mpFollow == 0
                                });
                            });
                            return _context.abrupt("return");
                        case 12:
                            _this.setData({
                                mpFollow: app.globalData.loginStatus == 1 && app.globalData.userInfo.mpFollow == 0
                            });
                        case 13:
                            loginStatus = app.globalData.loginStatus; // 刷新条件：1、回退时位置更新 2、回退时筛选条件更新  3、登录状态改变
                            if (backData || _this.data.firstShow || loginStatus !== _this.data.preLoginStatus || Object.keys(_this.data.filterSearch).length) {
                                _this.data.active === "near" ? _this.onNearPosition() : _this.onScrollRefresh();
                            }
                            _this.setData({
                                firstShow: false,
                                preLoginStatus: loginStatus
                            });
                        case 16:
                        case "end":
                            return _context.stop();
                    }
                }, _callee);
            }))();
        },
        getPositionTypeScroll: function getPositionTypeScroll() {
            var _this2 = this;
            util.request({
                url: _api.default.companyList,
                method: "GET"
            }).then(function(result) {
                if (result.data.code === 0) {
                    _this2.setData({
                        companyList: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        formatBackDataName: function formatBackDataName(value) {
            return value && value !== "不限" ? value : "";
        },
        onFilter: function onFilter() {
            wx.navigateTo({
                url: "/pages/positionFilter/positionFilter?filter=" + JSON.stringify(this.data.filterSearch)
            });
        },
        goList: function goList(e) {
            if (e.mark.item.name === "圆通国际" && this.i18n.locale !== "en_US") {
                wx.setStorageSync("jobListLocale", this.data.$language.locale);
            } else {
                wx.removeStorageSync("jobListLocale");
            }
            // 圆通国际
            wx.navigateTo({
                url: "/pages/jobList/jobList?id=".concat(e.currentTarget.dataset.id, "&name=").concat(e.mark.item.name, "&longitude=").concat(this.data.longitude, "&latitude=").concat(this.data.latitude, "&backData=").concat(JSON.stringify(this.data.backData))
            });
        },
        closeOfficialAccount: function closeOfficialAccount() {
            this.setData({
                mpFollow: 0
            });
        },
        getRecruitmentCategoryList: function getRecruitmentCategoryList() {
            var _this3 = this;
            return util.request({
                url: _api.default.recruitmentList,
                method: "post"
            }).then(function(result) {
                if (result.data.code === 0) {
                    var objectData = {
                        蓝领招聘: "Blue collar recruitment",
                        社会招聘: "Social recruitment",
                        校园招聘: "Campus recruitment"
                    };
                    result.data.data.forEach(function(item) {
                        return item.nameen = objectData[item.name];
                    });
                    _this3.setData({
                        categoryIndex: 2,
                        recruitmentCategoryList: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {}).finally(function() {
                return Promise.resolve();
            });
        },
        positionKeyWordChange: util.myDebounce(function(event) {
            console.log(event.detail);
            this.setData({
                positionListKeyWrod: event.detail.value
            });
            this.onScrollRefresh();
        }, 300, false),
        //职位类别
        bindPickerPositionChange: function bindPickerPositionChange(e) {
            this.setData({
                positionIndex: e.detail.value
            });
            this.onScrollRefresh();
        },
        onAddressClose: function onAddressClose() {
            this.setData({
                addressSelect: false
            });
        },
        queryListByPage: function queryListByPage() {
            console.log(this.data.nextPage, "this.data.nextPage");
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
        queryPositionList: function queryPositionList() {
            var _this$data$recruitmen,
                _this4 = this;
            var recruitmentTypeId = (_this$data$recruitmen = this.data.recruitmentCategoryList) !== null && _this$data$recruitmen !== void 0 && _this$data$recruitmen.length ? this.data.recruitmentCategoryList[this.data.categoryIndex].id : "";
            var params = _objectSpread2({
                keyword: this.data.positionListKeyWrod,
                limit: 10,
                page: this.data.page,
                countryCode: this.data.countryCode,
                provinceCode: this.data.provinceCode,
                cityCode: this.data.cityCode,
                regionCode: this.data.regionCode,
                countryName: this.data.backData.countryName == "不限" ? "" : this.data.backData.countryName || "",
                provinceName: this.data.backData.provinceName == "不限" ? "" : this.data.backData.provinceName || "",
                cityName: this.data.backData.cityName == "不限" ? "" : this.data.backData.cityName || "",
                regionName: this.data.backData.regionName == "不限" ? "" : this.data.backData.regionName || "",
                recruitmentTypeId: recruitmentTypeId
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
                    if (_this4.data.page == 1) {
                        positionList = listData;
                    } else {
                        positionList = _this4.data.positionList.concat(listData);
                    }
                    _this4.setData({
                        positionList: positionList,
                        total: parseInt(res.data.data.total),
                        nextPage: parseInt(res.data.data.pages) > _this4.data.page ? true : false,
                        loadMore: false
                    }, function() {
                        // console.log('scrollTopBack60');
                        // this.scrollTopBack60()
                    });
                    console.log(_this4.data.total, _this4.data.nextPage, _this4.data.loadMore);
                } else {
                    _this4.setData({
                        loadMore: false,
                        nextPage: false
                    });
                    wx.showToast({
                        icon: "none",
                        title: res.data.message
                    });
                }
            });
        },
        onScrollRefresh: function onScrollRefresh() {
            this.setData({
                page: 1,
                nextPage: true,
                loadMore: false,
                total: 0
            });
            wx.pageScrollTo({
                scrollTop: 0
            });
            this.queryPositionList();
        },
        goCompanyProfile: function goCompanyProfile() {
            wx.switchTab({
                url: "/pages/companyProfile/companyProfile"
            });
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
            var _this5 = this;
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
                    if (location) {
                        _this5.setData({
                            latitude: location.lat,
                            longitude: location.lng
                        });
                    } else {
                        // 未获取到经纬度信息
                        _this5.setData({
                            active: "time"
                        });
                    }
                    _this5.onScrollRefresh();
                });
                return;
            }
            //获取当前定位，查询当前定位附近职位
            (0, _location.queryLocationAuthorize)({
                success: function success(res) {
                    _this5.setData({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        positioningValue: res.district || res.city || res.province || res.country || ""
                    });
                    _this5.onScrollRefresh();
                },
                fail: function fail() {
                    // 拒绝定位授权，查询最新职位
                    _this5.setData({
                        active: "time"
                    });
                    _this5.onScrollRefresh();
                }
            });
        },
        goChoosePositioning: function goChoosePositioning() {
            wx.navigateTo({
                url: "/pages/addressSelect/addressSelect?backData=" + JSON.stringify(this.data.backData)
            });
        },
        onPullDownRefresh: function onPullDownRefresh() {
            wx.showLoading({
                title: "刷新中..."
            });
            this.onScrollRefresh();
        },
        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function onReachBottom() {
            this.queryListByPage();
        },
        scrollTopBack60: function scrollTopBack60() {
            wx.createSelectorQuery().select(".list-block").boundingClientRect(function(rect) {
                console.log(rect);
                console.log(rect.top * 1);
                wx.pageScrollTo({
                    scrollTop: rect.top * 1 - 20
                });
            }).exec();
        },
        onTabChange: function onTabChange(e) {
            this.setData({
                categoryIndex: e.detail.index
            });
            this.onScrollRefresh();
        },
        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function onShareAppMessage() {}
    });