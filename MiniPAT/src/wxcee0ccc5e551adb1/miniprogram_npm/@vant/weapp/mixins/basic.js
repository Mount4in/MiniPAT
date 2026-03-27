Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.basic = void 0;
    exports.basic = Behavior({
        methods: {
            $emit: function $emit(name, detail, options) {
                this.triggerEvent(name, detail, options);
            },
            set: function set(data) {
                this.setData(data);
                return new Promise(function(resolve) {
                    return wx.nextTick(resolve);
                });
            }
        }
    });