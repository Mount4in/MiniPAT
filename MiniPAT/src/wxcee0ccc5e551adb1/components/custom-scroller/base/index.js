// components/custom-scroller/index.js
    var _require = require('./util'),
        debounce = _require.debounce;
    Component({
        options: {
            multipleSlots: true,
            addGlobalClass: true
        },
        properties: {
            isEmpty: {
                type: Boolean,
                value: false
            },
            background: {
                type: String
            }
        },
        relations: {
            "../refresh/index": {
                type: "child",
                linked: function linked(target) {
                    // target 是 refresh 组件的this
                    this.setData({
                        type: target.data.type,
                        refreshConfig: target.data.config
                    });
                }
            }
        },
        data: {
            scrollHeaderHeight: 0,
            contentHeight: 0,
            scrollFooterHeight: 0,
            triggered: false,
            isLoading: false,
            refreshConfig: {
                height: 50,
                style: "black"
            }
        },
        ready: function ready() {
            // this.setWapHeight();
            this.refreshNodes = this.getRelationNodes("../refresh/index");
            this.refreshNode = this.refreshNodes[0] ? this.refreshNodes[0] : null;
        },
        methods: {
            // setWapHeight() {
            //   const that = this;
            //   const query = that.createSelectorQuery().in(this);
            //   query
            //     .select("#scroll-wrap")
            //     .boundingClientRect(function (res) {
            //       that.setData({
            //         contentHeight: res.height,
            //       });
            //     })
            //     .select("#scroll-header")
            //     .boundingClientRect(function (headerRes) {
            //       that.setData({
            //         contentHeight: that.data.contentHeight - headerRes.height,
            //       });
            //     })
            //     .select(".scroll-footer")
            //     .boundingClientRect(function (footerRes) {
            //       that.setData({
            //         contentHeight: that.data.contentHeight - footerRes.height,
            //       });
            //     })
            //     .exec();
            // },
            onPulling: function onPulling(event) {
                var _this = this;
                // console.log('onPulling', '下拉刷新控件被下拉');
                var pullDownHeight = this.data.refreshConfig.height; // 可下拉的高度阈值
                // 1 触发下拉刷新
                // 2 设置下拉的阈值，给diy类型作铺垫
                this.setTriggered(true).then(function() {
                    var p = Math.min(event.detail.dy / pullDownHeight, 1);
                    _this.p = p ? p : 0;
                    _this.setThreshold(_this.p);
                });
            },
            setTriggered: function setTriggered(boolean) {
                var that = this;
                return new Promise(function(resolve) {
                    if (that.data.triggered !== boolean) {
                        if (that.refreshNode) {
                            that.refreshNode.setData({
                                triggered: boolean
                            });
                        }
                        that.setData({
                            triggered: boolean
                        }, function() {
                            return resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            },
            setThreshold: function setThreshold(p) {
                var that = this;
                return new Promise(function(resolve) {
                    if (that.refreshNode) {
                        that.refreshNode.changeThreshold({
                            threshold: p
                        }).then(function() {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            },
            onDefaultRefresh: function onDefaultRefresh() {
                var that = this;
                if (that.data.type == "default") {
                    that.triggerEvent("refresh");
                    // debounce(() => {
                    //   that.setTriggered(false);
                    // }, 1000);
                }
                // console.log('onRefresh', '下拉刷新被触发');
            },
            onRefresh: function onRefresh() {
                var that = this;
                if (that.data.triggered) {
                    that.triggerEvent('refresh');
                }
            },
            // 用 touchend 代替 onRefresh 下拉刷新被触发事件
            dragend: function dragend() {
                var _this2 = this;
                if (this.data.type != 'default') {
                    if (this.p > 0.6 && this.data.isLoading == false) {
                        this.setData({
                            isLoading: true
                        }, function() {
                            _this2.refreshNode.setLoading({
                                isLoading: true
                            }).then(function() {
                                _this2.onRefresh();
                            });
                        });
                    } else {
                        this.setTriggered(false);
                    }
                }
            },
            onRestore: function onRestore() {
                var _this3 = this;
                // console.log('onRestore', '下拉刷新被复位');
                this.triggerEvent("restore");
                debounce(function() {
                    _this3.setThreshold(0).then(function() {
                        _this3.p = 0;
                        _this3.refreshNode.setLoading({
                            isLoading: false
                        });
                        _this3.setData({
                            isLoading: false,
                            triggered: false
                        });
                    });
                }, 200);
            },
            scrolltolower: function scrolltolower() {
                var that = this;
                // that.debounce(() => {
                // }, 500)();
                that.triggerEvent("loadmore");
            }
        }
    });