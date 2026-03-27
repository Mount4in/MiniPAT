// pages/resumeDetial/resumeDetial.js
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            activityIndex: 0,
            applyParam: null,
            // 简历投递参数
            showTab: true,
            signType: null
        },
        /**
         * 生命周期函数--监听页面加载
         * applyParam（非必须）:简历投递参数, 传递的话在保存时会使用改参数进行投递
         * signType（非必须）：简历完善进入类型，social：社招-简历完善，blue：蓝领-简历完善
         */
        onLoad: function onLoad(options) {
            var applyParam = options.applyParam,
                signType = options.signType;
            applyParam && this.setData({
                applyParam: JSON.parse(applyParam)
            });
            if (signType) {
                this.setData({
                    activityIndex: signType === "social" ? 0 : 1,
                    showTab: false,
                    signType: signType
                });
            }
        },
        onShow: function onShow() {
            var signType = this.data.signType;
            wx.setNavigationBarTitle({
                title: signType === "social" ? "社招-简历完善" : signType === "blue" ? "蓝领-简历完善" : "我的简历" //修改title
            });
        },
        onTabChange: function onTabChange(evt) {
            this.setData({
                activityIndex: +evt.target.dataset.index
            });
        }
    });