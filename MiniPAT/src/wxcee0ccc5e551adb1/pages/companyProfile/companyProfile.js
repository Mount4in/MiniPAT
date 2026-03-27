var _api = _interopRequireDefault(require("@/utils/api.js"));

    function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        // pages/companyProfile/companyProfile.js

    Page({
        /**
         * 页面的初始数据
         */
        data: {
            staticImageUrl: _api.default.staticImageUrl,
            background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
            indicatorDots: false,
            vertical: false,
            autoplay: false,
            interval: 2000,
            duration: 500,
            tabsIndex: 0,
            recruitData: {},
            recruitData1: {},
            list: {
                aboutYuantong: {
                    title: 'aboutYTO',
                    desc: 'aboutYTODesc',
                    swiperList: [{
                        url: _api.default.staticImageUrl + "sudi_2024032001.png",
                        title: '圆通速递',
                        text: '截至2024年1月底，圆通速递拥有两家上市公司，全网拥有分公司5100多家，服务网点和终端门店9万多个，各类集运中心133个，员工50多万人，服务网络已经实现全国31个省（区、市）县级以上城市的全部覆盖。'
                    }, {
                        url: _api.default.staticImageUrl + "guoji_2024032001.png",
                        title: '圆通国际',
                        text: '目前，圆通国际在18个国家和地区，设立50多个分公司及办事处，拥有全球加盟及代理商500多家，业务覆盖6大洲、150多个国家和地区，构建起一张覆盖全球的快递物流供应链服务网络。'
                    }, {
                        url: _api.default.staticImageUrl + "keji_2024032001.png",
                        title: '圆通科技',
                        text: '圆通向科技要生产力，让科技创新引领圆通未来。近年来，圆通全面推进数字化转型战略，通过行者、运盟、网点管家、管理驾驶舱等数字工具，实现快递全业务流程的数字管理，不断提升服务质量，提升客户体验。'
                    }, {
                        url: _api.default.staticImageUrl + "hangkong_2024032001.png",
                        title: '圆通航空',
                        text: '圆通航空于2015年9月首航，已成为国内航空货运领域的头部企业之一。累计开通国内、国际航线近150条，全年运能近10万吨，航线网络覆盖日韩、东南亚、南亚、中亚，并已经开通中欧货运航线，是亚洲国际货运航班覆盖范围最广、国际货运航班数量最多的中国航企。'
                    }, {
                        url: _api.default.staticImageUrl + "jituan_2024032001.png",
                        title: '圆通集团',
                        text: '2000年5月28日圆通速递在上海成立，近年来，圆通围绕国家战略部署、坚守快递物流主业、加大产业生态投资布局，已发展成为一家集快递物流、科技、航空、金融、商贸等为一体的综合性国际供应链集成商。'
                    }]
                },
                recruit: [{
                    title: 'recruitDataTitle',
                    desc: 'recruitDataDesc1',
                    swiperList: [{
                        url: _api.default.staticImageUrl + "tongluren_2024032001.png",
                        title: '寻找同路人',
                        text: '圆通重用忠诚担当、结果导向、敬业敬取、利他共赢、感恩奉献型人才'
                    }, {
                        url: _api.default.staticImageUrl + "gongping_2024032001.png",
                        title: '公平公正的选拔机制',
                        text: '公平公正的选拔机制和完善的晋升体系，为员工提供更多的发展机会'
                    }, {
                        url: _api.default.staticImageUrl + "zhucan_2024032001.png",
                        title: '双通道发展',
                        text: '双序列职业发展路径为员工提供了更多的选择'
                    }, {
                        url: _api.default.staticImageUrl + "bainian_2024032001.png",
                        title: '百年圆通 人才为基',
                        text: '广纳天下英才—年轻化、专业化、数字化、国际化'
                    }]
                }],
                workingAtYTO: {
                    title: 'workingTitle',
                    desc: 'workingDesc',
                    swiperList: [
                        [{
                            url: _api.default.staticImageUrl + "rensheng_2024032001.png",
                            title: '成就你的人生',
                            text: '圆通给人才的不仅是工作更能成就有价值的人生'
                        }, {
                            url: _api.default.staticImageUrl + "dalou_2024032001.png",
                            title: '智慧的办公大楼',
                            text: '人脸识别、智慧访客、移动办公、驾驶舱、e卡通让工作更加高效，生活更加便利'
                        }, {
                            url: _api.default.staticImageUrl + "bangonghuanjing_2024032001.png",
                            title: '舒适的办公环境',
                            text: '圆通为员工提供简洁利落、宽敞明亮的办公环境'
                        }, {
                            url: _api.default.staticImageUrl + "sancan_2024032001.png",
                            title: '免费三餐',
                            text: '提供丰富多样的营养菜品'
                        }, {
                            url: _api.default.staticImageUrl + "zhusu_2024032001.png",
                            title: '免费住宿',
                            text: '圆通为每一位员工免费提供住宿，空调，浴室和24小时热水，独立卫生间，满足条件可申请夫妻间'
                        }]
                    ]
                }
            },
            listEn: {
                swiperList: [{
                    url: _api.default.staticImageUrl + 'sudi_2024032001.png',
                    title: 'YTO Express',
                    text: "As of the end of January 2024, YTO Express has two listed companies, with over 5,100 branches nationwide, more than 90,000 service outlets and terminals, 133 centralized logistics centers, and over 500,000 employees. Its service network has achieved full coverage of all counties and cities in 31 provinces (regions and municipalities) across the country."
                }, {
                    url: _api.default.staticImageUrl + "guoji_2024032001.png",
                    title: 'YTO International',
                    text: "Previously, Yuantong International established over 50 branches and offices in 18 countries and regions across five continents, with over 500 global franchisees and agents, covering more than 150 countries and territories across six continents. It has built a global express logistics supply chain service network that spans the globe."
                }, {
                    url: _api.default.staticImageUrl + 'keji_2024032001.png',
                    title: 'YTO Technology',
                    text: "YTO prioritizes technology to generate productivity and is committed to leading its future with technological innovation. In recent years, Yuantong has comprehensively promoted a digital transformation strategy, and achieved digital management of the entire express delivery process through various digital tools such as \"Wayfinder\", \"Union\", \"Network Supervisor\", and \"Management Cockpit\". Through this, Yuantong has continuously improved its service quality and enhanced customer experience."
                }, {
                    url: _api.default.staticImageUrl + "hangkong_2024032001.png",
                    title: 'YTO Airlines',
                    text: 'YTO Airlines first took to the skies in September 2015 and has since become one of the leading air freight carriers in China. With nearly 150 domestic and international routes, annual capacity of nearly 100,000 tons, and a network covering Japan, South Korea, Southeast Asia, South Asia, Central Asia, and Europe, Yuantong Airlines is the Chinese aviation company with the widest coverage of international freight flights in Asia and the highest number of international freight flights.'
                }, {
                    url: _api.default.staticImageUrl + "jituan_2024032001.png",
                    title: 'YTO Group',
                    text: "YTOP Express was founded in Shanghai on May 28th, 2000. In recent years, Yuantong has developed into an integrated international supply chain integrator, focusing on national strategic deployment, adhering to the core business of express logistics, increasing investment in industry ecology, and diversifying into logistics, technology, aviation, finance, trade and other fields."
                }],
                recruit: [{
                        title: 'Development in YTO',
                        desc: 'YTO Express adheres to the concept of career cohesion, cultural shaping, mechanism motivation, and emotional warmth. By creating a fair, just, and open competition and development platform, it provides more development opportunities for internal YTO',
                        swiperList: [{
                            url: _api.default.staticImageUrl + "tongluren_2024032001.png",
                            title: 'Looking for fellow travelers.',
                            text: 'YTO emphasizes the recruitment of loyal, responsible, results-oriented, dedicated, and win-win talents who are also grateful and willing to contribute.'
                        }, {
                            url: _api.default.staticImageUrl + "gongping_2024032001.png",
                            title: 'Fair and impartial selection mechanism.',
                            text: 'Fair and impartial selection mechanism and a well-developed promotion system, providing employees with more opportunities for development.'
                        }, {
                            url: _api.default.staticImageUrl + "zhucan_2024032001.png",
                            title: 'Dual-channel development.',
                            text: 'he dual-sequence career development path provides employees with more choices.'
                        }, {
                            url: _api.default.staticImageUrl + "bainian_2024032001.png",
                            title: 'Century Yuantong, Talent as the Foundation.',
                            text: 'Nurturing Talents from All Over the World - Young, Professional, Digital, and Internationalized'
                        }]
                    }
                    // {
                    //   title: 'Development in YTO',
                    //   desc: 'YTO Express adheres to the concept of career cohesion, cultural shaping, mechanism motivation, and emotional warmth. By creating a fair, just, and open competition and development platform, it provides more development opportunities for internal YTO',
                    //   swiperList: [{
                    //       url: API.staticImageUrl + "plan.png",
                    //       title: 'New Talent Program',
                    //       text: 'Assist management trainees in quickly transitioning from students to the workplace, mastering workplace thinking and skills, and quickly transitioning from frontline employees to team leaders/supervisors'
                    //     },
                    //     {
                    //       url: API.staticImageUrl + "promotion.png",
                    //       title: 'A comprehensive promotion system',
                    //       text: 'Employee - Team Leader - Supervisor - Deputy Minister - Minister - Deputy General Manager - General Manager, with a comprehensive promotion system to provide employees with more development opportunities'
                    //     }
                    //   ]
                    // }
                ],

                workingAtYTO: {
                    title: 'Working at YTO',
                    desc: '',
                    swiperList: [
                        [{
                            url: _api.default.staticImageUrl + "rensheng_2024032001.png",
                            title: 'Achieving your life',
                            text: 'YTO not only provides job opportunities for talents, but also helps them achieve a valuable life.'
                        }, {
                            url: _api.default.staticImageUrl + "dalou_2024032001.png",
                            title: 'Smart Office Building',
                            text: 'Face recognition, intelligent visitors, mobile office, driving cabin, e-card pass make work more efficient and life more convenient.'
                        }, {
                            url: _api.default.staticImageUrl + "bangonghuanjing_2024032001.png",
                            title: 'Comfortable office environment',
                            text: 'YTO provides its employees with a simple and elegant, spacious and bright office environment.'
                        }, {
                            url: _api.default.staticImageUrl + "sancan_2024032001.png",
                            title: 'Free three meals ',
                            text: 'Providing a variety of nutritious dishes.'
                        }, {
                            url: _api.default.staticImageUrl + "zhusu_2024032001.png",
                            title: 'Free accommodation',
                            text: 'YTO provides free accommodation, air conditioning, bathroom, 24-hour hot water, private toilet for every employee. Those who meet the conditions can apply for a shared room for couples.'
                        }]
                    ]
                }
            }
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function onLoad(options) {
            var _this$data = this.data,
                list = _this$data.list,
                listEn = _this$data.listEn,
                tabsIndex = _this$data.tabsIndex;
            this.setData({
                recruitData: list.recruit[tabsIndex],
                recruitData1: list.workingAtYTO.swiperList[tabsIndex]
            });
        },
        onChange: function onChange(event) {
            this.setData({
                tabsIndex: event.target.dataset.index,
                recruitData: this.data.list.recruit[event.target.dataset.index],
                recruitData1: this.data.list.workingAtYTO.swiperList[event.target.dataset.index]
            });
        },
        setrecruitData: function setrecruitData() {},
        perViewImage: function perViewImage(e) {
            console.log(e, "===");
        },
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function onReady() {},
        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function onShow() {},
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