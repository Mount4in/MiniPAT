var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            h5Url: ''
        },
        onLoad: function onLoad(options) {
            this.setData({
                h5Url: decodeURIComponent(options.h5Url)
            });
        }
    });