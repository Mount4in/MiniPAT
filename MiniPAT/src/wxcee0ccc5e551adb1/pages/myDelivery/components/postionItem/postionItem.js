Component({
        options: {
            multipleSlots: true // 在组件定义时的选项中启用多slot支持
        },

        /**
         * 组件的属性列表
         */
        properties: {
            item: {
                type: Object,
                value: {}
            },
            language: {
                type: Object,
                value: {}
            }
        },
        /**
         * 组件的初始数据
         */
        data: {
            displayStyle: ''
        },
        /**
         * 组件的方法列表
         */
        methods: {
            goDetail: function goDetail() {
                wx.navigateTo({
                    url: '/pages/position-info/index?id=' + this.data.item.positionId
                });
            }
        }
    });