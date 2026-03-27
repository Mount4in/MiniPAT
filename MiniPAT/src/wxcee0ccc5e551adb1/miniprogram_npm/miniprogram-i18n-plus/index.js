Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.i18nInstance = exports.default = exports.I18n = void 0;
    var _objectSpread2 = require("../../@babel/runtime/helpers/objectSpread2");
    var _classCallCheck2 = require("../../@babel/runtime/helpers/classCallCheck");
    var _createClass2 = require("../../@babel/runtime/helpers/createClass");
    var t = exports.I18n = /*#__PURE__*/ function() {
        function t(_t) {
            _classCallCheck2(this, t);
            this.locale = void 0;
            this.locales = void 0;
            this.context = void 0;
            this.locale = "", this.locales = _t || {};
        }
        _createClass2(t, [{
            key: "setLocale",
            value: function setLocale(_t2) {
                this.locale = _t2;
            }
        }, {
            key: "getLocale",
            value: function getLocale() {
                return this.locale;
            }
        }, {
            key: "loadTranslations",
            value: function loadTranslations(_t3) {
                return this.locales = _t3, this.context && this.effect(this.context);
            }
        }, {
            key: "mergeTranslations",
            value: function mergeTranslations(_t4) {
                for (var _e in _t4) this.locales[_e] ? this.locales[_e] = _objectSpread2(_objectSpread2({}, this.locales[_e]), _t4[_e]) : this.locales[_e] = _t4[_e];
                return this.context && this.effect(this.context);
            }
        }, {
            key: "getLanguage",
            value: function getLanguage() {
                return this.locales[this.locale];
            }
        }, {
            key: "effect",
            value: function effect(_t5) {
                var _this = this;
                if (this.context = _t5, _t5.setData) return new Promise(function(e) {
                    _t5.setData({
                        $language: _this.getLanguage()
                    }, function() {
                        e(_t5.$language);
                    });
                });
            }
        }, {
            key: "toggleLanguage",
            value: function toggleLanguage(_t6) {
                return this.setLocale(_t6), this.effect(this.context);
            }
        }]);
        return t;
    }();
    var e = exports.i18nInstance = exports.default = new t();