require("../@babel/runtime/helpers/Arrayincludes");
    var _objectSpread2 = require("../@babel/runtime/helpers/objectSpread2");
    var _cryptoJs = _interopRequireDefault(require("crypto-js"));
    var _jsBase = require("js-base64");
    var _miniprogramI18nPlus = _interopRequireDefault(require("miniprogram-i18n-plus"));

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var qs = require("qs");
    var config = require("./config");
    var sign = require("./sign");
    var numberPrecision = require("number-precision");
    var date = new Date();
    date.setHours(date.getHours() + 1);
    var policyText = {
        expiration: date.toISOString(),
        // 设置policy过期时间。
        conditions: [
            // 限制上传大小。
            ["content-length-range", 0, 1024 * 1024 * 1024]
        ]
    };

    function computeSignature(accessKeySecret, canonicalString) {
        return _cryptoJs.default.enc.Base64.stringify(_cryptoJs.default.HmacSHA1(canonicalString, accessKeySecret));
    }
    var getFormDataParams = function getFormDataParams(credentials) {
        var policy = _jsBase.Base64.encode(JSON.stringify(policyText)); // policy必须为base64的string。
        var signature = computeSignature(credentials.accessKeySecret, policy);
        var formData = {
            OSSAccessKeyId: credentials.accessKeyId,
            signature: signature,
            policy: policy,
            securityToken: credentials.securityToken
        };
        return formData;
    };
    var formatTime = function formatTime(date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        return "".concat([year, month, day].map(formatNumber).join("/"), " ").concat([hour, minute, second].map(formatNumber).join(":"));
    };
    var formatNumber = function formatNumber(n) {
        n = n.toString();
        return n[1] ? n : "0".concat(n);
    };
    var request = function request(arg) {
        arg = sign(arg, config.appId, config.appSecret, "SHA256");
        config.method === "get" ? config.data = _objectSpread2({}, config.data) : config.data = qs.stringify(_objectSpread2({}, config.data));
        var language = _miniprogramI18nPlus.default.getLanguage();
        return new Promise(function(resolve, reject) {
            wx.request(_objectSpread2(_objectSpread2({}, arg), {}, {
                header: {
                    "Content-Type": "application/json",
                    Authorization: "".concat(wx.getStorageSync("token")) || "",
                    "Accept-Language": language.acceptLanguage
                },
                success: function success(res) {
                    if (res.header.authorization) {
                        wx.setStorageSync("token", res.header.authorization);
                    } else {
                        wx.setStorageSync("token", "");
                    }
                    if (["用户信息失效", "token解析异常"].includes(res.data.message)) {
                        goToLogin();
                        return reject(res);
                    }
                    resolve(res);
                },
                fail: function fail(err) {
                    reject(err);
                }
            }));
        });
    };
    var goToLogin = function goToLogin() {
        var pages = getCurrentPages();
        var currentPage = pages[pages.length - 1];
        if (currentPage.route === "pages/login/login") return;
        toastUtil("登录失效，即将跳转到登录页");
        var t = setTimeout(function() {
            wx.navigateTo({
                url: "/pages/login/login"
            });
            clearTimeout(t);
            t = null;
        }, 2000);
    };
    /**
     * toast 弹出
     * msg：文案
     * icon：success，error，none (String 类型)
     * time：ms
     */
    var toastUtil = function toastUtil(options) {
        if (typeof options === "string") {
            options = {
                title: options,
                icon: "none",
                duration: 2000
            };
        }
        wx.showToast(options);
    };

    /* 乘法精度工具 */
    var accMulUtil = function accMulUtil(arg1, arg2) {
        var m = 0,
            s1 = arg1.toString(),
            s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length;
        } catch (e) {}
        try {
            m += s2.split(".")[1].length;
        } catch (e) {}
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    };

    /* 加法精度 */
    var accAddUtil = function accAddUtil(arg1, arg2) {
        return numberPrecision.plus(arg1, arg2);
    };

    /* 减法精度 */
    var accSubUtil = function accSubUtil(arg1, arg2) {
        return numberPrecision.minus(arg1, arg2);
    };

    /* 手机号加密 */
    var encryptPhone = function encryptPhone(mobile) {
        if (!mobile) {
            return "-";
        }
        return mobile.replace(/(\d{3})\d*(\d{4})/, "$1****$2");
    };
    var formatPhone = function formatPhone(val) {
        return !/^1\d{10}$/.test(val);
    };
    var emailRegex = function emailRegex(val) {
        var emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return !emailRegex.test(val);
    };
    // 身份证号码校验
    var verifyIdCard = function verifyIdCard(val) {
        var idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        return idCardRegex.test(val);
    };
    /* 防抖函数 */
    var myDebounce = function myDebounce(handle, wait, immediate) {
        // 参数类型判断 & 默认值
        if (typeof handle !== "function") throw new Error("handle must be an function");
        if (typeof wait === "undefined") wait = 300;
        if (typeof wait === "boolean") {
            immediate = wait;
            wait = 300;
        }
        if (typeof immediate !== "boolean") immediate = false;
        // 所谓的防抖效果，我们想要实现的是，有一个“人”可以管理 handle 的执行次数
        // 函数柯里化的应用
        // 如果我们想要执行最后一次，那就意味着无论我们前面点击了多少次，前面的 N-1 次都无用
        var timer = null;
        return function proxy() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }
            var self = this;
            var init = immediate && !timer;
            clearTimeout(timer);
            timer = setTimeout(function() {
                timer = null;
                // eslint-disable-next-line no-unused-expressions
                !immediate ? handle.call.apply(handle, [self].concat(args)) : null;
            }, wait);
            // 如果当前传递进来的是 true 就需要立即执行
            // 如果想要实现只在第一次就执行，那么可以添加上 timer 为 null 来作为判断
            // 因为只要 timer 为 null 就以为这没有第二次，不会往下走...点击
            // eslint-disable-next-line no-unused-expressions
            init ? handle.call.apply(handle, [self].concat(args)) : null;
        };
    };
    var throttle = function throttle(fn, gapTime) {
        if (gapTime == null || gapTime == undefined) {
            gapTime = 1500;
        }
        var _lastTime = null;

        // 返回新的函数
        return function() {
            var _nowTime = +new Date();
            if (_nowTime - _lastTime > gapTime || !_lastTime) {
                fn.apply(this, arguments); //将this和参数传给原函数
                _lastTime = _nowTime;
            }
        };
    };
    var systemInfo;
    var getSystemInfoSync = function getSystemInfoSync() {
        if (!systemInfo) {
            systemInfo = wx.getSystemInfoSync();
        }
        return systemInfo;
    };
    module.exports = {
        formatTime: formatTime,
        request: request,
        toastUtil: toastUtil,
        accMulUtil: accMulUtil,
        accAddUtil: accAddUtil,
        accSubUtil: accSubUtil,
        getFormDataParams: getFormDataParams,
        myDebounce: myDebounce,
        throttle: throttle,
        encryptPhone: encryptPhone,
        formatPhone: formatPhone,
        emailRegex: emailRegex,
        getSystemInfoSync: getSystemInfoSync,
        verifyIdCard: verifyIdCard
    };