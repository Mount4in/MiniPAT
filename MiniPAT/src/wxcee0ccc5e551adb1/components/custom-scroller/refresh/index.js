// components/custom-scroller/refresh/index.js
    Component({
        options: {
            multipleSlots: true,
            addGlobalClass: true
        },
        externalClasses: ["refresh-class"],
        relations: {
            "../base/index": {
                type: "parent",
                linked: function linked(target) {}
            }
        },
        properties: {
            // default|base|diy
            // default 微信默认下拉效果
            // base 改动过的基本下拉效果

            type: {
                type: String,
                value: "default" // default 微信默认下拉效果
            },

            // 下拉阈值
            threshold: {
                type: Number,
                value: 0
            },
            isLoading: {
                type: Boolean,
                value: false
            },
            // 下拉的状态：pulldown loosen loading
            // pulldown 下拉
            // loosen   放松后
            // loading  加载
            refreshState: {
                type: String,
                value: "pulldown"
            },
            config: {
                type: Object,
                value: {
                    style: "black",
                    height: 50,
                    text: {
                        color: "#999",
                        // 文字颜色
                        shadow: 0 // 是否开启shadow阴影,0为不开启,数值越大阴影范围越大
                    }
                }
            }
        },

        /**
         * 组件的初始数据
         */
        data: {},
        ready: function ready() {
            this.parallaxNodes = this.getRelationNodes("../parallax/index");
        },
        /**
         * 组件的方法列表
         */
        methods: {
            changeThreshold: function changeThreshold(_ref) {
                var threshold = _ref.threshold;
                var that = this;
                return new Promise(function(resolve) {
                    var refreshState = "pulldown";
                    if (that.data.triggered && !that.data.isLoading) {
                        refreshState = "loosen";
                    }
                    that.setData({
                        threshold: threshold,
                        refreshState: refreshState
                    }, function() {
                        resolve();
                        if (that.parallaxNodes && that.parallaxNodes.length > 0) {
                            that.parallaxNodes.forEach(function(elem, index) {
                                elem.setData({
                                    threshold: threshold
                                });
                            });
                        }
                    });
                });
            },
            setLoading: function setLoading(_ref2) {
                var isLoading = _ref2.isLoading;
                var that = this;
                return new Promise(function(resolve) {
                    that.setData({
                        isLoading: isLoading,
                        refreshState: isLoading ? "loading" : "pulldown"
                    }, function() {
                        resolve();
                    });
                });
            }
        }
    });