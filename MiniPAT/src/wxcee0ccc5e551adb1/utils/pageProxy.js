Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.componentProxy = componentProxy;
    exports.pageProxy = pageProxy;
    var _objectSpread2 = require("../@babel/runtime/helpers/objectSpread2");

    function onLoadProxy(onLoad) {
        return function newOnLoad(query) {
            if (!this.i18n) {
                var _require = require('miniprogram-i18n-plus'),
                    i18nInstance = _require.i18nInstance;
                this.i18n = i18nInstance;
            }
            return onLoad.call(this, query);
        };
    }

    function onShowProxy(onShow) {
        return function newOnShow() {
            if (!this.i18n) {
                var _require2 = require('miniprogram-i18n-plus'),
                    i18nInstance = _require2.i18nInstance;
                this.i18n = i18nInstance;
            }
            this.i18n.effect(this);
            wx.setNavigationBarTitle({
                title: this.data.$language[this.route] || this.data.$language.windowTitle
            });
            // 处理进入二级页面切换语言时， wx.setTabBarItem无法切换tabbar问题
            this.data.$language.tabbar.forEach(function(tab, index) {
                wx.setTabBarItem({
                    index: index,
                    text: tab
                });
            });
            return onShow.call(this);
        };
    }

    function $toggleLanguage() {
        this.i18n.locale === 'zh_CN' ? this.i18n.toggleLanguage('en_US') : this.i18n.toggleLanguage('zh_CN');
        wx.setNavigationBarTitle({
            title: this.data.$language[this.route] || this.data.$language.windowTitle
        });
        this.data.$language.tabbar.forEach(function(tab, index) {
            wx.setTabBarItem({
                index: index,
                text: tab
            });
        });
        wx.showToast({
            icon: 'success',
            title: this.i18n.locale === 'zh_CN' ? '切换成功' : 'Successful'
        });
    }

    function pageProxy(Page) {
        return function newPage(options) {
            console.log("options==>", options);
            options.onLoad = options.onLoad || function noop() {};
            options.onShow = options.onShow || function noop() {};
            var newOptions = _objectSpread2({}, options);
            newOptions.onLoad = onLoadProxy(options.onLoad);
            newOptions.onShow = onShowProxy(options.onShow);
            newOptions.$toggleLanguage = $toggleLanguage;
            Page(newOptions);
        };
    }

    // 以Component构造的页面
    function componentProxy(Component) {
        return function newComponent(options) {
            options.methods = options.methods || {};
            options.methods.onShow = options.methods.onShow || function noop() {};
            var newOptions = _objectSpread2({}, options);
            newOptions.methods.onShow = onShowProxy(options.methods.onShow);
            newOptions.methods.$toggleLanguage = $toggleLanguage;
            Component(newOptions);
        };
    }
    Page = pageProxy(Page);
    Component = componentProxy(Component);