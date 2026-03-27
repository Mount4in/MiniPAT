var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/notice/components/invitation-popup/index.js

    Component({
        injectI18n: true,
        options: {
            // 表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面；
            styleIsolation: 'apply-shared'
        },
        properties: {
            invitationInfo: {
                type: Object,
                value: {}
            },
            language: {
                type: Object,
                value: {}
            }
        },
        data: {
            show: false,
            detail: null,
            staticImageUrl: _api.default.staticImageUrl
        },
        methods: {
            doOpen: function doOpen(data) {
                this.setData({
                    detail: data
                });
                this.toggleShow(true);
            },
            reset: function reset() {
                console.log('reset');
                this.setData({
                    detail: null
                });
            },
            doClose: function doClose() {
                this.toggleShow(false);
            },
            toggleShow: function toggleShow(boolean) {
                this.setData({
                    show: boolean
                });
            }
        }
    });