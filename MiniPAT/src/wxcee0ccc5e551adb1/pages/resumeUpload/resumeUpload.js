var _defineProperty2 = require("../../@babel/runtime/helpers/defineProperty");
    var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/resumeUpload/resumeUpload.js

    var util = require('@/utils/util.js');
    var app = getApp();
    Page(_defineProperty2(_defineProperty2(_defineProperty2(_defineProperty2(_defineProperty2(_defineProperty2({
        /**
         * 页面的初始数据
         */
        data: {
            staticImageUrl: _api.default.staticImageUrl,
            fileList: '',
            resumeList: [],
            bindMyresumeInput: '',
            Myresume: '',
            Myname: '',
            Iphone: "",
            Email: "",
            IphoneMessage: '',
            EmailMessage: '',
            MyresumeMessage: '',
            MynameMessage: "",
            id: '',
            privacyPolicyShow: false,
            alreadyUpload: false
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            var _this = this;
            if (options.length == 0) {
                this.setData({
                    Myresume: this.data.$language.resumeUpload.defaultResumeName
                });
            }
            var eventChannel = this.getOpenerEventChannel();
            eventChannel.on('acceptDataFromOpenerPage', function(data) {
                _this.setData({
                    Myresume: data.data.resumeName,
                    Myname: data.data.userName,
                    Iphone: data.data.phoneNumber,
                    Email: data.data.email,
                    id: data.data.id,
                    fileList: {
                        fileName: data.data.fileName,
                        path: data.data.path,
                        createTime: data.data.createTime
                    }
                });
                wx.setNavigationBarTitle({
                    title: _this.data.$language.resumeUpload.modifyResume
                });
            });
        },
        onShow: function onShow() {},
        onChange: function onChange(e) {
            this.setData({
                Myresume: e.detail.value
            });
        },
        onChange1: function onChange1(e) {
            this.setData({
                Myname: e.detail.value
            });
        },
        onChange2: function onChange2(e) {
            this.setData({
                Iphone: e.detail.value
            });
        },
        onChange3: function onChange3(e) {
            this.setData({
                Email: e.detail.value
            });
        },
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {},
        delete: function _delete() {
            this.setData({
                fileList: ''
            });
        },
        sumbit: function sumbit() {
            this.setData({
                IphoneMessage: "",
                EmailMessage: "",
                MynameMessage: "",
                MyresumeMessage: ""
            });
            console.log(this.data.Myresume, !this.data.Myresume, "this.data.Myresume");
            console.log(this.data.Myname, !this.data.Myname, "this.data.Myname");
            var language = this.data.$language.resumeUpload;
            if (!this.data.Myresume) {
                // this.setData({
                //   MyresumeMessage: "请输入用户名"
                // })
                util.toastUtil(language.verifyResumeName);
                return;
            }
            if (!this.data.Myname) {
                // this.setData({
                //   MynameMessage: "请输入姓名"
                // })
                util.toastUtil(language.verifyName);
                return;
            }
            if (util.formatPhone(this.data.Iphone)) {
                // this.setData({
                //   IphoneMessage: "手机号格式错误"
                // })
                util.toastUtil(language.verifyPhone);
                return;
            }
            if (util.emailRegex(this.data.Email)) {
                // this.setData({
                //   EmailMessage: "邮箱格式错误"
                // })
                util.toastUtil(language.verifyEmail);
                return;
            }
            if (!this.data.fileList) {
                util.toastUtil(language.verifyAttachment);
                return;
            }
            util.request({
                url: _api.default.addResume,
                method: "POST",
                data: {
                    'id': this.data.id ? this.data.id : undefined,
                    "email": this.data.Email,
                    "phoneNumber": this.data.Iphone,
                    "resumeName": this.data.Myresume,
                    "resumeUrl": this.data.fileList.path,
                    "fileName": this.data.fileList.fileName,
                    "userId": app.globalData.userInfo.userId,
                    "userName": this.data.Myname
                }
            }).then(function(result) {
                if (result.data.code === 0) {
                    util.toastUtil(language.uploadSuccessful);
                    wx.navigateBack({
                        delta: 1
                    });
                } else {
                    util.toastUtil(result.data.message);
                }
            }).catch(function(error) {});
        },
        cancle: function cancle() {
            wx.navigateBack({
                delta: 1
            });
            this.setData({
                fileList: '',
                resumeList: [],
                bindMyresumeInput: '',
                Myresume: '',
                Myname: '',
                Iphone: "",
                Email: "",
                IphoneMessage: '',
                EmailMessage: ''
            });
        },
        onClose: function onClose() {
            this.setData({
                privacyPolicyShow: false
            });
        },
        afterReadPop: function afterReadPop() {
            if (this.data.alreadyUpload) {
                this.afterRead();
                return;
            }
            this.setData({
                privacyPolicyShow: true
            });
        },
        afterRead: function afterRead() {
            var that = this;
            that.onClose();
            this.setData({
                alreadyUpload: true
            });
            wx.chooseMessageFile({
                count: 1,
                //默认100，限制上传的数量
                // extension:['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'ppt'],
                //想要上传的文件类型,但是对于部分微信版本，该方法失效，所以可以采用下面的方法判断
                success: function success(res) {
                    var isMaxSize = res.tempFiles[0].size / 1024 / 1024 < 10;
                    var type = res.tempFiles[0].name.substring(res.tempFiles[0].name.lastIndexOf('.') + 1);
                    var arr = ['doc', 'docx', 'jpg', 'jpeg', 'pdf', 'ppt', 'pptx'];
                    console.log(arr.indexOf(type), "文件格式");
                    if (arr.indexOf(type) == -1) {
                        wx.showToast({
                            icon: 'none',
                            mask: true,
                            title: this.data.$language.resumeUpload.verifyFileFormat,
                            //保存路径
                            duration: 2000
                        });
                    } else {
                        if (!isMaxSize) {
                            wx.showToast({
                                icon: 'none',
                                mask: true,
                                title: this.data.$language.resumeUpload.verifyFileSize,
                                //保存路径
                                duration: 2000
                            });
                        } else {
                            that.upLoadFileByUni(res);
                        }
                    }
                },
                complete: function complete() {}
            });
        },
        //上传文件
        upLoadFileByUni: function upLoadFileByUni(res) {
            var _this2 = this;
            var that = this;
            wx.showLoading({
                title: this.data.$language.resumeUpload.uploading
            });
            wx.uploadFile({
                url: _api.default.fileUpload,
                filePath: res.tempFiles[0].path,
                name: 'multipartFile',
                formData: {
                    //调用上传接口需要的参数
                    type: res.tempFiles[0].type,
                    name: res.tempFiles[0].name //后端需要用它来获取文件的名字
                },

                header: {
                    'Content-Type': "multipart/form-data",
                    'Authorization': "".concat(wx.getStorageSync('token')) || ''
                },
                success: function success(uploadFileRes) {
                    console.log("上传成功", uploadFileRes);
                    that.setData({
                        fileList: JSON.parse(uploadFileRes.data).data
                    });
                    util.toastUtil(_this2.data.$language.resumeUpload.uploadSuccessful);
                },
                complete: function complete(res) {
                    console.log(res);
                    wx.hideLoading();
                }
            });
        }
    }, "onShow", function onShow() {}), "onHide", function onHide() {}), "onUnload", function onUnload() {}), "onPullDownRefresh", function onPullDownRefresh() {}), "onReachBottom", function onReachBottom() {}), "onShareAppMessage", function onShareAppMessage() {}));