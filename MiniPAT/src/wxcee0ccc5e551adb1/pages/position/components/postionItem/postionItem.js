var _objectSpread2 = require("../../../../@babel/runtime/helpers/objectSpread2");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Component({
        options: {
            multipleSlots: true // 在组件定义时的选项中启用多slot支持
        },

        /**
         * 组件的属性列表
         */
        properties: {
            item: {
                type: Object,
                value: {}
            },
            active: {
                type: String,
                value: ""
            },
            language: {
                type: Object,
                value: {}
            },
            longitude: null,
            latitude: null
        },
        /**
         * 组件的初始数据
         */

        data: {
            displayStyle: "",
            staticImageUrl: _api.default.staticImageUrl
        },
        lifetimes: {
            attached: function attached() {
                this.registryListener();
            },
            detached: function detached() {
                this.unRegistryListener();
            }
        },
        /**
         * 组件的方法列表
         */
        methods: {
            registryListener: function registryListener() {
                var _this = this;
                _event.default.on("delivered", this, function(_ref) {
                    var id = _ref.id;
                    if (id !== _this.data.item.id) return;
                    _this.setData({
                        item: _objectSpread2(_objectSpread2({}, _this.data.item), {}, {
                            isDelivered: true
                        })
                    });
                });
            },
            unRegistryListener: function unRegistryListener() {
                _event.default.remove("delivered", this);
            },
            deliver: function deliver(e) {
                if (e.currentTarget.dataset.item.status == 2) {
                    util.toastUtil("该岗位已停止招聘");
                    return;
                }
                var biographicalNotes = this.selectComponent("#biographicalNotes");
                biographicalNotes.onTrue();
            },
            goDetail: function goDetail() {
                wx.navigateTo({
                    url: "/pages/position-info/index?id=" + this.data.item.id + "&longitude=" + this.data.longitude + "&latitude=" + this.data.latitude
                });
            },
            jobApplySuccess: function jobApplySuccess() {
                this.setData({
                    item: _objectSpread2(_objectSpread2({}, this.data.item), {}, {
                        isDelivered: true
                    })
                });
            }
        }
    });