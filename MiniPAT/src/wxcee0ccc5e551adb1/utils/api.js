var host, staticImageUrl;
    var obj = wx.getAccountInfoSync();
    switch (obj.miniProgram.envVersion) {
        case 'develop':
            host = 'https://hr-zp.yto56test.com/api/';
            staticImageUrl = 'https://hr-zp.yto56test.com/images/';
            break;
        case 'trial':
            host = 'https://hr-zp.yto56test.com/api/';
            staticImageUrl = 'https://hr-zp.yto56test.com/images/';
            break;
        case 'release':
            host = 'https://hr-zp.yto.net.cn/api/';
            staticImageUrl = 'https://hr-zp-cdn.yto.net.cn/images/';
            break;
    }
    var API = {
        staticImageUrl: staticImageUrl,
        host: host,
        wxLogin: "".concat(host, "user/noauth/wxLogin"),
        sendSms: "".concat(host, "user/noauth/sendSms"),
        getCheckCode: "".concat(host, "user/noauth/getCheckCode"),
        bindPhone: "".concat(host, "user/noauth/bindPhone"),
        getUserInfo: "".concat(host, "user/getUserInfo"),
        userLoginOut: "".concat(host, "user/loginOut"),
        userLoginOff: "".concat(host, "user/loginOff"),
        fileUpload: "".concat(host, "file/upload"),
        fileDownload: "".concat(host, "file/downLoad"),
        getUserPhone: "".concat(host, "user/noauth/getUserPhone"),
        updateAvatar: "".concat(host, "user/addHeaderImg"),
        getDictList: "".concat(host, "noauth/dict/getDictList"),
        /********************职位接口*************************/
        recruitmentList: "".concat(host, "app/recruitment/type/list"),
        positionTypeList: "".concat(host, "app/position/type/list"),
        countryList: "".concat(host, "app/area/country/list"),
        provinceList: "".concat(host, "app/area/province/list"),
        cityList: "".concat(host, "app/area/city/list"),
        regionList: "".concat(host, "app/area/region/list"),
        positionList: "".concat(host, "app/position/positionList"),
        positionListNear: "".concat(host, "app/position/near/list"),
        positionDetail: "".concat(host, "app/position/positionDetail"),
        sharePosition: "".concat(host, "app/position/sharePosition"),
        collectionCancel: "".concat(host, "position/collection/cancel"),
        getSharePositionIdByKey: "".concat(host, "app/position/getSharePositionIdByKey"),
        positionNumber: "".concat(host, "app/position/getUserJobHunterNum"),
        countryTree: "".concat(host, "app/area/country/tree"),
        companyList: "".concat(host, "app/company/type/list"),
        ytoExpressPositionCount: "".concat(host, "app/position/ytoExpressPositionCount"),
        searchAddressPoint: "".concat(host, "addressCenterPoint/addressPoint/searchAddressPoint"),
        searchReverseRegion: "".concat(host, "addressCenterPoint/branch/searchReverseRegion"),
        /********************简历接口*************************/
        resumeList: "".concat(host, "resume/list"),
        addResume: "".concat(host, "resume/add"),
        deleteResume: "".concat(host, "resume/delete"),
        addJobApply: "".concat(host, "app/position/addJobApply"),
        resumePost: "".concat(host, "resume/resumePost"),
        resumeNum: "".concat(host, "resume/resumeNum"),
        queryResumeList: "".concat(host, "mini/resume/queryMyResumeList"),
        submitResume: "".concat(host, "mini/resume/submitMyResume"),
        /********************消息通知*************************/
        getJobApplyNoticeList: "".concat(host, "resume/getJobApplyNoticeList"),
        /********************用户收藏职位列表*************************/
        collectionList: "".concat(host, "position/collection/page/list"),
        collectionNumber: "".concat(host, "position/collection/num"),
        collectionAllNumber: "".concat(host, "position/collection/cancel/batch"),
        /********************获取求职者投递列表*************************/
        getJobHunterJobApplyList: "".concat(host, "app/position/getJobHunterJobApplyList")
    };
    module.exports = API;