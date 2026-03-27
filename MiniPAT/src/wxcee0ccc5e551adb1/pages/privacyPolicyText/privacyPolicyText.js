var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/privacyPolicyText/privacyPolicyText.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page({
        /**
         * 页面的初始数据
         */
        data: {
            loginStatus: 0,
            type: "",
            titleData: {
                summary: '隐私政策摘要',
                policy: '隐私政策',
                inventory: '个人信息收集清单',
                share: '第三方信息数据共享'
            },
            timeHeight1: 0,
            timeHeigh2: 0,
            timeHeigh3: 0,
            timeHeight11: 0,
            timeHeight22: 0,
            timeHeight12: 0,
            list: [{
                time: '场景/业务功能',
                data: [{
                    date: '收集个人信息',
                    userList: []
                }, {
                    date: '收集目的',
                    userList: []
                }, {
                    date: '收集方式',
                    userList: []
                }]
            }, {
                time: '注册、登录',
                data: [{
                    date: '收集个人信息',
                    userList: [{
                        code: '000',
                        name: '手机号'
                    }]
                }, {
                    date: '收集目的',
                    userList: [{
                        code: '000',
                        name: '用于核实用户身份信息'
                    }]
                }, {
                    date: '收集方式',
                    userList: [{
                        code: '000',
                        name: '手动输入'
                    }]
                }]
            }, {
                time: '我的简历',
                data: [{
                    date: '收集个人信息',
                    userList: [{
                        code: '000',
                        name: '姓名、手机号、邮箱'
                    }, {
                        code: '000',
                        name: '文件'
                    }]
                }, {
                    date: '收集目的',
                    userList: [{
                        code: '000',
                        name: '用于投递简历'
                    }, {
                        code: '000',
                        name: '上传附件简历'
                    }]
                }, {
                    date: '收集方式',
                    userList: [{
                        code: '000',
                        name: '手动输入'
                    }, {
                        code: '000',
                        name: '手动上传'
                    }]
                }]
            }],
            listshare: [{
                time: '第三方名称',
                data: [{
                    date: '使用目的',
                    userList: []
                }, {
                    date: '所属公司',
                    userList: []
                }, {
                    date: '信息获取',
                    userList: []
                }, {
                    date: '第三方隐私政策链接',
                    userList: []
                }]
            }, {
                time: '微信SDK',
                data: [{
                    date: '使用目的',
                    userList: [{
                        code: '000',
                        name: '位置信息、手机号等权限获取'
                    }]
                }, {
                    date: '所属公司',
                    userList: [{
                        code: '000',
                        name: '深圳市腾讯计算机系统有限公司'
                    }]
                }, {
                    date: '信息获取',
                    userList: [{
                        code: '000',
                        name: '设备标识符(IMEI、ANDROID ID、Seria1)MAC地址、IP地址、WLAN接入点'
                    }]
                }, {
                    date: '第三方隐私政策链接',
                    userList: [{
                        code: '000',
                        name: 'https://privacy.qq.com/policy/tencent-privacypolicy',
                        type: 'link'
                    }]
                }]
            }, {
                time: 'BuglySDK',
                data: [{
                    date: '使用目的',
                    userList: [{
                        code: '000',
                        name: '排查崩溃问题，帮助提升稳定性'
                    }]
                }, {
                    date: '所属公司',
                    userList: [{
                        code: '000',
                        name: '深圳市腾讯计算机系统有限公司'
                    }]
                }, {
                    date: '信息获取',
                    userList: [{
                        code: '000',
                        name: '手机型号、手机品牌、Android系统版本、Android系统api等级、厂商系统版本、cpu架构类型、设备是否root、磁盘空间占用大小、sdcard空间占用大小、内存空间占用大小、网络类型'
                    }]
                }, {
                    date: '第三方隐私政策链接',
                    userList: [{
                        code: '000',
                        name: 'https://static.bugly.qq.com/bugly-sdk-privacy-statement.pdf',
                        type: 'link',
                        nodes: [{
                            name: 'a',
                            attrs: {
                                href: 'https://static.bugly.qq.com/bugly-sdk-privacy-statement.pdf',
                                class: 'tr_td_row link'
                            },
                            children: [{
                                type: 'text',
                                text: 'https://static.bugly.qq.com/bugly-sdk-privacy-statement.pdf'
                            }]
                        }]
                    }]
                }]
            }],
            listshare1: [{
                time: '所涉第三方',
                data: [{
                    date: '个人信息',
                    userList: []
                }, {
                    date: '使用目的',
                    userList: []
                }, {
                    date: '使用场景',
                    userList: []
                }, {
                    date: '共享方式',
                    userList: []
                }]
            }, {
                time: '岗位所在公司',
                data: [{
                    date: '个人信息',
                    userList: [{
                        code: '000',
                        name: '在线简历/附件简历'
                    }]
                }, {
                    date: '使用目的',
                    userList: [{
                        code: '000',
                        name: '将应聘者的简历投递至岗位所在公司'
                    }]
                }, {
                    date: '使用场景',
                    userList: [{
                        code: '000',
                        name: '投递简历'
                    }]
                }, {
                    date: '共享方式',
                    userList: [{
                        code: '000',
                        name: 'API传输'
                    }]
                }]
            }]
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            console.log(options, "options");
            this.setData({
                type: options.type
            });
            wx.setNavigationBarTitle({
                title: this.data.titleData[this.data.type]
            });
        },
        toggle: function toggle() {
            var url = '/pages/privacyPolicyTextEn/privacyPolicyText?type=' + this.data.type;
            wx.redirectTo({
                url: url
            });
        },
        withdrawalOfconsent: function withdrawalOfconsent() {
            util.request({
                url: _api.default.userLoginOut,
                method: "GET"
            }).then(function(result) {
                if (result.data.code == 0) {
                    app.globalData.loginStatus = 0;
                    app.globalData.userInfo = {};
                    wx.setStorageSync('token', '');
                    util.toastUtil('撤销同意条款成功');
                    wx.switchTab({
                        url: '/pages/personalCenter/personalCenter'
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        goShare: function goShare() {
            var url = '/pages/privacyPolicyText/privacyPolicyText?type=share';
            if (this.data.$language.locale == "en_US") {
                url = '/pages/privacyPolicyTextEn/privacyPolicyText?type=share';
            }
            wx.navigateTo({
                url: url
            });
        },
        personalList: function personalList() {
            var url = '/pages/privacyPolicyText/privacyPolicyText?type=inventory';
            if (this.data.$language.locale == "en_US") {
                url = '/pages/privacyPolicyTextEn/privacyPolicyText?type=inventory';
            }
            wx.navigateTo({
                url: url
            });
        },
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {
            var _this = this;
            if (this.data.type == 'inventory') {
                var query = wx.createSelectorQuery();
                query.select('.tableRow1').boundingClientRect(function(rect) {
                    //获取到元素
                    var height = rect.height;
                    //给页面赋值
                    _this.setData({
                        timeHeight1: height - 1 //不减1 边框线对不齐
                    });
                }).exec();
                query.select('.tableRow2').boundingClientRect(function(rect) {
                    var height = rect.height;
                    _this.setData({
                        timeHeight2: height - 1
                    });
                }).exec();
                query.select('.tableRow3').boundingClientRect(function(rect) {
                    var height = rect.height;
                    _this.setData({
                        timeHeight3: height - 1
                    });
                }).exec();
            }
            if (this.data.type == 'share') {
                var _query = wx.createSelectorQuery();
                _query.select('.tableRow1').boundingClientRect(function(rect) {
                    //获取到元素
                    var height = rect.height;
                    //给页面赋值
                    _this.setData({
                        timeHeight11: height - 1 //不减1 边框线对不齐
                    });
                }).exec();
                _query.select('.tableRow2').boundingClientRect(function(rect) {
                    var height = rect.height;
                    _this.setData({
                        timeHeight22: height - 1
                    });
                }).exec();
                _query.select('.tableRowBottom1').boundingClientRect(function(rect) {
                    var height = rect.height;
                    _this.setData({
                        timeHeight12: height - 1
                    });
                }).exec();
            }
        },
        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function onShow() {
            this.setData({
                loginStatus: app.globalData.loginStatus
            });
        },
        /**
         * 生命周期函数--监听页面隐藏
         */
        onHide: function onHide() {},
        /**
         * 生命周期函数--监听页面卸载
         */
        onUnload: function onUnload() {},
        /**
         * 页面相关事件处理函数--监听用户下拉动作
         */
        onPullDownRefresh: function onPullDownRefresh() {},
        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function onReachBottom() {},
        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function onShareAppMessage() {}
    });