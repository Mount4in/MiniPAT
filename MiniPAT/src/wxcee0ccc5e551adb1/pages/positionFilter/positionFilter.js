var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/positionFilter/positionFilter.js

    var util = require('@/utils/util.js');
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            recruitmentCategory: [{
                type: 0,
                text: '不限'
            }, {
                type: 1,
                text: '蓝领招聘'
            }, {
                type: 2,
                text: '分公司招聘'
            }],
            // 按照100K的总数计算百分比
            salaryRange: [{
                type: 0,
                text: '不限',
                data: [0, 999999]
            }, {
                type: 1,
                text: '10K以下',
                data: [0, 10]
            }, {
                type: 2,
                text: '10K-15K',
                data: [10, 15]
            }, {
                type: 3,
                text: '15K-20K',
                data: [15, 20]
            }, {
                type: 4,
                text: '20K-25K',
                data: [20, 25]
            }, {
                type: 5,
                text: '25K-30K',
                data: [25, 30]
            }, {
                type: 6,
                text: '50K+',
                data: [50, 999999]
            }, {
                type: 7,
                text: '面议',
                data: [0, 999999]
            }],
            sliderValue: [0, 100],
            salaryChooseItem: 0,
            salaryChooseMin: 0,
            salaryChooseMax: 999999,
            positionTypeList: [],
            positionTypeChooseItem: '',
            options: {}
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            var filter = JSON.parse(options.filter);
            this.setData({
                positionTypeChooseItem: filter === null || filter === void 0 ? void 0 : filter.positionTypeId,
                salaryChooseMin: (filter === null || filter === void 0 ? void 0 : filter.salaryMin) / 1000 || 0,
                salaryChooseMax: (filter === null || filter === void 0 ? void 0 : filter.salaryMax) / 1000 || 999999,
                salaryChooseItem: (filter === null || filter === void 0 ? void 0 : filter.salaryChooseItem) || 0,
                sliderValue: [(filter === null || filter === void 0 ? void 0 : filter.salaryMin) / 1000 || 0, (filter === null || filter === void 0 ? void 0 : filter.salaryMax) / 1000 || 100]
            });
            this.getPositionTypeList();
        },
        getPositionTypeList: function getPositionTypeList() {
            var _this = this;
            util.request({
                url: _api.default.positionTypeList,
                method: "post"
            }).then(function(result) {
                if (result.data.code === 0) {
                    result.data.data.unshift({
                        id: "",
                        isdeleted: '',
                        name: "不限",
                        sort: -1,
                        type: ""
                    });
                    _this.setData({
                        positionTypeList: result.data.data
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        resetting: function resetting() {
            this.setData({
                sliderValue: [0, 100],
                salaryChooseItem: 0,
                salaryChooseMin: 0,
                salaryChooseMax: 999999,
                positionTypeChooseItem: ''
            });
        },
        submit: function submit() {
            var _this$data = this.data,
                salaryChooseMin = _this$data.salaryChooseMin,
                salaryChooseMax = _this$data.salaryChooseMax,
                positionTypeChooseItem = _this$data.positionTypeChooseItem,
                salaryChooseItem = _this$data.salaryChooseItem;
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.setData({
                filterSearch: {
                    positionTypeId: positionTypeChooseItem,
                    salaryMax: salaryChooseMax * 1000,
                    salaryMin: salaryChooseMin * 1000,
                    salaryChooseItem: salaryChooseItem
                }
            });
            wx.navigateBack({
                delta: 1
            });
        },
        positionTypeChoose: function positionTypeChoose(event) {
            this.setData({
                positionTypeChooseItem: event.target.dataset.src.id
            });
        },
        sliderChange: function sliderChange(event) {
            var valueRange = [event.detail[0], event.detail[1] == 100 ? 999999 : event.detail[1]];
            var index = this.data.salaryRange.findIndex(function(v) {
                return v.data[0] === valueRange[0] && v.data[1] === valueRange[1];
            });
            this.setData({
                salaryChooseItem: index > -1 ? index : '',
                salaryChooseMin: valueRange[0],
                salaryChooseMax: valueRange[1]
            });
        },
        salaryChoose: function salaryChoose(e) {
            this.setData({
                salaryChooseItem: e.target.dataset.src.type,
                sliderValue: e.target.dataset.src.data,
                salaryChooseMin: e.target.dataset.src.data[0],
                salaryChooseMax: e.target.dataset.src.data[1]
            });
        }
    });