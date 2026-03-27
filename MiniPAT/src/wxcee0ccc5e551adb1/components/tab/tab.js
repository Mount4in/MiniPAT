var _typeof2 = require("../../@babel/runtime/helpers/typeof");
    Component({
        externalClasses: ["tab-class", "tab-item-class"],
        properties: {
            tabs: {
                type: Array,
                value: []
            },
            labelKey: {
                type: String,
                default: "label"
            },
            valueKey: {
                type: String,
                default: "value"
            },
            activityIndex: {
                type: Number,
                default: 0
            }
        },
        observers: {
            tabs: function tabs(val) {
                if (!(val !== null && val !== void 0 && val.length)) return;
                this.setData({
                    tabsIsObj: _typeof2(val[0]) === "object"
                });
            }
        },
        data: {
            tabsIsObj: false
        },
        methods: {
            onTabClick: function onTabClick(e) {
                var _e$target$dataset = e.target.dataset,
                    index = _e$target$dataset.index,
                    item = _e$target$dataset.item;
                this.triggerEvent("change", {
                    index: index,
                    item: item
                });
            }
        }
    });