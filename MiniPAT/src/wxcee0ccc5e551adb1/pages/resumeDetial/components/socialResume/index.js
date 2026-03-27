require("../../../../@babel/runtime/helpers/Arrayincludes");
    var _defineProperty2 = require("../../../../@babel/runtime/helpers/defineProperty");
    var _objectSpread2 = require("../../../../@babel/runtime/helpers/objectSpread2");
    var _objectWithoutProperties2 = require("../../../../@babel/runtime/helpers/objectWithoutProperties");
    var _slicedToArray2 = require("../../../../@babel/runtime/helpers/slicedToArray");
    var _api = _interopRequireDefault(require("@/utils/api.js"));
    var _util = _interopRequireDefault(require("@/utils/util"));
    var _dayjs = _interopRequireDefault(require("dayjs"));
    var _event = _interopRequireDefault(require("@/utils/event.js"));
    var _excluded = ["attachmentList"];

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    var app = getApp();
    var nowDate = new Date();
    Component({
        properties: {
            applyParam: null // 简历投递参数
        },

        data: {
            detail: {
                mobile: app.globalData.userInfo.phoneNumber,
                workFlag: 1,
                workItemList: [{
                    company: "",
                    endDate: "",
                    startDate: "",
                    workMonth: "",
                    position: ""
                }]
            },
            dictList: {},
            fileList: "",
            showArearSelect: false,
            areaProp: "",
            privacyPolicyShow: false,
            alreadyUpload: false,
            staticImageUrl: _api.default.staticImageUrl,
            isEdit: false,
            maxDate: "".concat(nowDate.getFullYear(), "-").concat(nowDate.getMonth() + 1, "-").concat(nowDate.getDate()),
            arearSelectValue: {},
            pickerDefautIndex: {}
        },
        lifetimes: {
            attached: function attached() {
                var _this = this;
                Promise.all([this.getDicList(), this.getDetial()]).then(function() {
                    var t = setTimeout(function() {
                        [
                            ["nation", "NATION"],
                            ["politicalAffiliation", "POLITICS_STATUS"],
                            ["maritalStatus", "MARITAL_STATUS"],
                            ["medicalHistory", "DISEASE_STATES"],
                            ["englishTypeCode", "ENG_LEVEL"],
                            ["educationDegree", "DEGREE"],
                            ["applicantCategory", "RECRUIT_EMP_TYPE"]
                        ].forEach(function(_ref) {
                            var _ref2 = _slicedToArray2(_ref, 2),
                                prop = _ref2[0],
                                listProp = _ref2[1];
                            _this.initPickerIndex(listProp, prop);
                        });
                        clearTimeout(t);
                        t = null;
                    }, 500);
                });
            }
        },
        methods: {
            getDicList: function getDicList() {
                var _this2 = this;
                _util.default.request({
                    url: _api.default.getDictList,
                    method: "POST",
                    data: {
                        categoryCodeList: ["NATION", "POLITICS_STATUS", "MARITAL_STATUS", "DISEASE_STATES", "ENG_LEVEL", "RECRUIT_EMP_TYPE", "DEGREE"]
                    }
                }).then(function(res) {
                    _this2.setData({
                        dictList: res.data.data || {}
                    });
                });
            },
            getDetial: function getDetial() {
                var _this3 = this;
                var ignoreLocal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                // 有暂存的资料，使用暂存的
                if (!ignoreLocal && this.getLocalDetail()) {
                    return;
                }
                // 没有暂存的，查询线上保存的资料
                wx.showLoading();
                _util.default.request({
                    url: _api.default.queryResumeList,
                    method: "POST",
                    data: {
                        loginMobile: app.globalData.userInfo.phoneNumber,
                        encryptMobile: app.globalData.userInfo.encryptPhone
                    }
                }).then(function(_ref3) {
                    var resData = _ref3.data;
                    var data = resData.data,
                        code = resData.code;
                    if (code !== 0) return;
                    if (data.myOpenResume) {
                        var _data$myOpenResume = data.myOpenResume,
                            attachmentList = _data$myOpenResume.attachmentList,
                            reset = _objectWithoutProperties2(_data$myOpenResume, _excluded);
                        _this3.setData({
                            detail: reset,
                            fileList: (attachmentList === null || attachmentList === void 0 ? void 0 : attachmentList.length) > 0 ? attachmentList[0] : "",
                            isEdit: false
                        });
                    } else {
                        _this3.setData({
                            isEdit: ignoreLocal ? false : true
                        });
                    }
                }).finally(function() {
                    wx.hideLoading();
                });
            },
            getLocalDetail: function getLocalDetail() {
                var detailSaved = wx.getStorageSync("resumeDetail");
                if (!detailSaved) return false;
                this.setData({
                    detail: detailSaved.detail,
                    fileList: detailSaved.fileList,
                    isEdit: true
                });
                return true;
            },
            onDatePicker: function onDatePicker(e) {
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2({}, e.mark.prop, e.detail.value))
                });
            },
            onSelectorPicker: function onSelectorPicker(e) {
                var propDescKey = e.mark.prop === "englishTypeCode" ? "englishTypeDesc" : "".concat(e.mark.prop, "Desc");
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2(_defineProperty2({}, e.mark.prop, e.mark.list[e.detail.value].dictCode), propDescKey, e.mark.list[e.detail.value].dictDesc))
                });
            },
            onArearSelect: function onArearSelect(e) {
                if (!this.data.isEdit) return;
                var arearSelectValueTemp = {};
                try {
                    var areaValue = this.data.detail["".concat(e.mark.area, "Desc")];
                    var areaCodeValue = this.data.detail[e.mark.area];
                    var areaValueArr = areaValue === null || areaValue === void 0 ? void 0 : areaValue.split(" ");
                    var areaCodeValueArr = areaCodeValue === null || areaCodeValue === void 0 ? void 0 : areaCodeValue.split(",");
                    arearSelectValueTemp = areaValueArr ? {
                        countryName: areaValueArr[0],
                        cityName: areaValueArr[1],
                        provinceName: areaValueArr[2],
                        regionName: areaValueArr[3],
                        countryCode: areaCodeValueArr[0],
                        provinceCode: areaCodeValueArr[1],
                        cityCode: areaCodeValueArr[2],
                        regionCode: areaCodeValueArr[3]
                    } : {};
                } catch (err) {
                    console.log(err);
                }
                this.setData({
                    arearSelectValue: arearSelectValueTemp,
                    showArearSelect: true,
                    areaProp: e.mark.area
                });
            },
            onRadioChange: function onRadioChange(e) {
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2({}, e.mark.prop, e.detail.value))
                });
            },
            onWorkFlagChange: function onWorkFlagChange() {
                this.data.detail.workItemList = this.data.detail.workFlag === 1 ? [] : [{
                    company: "",
                    endDate: "",
                    startDate: "",
                    workMonth: "",
                    position: ""
                }];
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), {}, {
                        workFlag: this.data.detail.workFlag === 1 ? 0 : 1
                    })
                });
            },
            onAddWork: function onAddWork() {
                if (this.data.detail.workItemList.length > 2) {
                    _util.default.toastUtil("最多可添加3份工作经历");
                    return;
                }
                this.data.detail.workItemList.push({
                    company: "",
                    endDate: "",
                    startDate: "",
                    workMonth: "",
                    position: ""
                });
                this.setData({
                    detail: _objectSpread2({}, this.data.detail)
                });
            },
            onDeleteWork: function onDeleteWork(e) {
                this.data.detail.workItemList.splice(e.target.dataset.index, 1);
                this.setData({
                    detail: _objectSpread2({}, this.data.detail)
                });
            },
            onWorkDatePicker: function onWorkDatePicker(e) {
                var item = this.data.detail.workItemList[e.mark.index];
                item[e.mark.prop] = e.detail.value;
                if (item.startDate && item.endDate) {
                    item.workMonth = this.calculateDays(item.startDate, item.endDate);
                }
                this.setData({
                    detail: _objectSpread2({}, this.data.detail)
                });
            },
            calculateDays: function calculateDays(date1, date2) {
                var startDateString = date1.replace(/-/g, "/");
                var endDateString = date2.replace(/-/g, "/");
                var startDayjs = (0, _dayjs.default)(startDateString);
                var endDayjs = (0, _dayjs.default)(endDateString);
                var diffMonth = endDayjs.diff(startDayjs, "month");
                var diffYear = Math.floor(diffMonth / 12);
                var resetDiffMonth = Math.floor(diffMonth % 12);
                var diffString = (diffYear > 0 ? "".concat(diffYear, "\u5E74") : "") + (resetDiffMonth > 0 ? "".concat(resetDiffMonth, "\u6708") : "");
                return diffString;
            },
            onInput: function onInput(e) {
                var dataSet = e.target.dataset;
                if (dataSet.hasOwnProperty("index")) {
                    this.data.detail.workItemList[dataSet.index][dataSet.prop] = e.detail.value;
                } else {
                    this.data.detail[dataSet.prop] = e.detail.value;
                }
                this.setData({
                    detail: _objectSpread2({}, this.data.detail)
                });
            },
            onArearChoose: function onArearChoose(e) {
                var _e$detail = e.detail,
                    countryName = _e$detail.countryName,
                    cityName = _e$detail.cityName,
                    provinceName = _e$detail.provinceName,
                    regionName = _e$detail.regionName,
                    countryCode = _e$detail.countryCode,
                    provinceCode = _e$detail.provinceCode,
                    cityCode = _e$detail.cityCode,
                    regionCode = _e$detail.regionCode;
                this.setData({
                    showArearSelect: false,
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), {}, _defineProperty2(_defineProperty2({}, "".concat(this.data.areaProp, "Desc"), "".concat(countryName, " ").concat(provinceName, " ").concat(cityName, " ").concat(regionName)), this.data.areaProp, "".concat(countryCode, ",").concat(provinceCode, ",").concat(cityCode, ",").concat(regionCode)))
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
                        var type = res.tempFiles[0].name.substring(res.tempFiles[0].name.lastIndexOf(".") + 1);
                        var arr = ["doc", "docx", "jpg", "jpeg", "pdf", "ppt", "pptx"];
                        console.log(res, type, arr.indexOf(type), "文件格式");
                        if (arr.indexOf(type) == -1) {
                            _util.default.toastUtil("文件格式不支持~");
                            return;
                        }
                        if (!isMaxSize) {
                            _util.default.toastUtil("文件最大支持10M~");
                        } else {
                            that.upLoadFileByUni(res);
                        }
                    },
                    complete: function complete() {}
                });
            },
            //上传文件
            upLoadFileByUni: function upLoadFileByUni(res) {
                var that = this;
                wx.showLoading({
                    title: "上传中..."
                });
                wx.uploadFile({
                    url: _api.default.fileUpload,
                    filePath: res.tempFiles[0].path,
                    name: "multipartFile",
                    formData: {
                        //调用上传接口需要的参数
                        type: res.tempFiles[0].type,
                        name: res.tempFiles[0].name //后端需要用它来获取文件的名字
                    },

                    header: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "".concat(wx.getStorageSync("token")) || ""
                    },
                    success: function success(uploadFileRes) {
                        wx.hideLoading();
                        var resData = JSON.parse(uploadFileRes.data);
                        if (resData.code !== 0) {
                            return _util.default.toastUtil(resData.message);
                        }
                        var fileData = resData.data;
                        that.setData({
                            fileList: {
                                fileName: fileData.fileName,
                                filePath: fileData.path
                            }
                        });
                        _util.default.toastUtil({
                            icon: "success",
                            title: "上传成功"
                        });
                    },
                    fail: function fail() {
                        wx.hideLoading();
                    }
                });
            },
            onDisabilityChange: function onDisabilityChange(e) {
                this.setData({
                    detail: _objectSpread2(_objectSpread2({}, this.data.detail), e.detail)
                });
            },
            onClose: function onClose() {
                this.setData({
                    privacyPolicyShow: false
                });
            },
            deleteFile: function deleteFile() {
                this.setData({
                    fileList: ""
                });
            },
            onSaveLocal: function onSaveLocal() {
                wx.setStorageSync("resumeDetail", {
                    detail: this.data.detail,
                    fileList: this.data.fileList
                });
                _util.default.toastUtil("已经暂存");
            },
            validInfo: function validInfo() {
                var _this4 = this;
                var reauiredKeys = ["name", "gender", "birthday", "nation", "nativePlace", "mobile", "politicalAffiliation", "maritalStatus", "medicalHistory", "englishTypeCode", "admissionFlag", "educationDegree", "applicantCategory", "jobStatus", "desiredLocation"];
                var _this$data$detail = this.data.detail,
                    email = _this$data$detail.email,
                    mobile = _this$data$detail.mobile;
                var unValidKey = reauiredKeys.find(function(v) {
                    return [null, undefined, ""].includes(_this4.data.detail[v]);
                });
                if (unValidKey) {
                    _util.default.toastUtil("请完善个人信息中带 * 信息");
                    return false;
                }
                if (_util.default.formatPhone(mobile)) {
                    _util.default.toastUtil("请输入正确的手机号");
                    return false;
                }
                if (email && _util.default.emailRegex(email)) {
                    _util.default.toastUtil("请输入正确的邮箱");
                    return false;
                }
                var disabilitySet = this.selectComponent("#disabilitySet");
                if (!disabilitySet.valid()) {
                    return false;
                }
                return this.checkWorkList();
            },
            checkWorkList: function checkWorkList() {
                var _this$data$detail2 = this.data.detail,
                    workFlag = _this$data$detail2.workFlag,
                    workItemList = _this$data$detail2.workItemList;
                if (workFlag === 0) return true;
                var unVaildWork = workItemList.some(function(v) {
                    return Object.keys(v).some(function(k) {
                        return !v[k];
                    });
                });
                if (unVaildWork) {
                    _util.default.toastUtil("请完善工作经历中带 * 信息");
                    return false;
                }
                var unValidWorkTime = workItemList.some(function(v) {
                    return v.endDate <= v.startDate;
                });
                if (unValidWorkTime) {
                    _util.default.toastUtil("工作经历中结束时间不能小于开始时间");
                    return false;
                }
                var beginDates = workItemList.map(function(v) {
                    return v.startDate;
                });
                var endDates = workItemList.map(function(v) {
                    return v.endDate;
                });
                beginDates.sort();
                endDates.sort();
                for (var i = 1; i < beginDates.length; i++) {
                    if (beginDates[i] <= endDates[i - 1]) {
                        _util.default.toastUtil("工作经历中存在时间交集");
                        return false;
                    }
                }
                return true;
            },
            onModify: function onModify() {
                this.setData({
                    isEdit: true
                });
                this.getLocalDetail();
            },
            onCancle: function onCancle() {
                // 无简历时，取消直接回退
                if (!this.data.detail.name) {
                    wx.navigateBack();
                    return;
                }
                this.setData({
                    isEdit: false
                });
                this.getDetial(true);
            },
            sumbit: function sumbit() {
                var _this5 = this;
                if (!this.validInfo()) return;
                wx.showLoading({
                    title: "保存中..."
                });
                _util.default.request({
                    url: _api.default.submitResume,
                    method: "POST",
                    data: {
                        resume: _objectSpread2(_objectSpread2({}, this.data.detail), {}, {
                            attachmentList: this.data.fileList ? [this.data.fileList] : []
                        }),
                        resumeType: 'my',
                        loginMobile: app.globalData.userInfo.phoneNumber,
                        encryptMobile: app.globalData.userInfo.encryptPhone
                    }
                }).then(function(res) {
                    wx.hideLoading();
                    if (res.data.code !== 0) {
                        _util.default.toastUtil(res.data.message);
                        return;
                    }
                    wx.removeStorageSync("resumeDetail");
                    if (!_this5.data.applyParam) {
                        //不需要投递
                        _util.default.toastUtil("提交成功");
                        _this5.setData({
                            isEdit: false
                        });
                        return;
                    }
                    _this5.data.applyParam && _this5.applyJob();
                }).catch(function() {
                    wx.hideLoading();
                });
            },
            closeArearSelect: function closeArearSelect() {
                this.setData({
                    showArearSelect: false
                });
            },
            initPickerIndex: function initPickerIndex(listKey, prop) {
                var _this6 = this;
                var index = this.data.dictList[listKey].findIndex(function(v) {
                    return v.dictCode === _this6.data.detail[prop];
                });
                this.setData({
                    pickerDefautIndex: _objectSpread2(_objectSpread2({}, this.data.pickerDefautIndex), {}, _defineProperty2({}, prop, Math.max(0, index)))
                });
            },
            applyJob: function applyJob() {
                var _this7 = this;
                wx.showLoading({
                    title: "投递中..."
                });
                _util.default.request({
                    url: _api.default.addJobApply,
                    method: "POST",
                    data: _objectSpread2(_objectSpread2({}, this.data.applyParam), {}, {
                        email: this.data.detail.email,
                        jobHunter: this.data.detail.name,
                        mobile: this.data.detail.mobile,
                        loginMobile: app.globalData.userInfo.phoneNumber
                    })
                }).then(function(result) {
                    if (result.data.code === 0) {
                        _util.default.toastUtil("投递成功");
                        _event.default.emit("delivered", {
                            id: _this7.data.applyParam.positionId
                        });
                    } else {
                        _util.default.toastUtil(result.data.message);
                    }
                    var t = setTimeout(function() {
                        wx.switchTab({
                            url: "/pages/position/position"
                        });
                        clearTimeout(t);
                        t = null;
                    }, 2000);
                });
            }
        }
    });