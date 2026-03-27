Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.button = void 0;
    var version_1 = require("../common/version");
    exports.button = Behavior({
        externalClasses: ['hover-class'],
        properties: {
            id: String,
            buttonId: String,
            lang: String,
            businessId: Number,
            sessionFrom: String,
            sendMessageTitle: String,
            sendMessagePath: String,
            sendMessageImg: String,
            showMessageCard: Boolean,
            appParameter: String,
            ariaLabel: String,
            openType: String,
            getUserProfileDesc: String
        },
        data: {
            canIUseGetUserProfile: (0, version_1.canIUseGetUserProfile)()
        },
        methods: {
            onGetUserInfo: function onGetUserInfo(event) {
                this.triggerEvent('getuserinfo', event.detail);
            },
            onContact: function onContact(event) {
                this.triggerEvent('contact', event.detail);
            },
            onGetPhoneNumber: function onGetPhoneNumber(event) {
                this.triggerEvent('getphonenumber', event.detail);
            },
            onGetRealTimePhoneNumber: function onGetRealTimePhoneNumber(event) {
                this.triggerEvent('getrealtimephonenumber', event.detail);
            },
            onError: function onError(event) {
                this.triggerEvent('error', event.detail);
            },
            onLaunchApp: function onLaunchApp(event) {
                this.triggerEvent('launchapp', event.detail);
            },
            onOpenSetting: function onOpenSetting(event) {
                this.triggerEvent('opensetting', event.detail);
            },
            onAgreePrivacyAuthorization: function onAgreePrivacyAuthorization(event) {
                this.triggerEvent('agreeprivacyauthorization', event.detail);
            },
            onChooseAvatar: function onChooseAvatar(event) {
                this.triggerEvent('chooseavatar', event.detail);
            }
        }
    });