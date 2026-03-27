var _api = _interopRequireDefault(require("@/utils/api.js"));

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
            extClass: {
                type: String,
                value: ''
            },
            language: {
                type: Object,
                value: {}
            }
        },
        /**
         * 组件的初始数据
         */
        data: {
            staticImageUrl: _api.default.staticImageUrl,
            officialAccount: false
        },
        lifetimes: {},
        /**
         * 组件的方法列表
         */
        methods: {
            closeOfficialAccount: function closeOfficialAccount() {
                this.triggerEvent("closeOfficialAccount");
            },
            followOfficialAccount: function followOfficialAccount() {
                this.setData({
                    officialAccount: true
                });
            },
            onClose: function onClose() {
                this.setData({
                    officialAccount: false
                });
            }
        }
    });