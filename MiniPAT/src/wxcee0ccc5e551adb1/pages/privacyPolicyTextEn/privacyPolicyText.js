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
                summary: "Privacy Policy Summary",
                policy: "Privacy Policy",
                inventory: "Personal Information Collection Inventory",
                share: "Third-Party Information Data Sharing"
            },
            timeHeight1: 0,
            timeHeigh2: 0,
            timeHeigh3: 0,
            timeHeight11: 0,
            timeHeight22: 0,
            timeHeight12: 0,
            list: [{
                time: 'Scenario/Business Function',
                data: [{
                    date: 'Collection of Personal Information',
                    userList: []
                }, {
                    date: 'Purpose of Collection',
                    userList: []
                }, {
                    date: 'Method of Collection',
                    userList: []
                }]
            }, {
                time: 'Registration and login',
                data: [{
                    date: 'Collect personal information',
                    userList: [{
                        code: '000',
                        name: 'cell-phone number'
                    }]
                }, {
                    date: 'Collection purpose',
                    userList: [{
                        code: '000',
                        name: 'Used to verify user identity information'
                    }]
                }, {
                    date: 'Collection method',
                    userList: [{
                        code: '000',
                        name: 'Manual input'
                    }]
                }]
            }, {
                time: 'My resume',
                data: [{
                    date: 'Collect personal information',
                    userList: [{
                        code: '000',
                        name: 'Name, phone number, email'
                    }, {
                        code: '000',
                        name: 'file'
                    }]
                }, {
                    date: 'Collection purpose',
                    userList: [{
                        code: '000',
                        name: 'Used for submitting resumes'
                    }, {
                        code: '000',
                        name: 'Upload attached resume'
                    }]
                }, {
                    date: 'Collection method',
                    userList: [{
                        code: '000',
                        name: 'Manual input'
                    }, {
                        code: '000',
                        name: 'Manual Upload'
                    }]
                }]
            }],
            listshare: [{
                time: 'Third party name',
                data: [{
                    date: 'purpose',
                    userList: []
                }, {
                    date: 'Affiliated company',
                    userList: []
                }, {
                    date: 'information acquisition',
                    userList: []
                }, {
                    date: 'Third party privacy policy link',
                    userList: []
                }]
            }, {
                time: 'WeChat SDK',
                data: [{
                    date: 'purpose',
                    userList: [{
                        code: '000',
                        name: 'Access to location information, phone number, and other permissions'
                    }]
                }, {
                    date: 'Affiliated company',
                    userList: [{
                        code: '000',
                        name: 'Shenzhen Tencent Computer Systems Co., Ltd'
                    }]
                }, {
                    date: 'information acquisition',
                    userList: [{
                        code: '000',
                        name: 'Device identifiers (IMEI, ANDROID ID, Seria1) MAC address, IP address, WLAN access point'
                    }]
                }, {
                    date: 'Third party privacy policy link',
                    userList: [{
                        code: '000',
                        name: 'https://privacy.qq.com/policy/tencent-privacypolicy',
                        type: 'link'
                    }]
                }]
            }, {
                time: 'BuglySDK',
                data: [{
                    date: 'purpose',
                    userList: [{
                        code: '000',
                        name: 'Troubleshooting crash issues to help improve stability'
                    }]
                }, {
                    date: 'Affiliated company',
                    userList: [{
                        code: '000',
                        name: 'Shenzhen Tencent Computer Systems Co., Ltd'
                    }]
                }, {
                    date: 'information acquisition',
                    userList: [{
                        code: '000',
                        name: 'Phone model, phone brand, Android system version, Android system API level, manufacturer system version, CPU architecture type, whether the device is root, disk space usage size, sdcard space usage size, memory space usage size, network type'
                    }]
                }, {
                    date: 'Third party privacy policy link',
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
                time: 'Third parties involved',
                data: [{
                    date: 'Personal Information',
                    userList: []
                }, {
                    date: 'purpose',
                    userList: []
                }, {
                    date: 'Usage scenario',
                    userList: []
                }, {
                    date: 'Sharing method',
                    userList: []
                }]
            }, {
                time: 'The company where the position is located',
                data: [{
                    date: 'Personal Information',
                    userList: [{
                        code: '000',
                        name: 'Online resume/attachment resume'
                    }]
                }, {
                    date: 'purpose',
                    userList: [{
                        code: '000',
                        name: "Submit the applicant's resume to the company where the position is located"
                    }]
                }, {
                    date: 'Usage scenario',
                    userList: [{
                        code: '000',
                        name: 'Submit resume'
                    }]
                }, {
                    date: 'Sharing method',
                    userList: [{
                        code: '000',
                        name: 'API transfer'
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
            var url = '/pages/privacyPolicyText/privacyPolicyText?type=' + this.data.type;
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
                    util.toastUtil('Successfully revoked consent terms');
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