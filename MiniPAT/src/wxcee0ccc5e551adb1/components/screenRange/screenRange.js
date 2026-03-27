var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var util = require('@/utils/util.js');
    Component({
        options: {
            multipleSlots: true // 在组件定义时的选项中启用多slot支持
        },

        /**
         * 组件的属性列表
         */
        properties: {
            show: {
                type: Boolean,
                value: false
            }
        },
        /**
         * 组件的初始数据
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
                data: [0, 100]
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
                data: [0, 50]
            }, {
                type: 7,
                text: '面议',
                data: [0, 100]
            }],
            sliderValue: [0, 100],
            salaryChooseItem: 0,
            salaryChooseMin: "",
            salaryChooseMax: "",
            positionTypeList: [],
            positionTypeChooseItem: '',
            options: {}
        },
        created: function created() {
            this.getPositionTypeList();
        },
        lifetimes: {},
        /**
         * 组件的方法列表
         */
        methods: {
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
                    salaryChooseMin: "",
                    salaryChooseMax: "",
                    positionTypeChooseItem: ''
                });
            },
            submit: function submit() {
                var _this$data = this.data,
                    salaryChooseMin = _this$data.salaryChooseMin,
                    salaryChooseMax = _this$data.salaryChooseMax,
                    positionTypeChooseItem = _this$data.positionTypeChooseItem;
                this.triggerEvent('search', {
                    salaryChooseMin: salaryChooseMin,
                    salaryChooseMax: salaryChooseMax,
                    positionTypeChooseItem: positionTypeChooseItem
                });
            },
            positionTypeChoose: function positionTypeChoose(event) {
                this.setData({
                    positionTypeChooseItem: event.target.dataset.src.id
                });
            },
            sliderChange: function sliderChange(event) {
                console.log(event.detail, '====');
                this.setData({
                    salaryChooseItem: event.detail[1] == 100 && event.detail[0] == 0 ? 0 : '',
                    salaryChooseMin: event.detail[0],
                    salaryChooseMax: event.detail[1]
                });
            },
            salaryChoose: function salaryChoose(e) {
                console.log(e.target.dataset.src, '====e');
                this.setData({
                    salaryChooseItem: e.target.dataset.src.type,
                    sliderValue: e.target.dataset.src.data,
                    salaryChooseMin: e.target.dataset.src.data[0],
                    salaryChooseMax: e.target.dataset.src.data[1]
                });
            }
        }
    });