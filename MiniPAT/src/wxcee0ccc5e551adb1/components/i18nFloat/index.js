// components/i18nFloat/index.js
    Component({
        properties: {
            position: {
                type: Object,
                value: {
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0
                } // left、top、right、bottom
            },

            left: {
                type: Number,
                value: 0
            },
            right: {
                type: Number,
                value: 15
            },
            top: {
                type: Number,
                value: 0
            },
            bottom: {
                type: Number,
                value: 0
            },
            hMargin: {
                // 拖动后的水平方向最小边距（左右边距）
                type: Number,
                value: 15
            },
            vMargin: {
                // 拖动后的垂直方向最小边距(上下边距)
                type: Number,
                value: 15
            },
            disabled: Boolean
        },
        data: {
            x: 999,
            y: 300,
            windowWidth: wx.getSystemInfoSync().windowWidth,
            windowHeight: wx.getSystemInfoSync().windowHeight,
            elementWidth: 0,
            elementHeight: 0,
            animation: false,
            isMoved: false // 是否拖动
        },

        lifetimes: {
            attached: function attached() {
                var _this = this;
                console.log('disabled', this.data.disabled);
                // 初始化位置
                wx.createSelectorQuery().in(this).select('.float-box').boundingClientRect().exec(function(res) {
                    // console.log(233, res);
                    _this.data.elementWidth = res[0].width;
                    _this.data.elementHeight = res[0].height;
                    if (_this.properties.position.left || _this.properties.left) {
                        _this.data.x = _this.properties.position.left || _this.properties.left;
                    }
                    if (_this.properties.position.right || _this.properties.right) {
                        _this.data.x = _this.data.windowWidth - _this.data.elementWidth - (_this.properties.position.right ? _this.properties.position.right : _this.properties.right);
                    }
                    if (_this.properties.position.top || _this.properties.top) {
                        _this.data.y = _this.properties.position.top || _this.properties.top;
                    }
                    if (_this.properties.position.bottom || _this.properties.bottom) {
                        _this.data.y = _this.data.windowHeight - _this.data.elementHeight - (_this.properties.position.bottom ? _this.properties.position.bottom : _this.properties.bottom);
                    }
                    _this.setData({
                        elementWidth: _this.data.elementWidth,
                        elementHeight: _this.data.elementHeight,
                        x: _this.data.x,
                        y: _this.data.y
                    });
                });
            }
        },
        /**
         * 组件的方法列表
         */
        methods: {
            onToggle: function onToggle() {
                if (this.data.disabled) {
                    return;
                }
                var parentPage = this.selectOwnerComponent();
                parentPage.$toggleLanguage();
                this.triggerEvent("toggle");
            },
            onTouchend: function onTouchend(e) {
                console.log(this.data.isMoved, this.data.x, e.changedTouches[0].clientX, this.data.elementWidth);
                if (!this.data.isMoved) return;
                var currentX = e.changedTouches[0].clientX;
                var currentY = e.changedTouches[0].clientY;
                if (currentY <= this.properties.vMargin) {
                    currentY = this.properties.vMargin + this.data.elementHeight / 2;
                }
                if (currentY >= this.data.windowHeight - this.properties.vMargin) {
                    currentY = this.data.windowHeight - this.properties.vMargin - this.data.elementHeight / 2;
                }
                if (currentX + this.data.elementWidth / 2 > this.data.windowWidth / 2) {
                    this.setData({
                        x: this.data.windowWidth - this.properties.hMargin - this.data.elementWidth,
                        y: currentY - this.data.elementHeight / 2
                    });
                }
                if (currentX + this.data.elementWidth / 2 <= this.data.windowWidth / 2) {
                    this.setData({
                        x: this.properties.hMargin,
                        y: currentY - this.data.elementHeight / 2
                    });
                }
            },
            addAnimation: function addAnimation() {
                this.data.isMoved = false;
                if (!this.data.animation) {
                    this.setData({
                        animation: true
                    });
                }
            },
            onTouchMove: function onTouchMove() {
                this.data.isMoved = true;
            }
        }
    });