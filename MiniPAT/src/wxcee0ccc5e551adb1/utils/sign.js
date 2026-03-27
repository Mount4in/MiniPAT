var CryptoJS = require('crypto-js');

    // SHA256
    var sha256 = function sha256(data) {
        return CryptoJS.SHA256(data).toString();
    };
    // MD5
    var md5 = function md5(data) {
        return CryptoJS.MD5(data).toString();
    };
    var getDateTimeToString = function getDateTimeToString() {
        var date_ = new Date();
        var year = date_.getFullYear();
        var month = date_.getMonth() + 1;
        var day = date_.getDate();
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        var hours = date_.getHours();
        var mins = date_.getMinutes();
        var secs = date_.getSeconds();
        var msecs = date_.getMilliseconds();
        if (hours < 10) hours = '0' + hours;
        if (mins < 10) mins = '0' + mins;
        if (secs < 10) secs = '0' + secs;
        if (msecs < 10) secs = '0' + msecs;
        return year + '' + month + '' + day + '' + hours + '' + mins + '' + secs;
    };
    var getNonce = function getNonce() {
        return Math.random().toString(36).substring(2);
    };

    /**
     * 接口参数签名
     * @param {*} config 请求配置
     */
    module.exports = function(config, appId, appSecret, signType) {
        // 获取到秒级的时间戳,与后端对应
        var data = {
            APP_ID: appId,
            TIMESTAMP: getDateTimeToString(),
            SIGN_TYPE: signType,
            NONCE: getNonce()
        };
        var _singKey = 'SIGN';
        var _secretKey = 'SECRET_KEY';
        var keys = [];
        if (config.method === 'get') {
            // url参数签名
            data = config.data = Object.assign(config.data ? config.data : {}, data);
            keys = Object.keys(data);
        } else {
            // request body参数的内容
            data = config.data = Object.assign(config.data ? config.data : {}, data);
            keys = Object.keys(data);
        }
        // 排序
        var skeys = keys.sort();
        var str = '';
        skeys.filter(function(k) {
            return k !== _singKey && k !== _secretKey;
        }).map(function(k) {
            var v = data[k];
            if (v || v === 0) {
                // 参数值为空，则不参与签名
                str = str + k + '=' + v + '&';
            }
        });
        str = str + _secretKey + '=' + appSecret;
        var sign = '';
        if (data.SIGN_TYPE === 'MD5') {
            sign = md5(str).toUpperCase();
        }
        if (data.SIGN_TYPE === 'SHA256') {
            sign = sha256(str).toUpperCase();
        }
        if (config.method === 'get') {
            config.data[_singKey] = sign;
        } else {
            config.data[_singKey] = sign;
        }
        return config;
    };