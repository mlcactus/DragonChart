﻿(function () {
    //这里对皮肤进行配置（用户可自定义进行配置）
    var DChartSkins = {
        Example: {
            BackGround: {
                //边框宽度
                BorderWidth: 1,
                //边框颜色
                BorderColor: null,
                //背景颜色(如果该值与LinearGradient同时不为null时，优先使用BackColor)
                BackColor: '#ffffff',
                //渐进式渐变设置
                LinearGradient: {
                    //null表示取canvas的最大值
                    Location: { minX: 0, minY: 0, maxX: null, maxY: null },
                    //渐变规则
                    ColorStops: [
                        { offset: 0, color: 'black' },
                        { offset: 0.5, color: 'white' },
                        { offset: 1, color: 'black' }
                    ]
                },
                //反射式渐变设置
                RadialGradient: {
                    //null表示取canvas的最大值
                    Location: { x0: null, y0: null, r0: null, x1: null, y1: null, r1: null },
                    //渐变规则
                    ColorStops: [
                        { offset: 0, color: 'rgba(178,34,34,1)' },
                        { offset: 0.5, color: 'rgba(100,149,23,1)' }
                    ]
                }
            },
            //提示框样式类型
            TipType: null,
            //默认文本颜色
            FontColor: null,
            //默认线条颜色
            LineColor: null,
            //默认文本字体
            FontFamily: null,
            //主标题颜色
            TitleColor: null,
            //副标题颜色
            SubTitleColor: null,
            //图例文本颜色
            LegendFontColor: null,
            //图例边框颜色
            LegendBorderColor: null,
            //比例尺线条颜色
            ScaleLineColor: null,
            //比例尺线与线间区域的背景色(通过颜色数组设置，可通过设置数组只有一个值来设置单一颜色)
            ScaleBackColors: null,
            //文本轴基线颜色
            LabelAxisLineColor: null,
            //文本轴字体颜色
            LabelAxisFontColor: null,
            //值轴基线颜色
            ValueAxisLineColor: null,
            //值轴字体颜色
            ValueAxisFontColor: null,
            //小交叉线颜色
            CrossLineColor: null,
            //闭合线颜色
            CloseLineColor: null,
            //值轴的顶部说明文字的颜色
            CaptionFontColor: null,
            //横轴内说明文字的颜色
            XAxisTitleFontColor: null,
            //纵轴内说明文字的颜色
            YAxisTitleFontColor: null,
            //页脚文本颜色
            FooterFontColor: null,
            //阴影颜色
            ShadowColor: null,
            Pie: {
                //分割线颜色
                SepareateLineColor: null,
                //内部文本颜色
                InnerLabelColor: null,
                //外部文本颜色
                OuterLabelColor: null,
                //外部文本边框颜色
                OuterLabelBorderColor: null,
                //外部文本背景颜色
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            //同Pie
            NestedPie: {
                SepareateLineColor: null,
                InnerLabelColor: null,
                OuterLabelColor: null,
                OuterLabelBorderColor: null,
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            //同Pie
            Ring: {
                SepareateLineColor: null,
                InnerLabelColor: null,
                OuterLabelColor: null,
                OuterLabelBorderColor: null,
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            //同Pie
            MultiRing: {
                SepareateLineColor: null,
                InnerLabelColor: null,
                OuterLabelColor: null,
                OuterLabelBorderColor: null,
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                SepareateLineColor: null,
                OuterLabelColor: null,
                OuterLabelBorderColor: null,
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                //标尺文本颜色
                StaffFontColor: null,
                //标尺文本背景颜色
                StaffBackColor: null,
                //背景线的颜色集合
                ScaleLineColors: null
            },
            Bar: {
                //条状图顶部的文本颜色
                TopLabelColor: null
            },
            HeapBar: {
                //条状图之间隔离线的颜色
                CutLinecolor: null,
                //条状图内部文本颜色
                InnerLabelColor: null
            },
            RangeBar: {
                //条状图左侧文本颜色
                SmallLabelColor: null,
                //条状图右侧文本颜色
                BigLabelColor: null
            },
            Histogram: {
                //柱状图顶部的文本颜色
                TopLabelColor: null
            },
            HeapHistogram: {
                //柱状图之间隔离线的颜色
                CutLinecolor: null,
                //柱状图部文本颜色
                InnerLabelColor: null
            },
            RangeHistogram: {
                //柱状图下方文本颜色
                SmallLabelColor: null,
                //柱状图上方文本颜色
                BigLabelColor: null
            },
            Line: {
                //节点外围线条颜色
                NodeLineColor: null,
                //对齐线颜色
                AlignlineLineColor: null
            },
            //同Line
            Points: {
                NodeLineColor: null,
                AlignlineLineColor: null
            },
            //同Line
            Area: {
                NodeLineColor: null,
                AlignlineLineColor: null
            },
            Radar: {
                //背景线颜色
                ScaleLineColor: null,
                //标尺文本颜色
                StaffFontColor: null,
                //标尺文本的背景颜色
                StaffBackColor: 'rgba(255,255,255,0.3)',
                //节点外围线的颜色集合
                RadarNodeLinecolors: ['#ffffff'],
                //外围文本的颜色集合
                LabelsFontColors: null
            }
        },
        LinearGradient_SkyBlue: {
            BackGround: {
                BorderWidth: 1,
                BorderColor: '#000000',
                LinearGradient: {
                    Location: { minX: 0, minY: 0, maxX: null, maxY: null },
                    ColorStops: [
                        { offset: 0, color: '#87CEEB' },
                        { offset: 0.5, color: '#ffffff' },
                        { offset: 1, color: '#87CEEB' }
                    ]
                }
            },
            LegendBorderColor: '#00BFFF',
            ScaleLineColor: '#ffffff',
            ScaleBackColors: ['#87CEEB', '#ADD8E6'],
            ShadowColor: '#000000',
            Pie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                ScaleLineColors: 'rgba(0,0,0,0.6)'
            },
            Line: {
                NodeLineColor: '#ffffff'
            },
            Points: {
                NodeLineColor: '#ffffff'
            },
            Area: {
                NodeLineColor: '#ffffff'
            },
            Radar: {
                ScaleLineColor: 'rgba(0,0,0,0.6)',
                StaffBackColor: 'rgba(0,0,0,0.2)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#000000'
            }
        },
        LinearGradient_Salmon: {
            BackGround: {
                BorderWidth: 1,
                BorderColor: '#000000',
                LinearGradient: {
                    Location: { minX: 0, minY: 0, maxX: null, maxY: null },
                    ColorStops: [
                        { offset: 0, color: '#FFA07A' },
                        { offset: 0.5, color: '#ffffff' },
                        { offset: 1, color: '#FFA07A' }
                    ]
                }
            },
            LegendBorderColor: '#FF4500',
            ScaleLineColor: '#ffffff',
            ScaleBackColors: ['rgba(255,160,122,0.5)', 'rgba(233,150,122,0.5)'],
            TipType: 'tip_red',
            ShadowColor: '#000000',
            Pie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                ScaleLineColors: 'rgba(0,0,0,0.6)'
            },
            Line: {
                NodeLineColor: '#ffffff'
            },
            Points: {
                NodeLineColor: '#ffffff'
            },
            Area: {
                NodeLineColor: '#ffffff'
            },
            Radar: {
                ScaleLineColor: 'rgba(0,0,0,0.6)',
                StaffBackColor: 'rgba(0,0,0,0.2)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#000000'
            }
        },
        RadialGradient_SkyBlue: {
            BackGround: {
                BorderWidth: 1,
                BorderColor: '#000000',
                BackColor: null,
                //反射式渐变设置
                RadialGradient: {
                    //null表示取canvas的最大值
                    Location: { x0: null, y0: null, r0: null, x1: null, y1: null, r1: null },
                    //渐变规则
                    ColorStops: [
                        { offset: 0, color: '#ffffff' },
                        { offset: 0.5, color: '#87CEEB' }
                    ]
                }
            },
            LegendBorderColor: '#00BFFF',
            ScaleLineColor: '#ffffff',
            ScaleBackColors: ['#87CEEB', '#ADD8E6'],
            ShadowColor: '#000000',
            Pie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                ScaleLineColors: 'rgba(0,0,0,0.6)'
            },
            Line: {
                NodeLineColor: '#ffffff'
            },
            Points: {
                NodeLineColor: '#ffffff'
            },
            Area: {
                NodeLineColor: '#ffffff'
            },
            Radar: {
                ScaleLineColor: 'rgba(0,0,0,0.6)',
                StaffBackColor: 'rgba(0,0,0,0.2)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#000000'
            }
        },
        RadialGradient_Salmon: {
            BackGround: {
                BorderWidth: 1,
                BorderColor: '#000000',
                BackColor: null,
                //反射式渐变设置
                RadialGradient: {
                    //null表示取canvas的最大值
                    Location: { x0: null, y0: null, r0: null, x1: null, y1: null, r1: null },
                    //渐变规则
                    ColorStops: [
                        { offset: 0, color: '#ffffff' },
                        { offset: 0.5, color: '#FFA07A' }
                    ]
                }
            },
            LegendBorderColor: '#FF4500',
            ScaleLineColor: '#ffffff',
            ScaleBackColors: ['rgba(255,160,122,0.5)', 'rgba(233,150,122,0.5)'],
            ShadowColor: '#000000',
            TipType: 'tip_red',
            Pie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                SepareateLineColor: '#000000',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                ScaleLineColors: 'rgba(0,0,0,0.6)'
            },
            Line: {
                NodeLineColor: '#ffffff'
            },
            Points: {
                NodeLineColor: '#ffffff'
            },
            Area: {
                NodeLineColor: '#ffffff'
            },
            Radar: {
                ScaleLineColor: 'rgba(0,0,0,0.6)',
                StaffBackColor: 'rgba(0,0,0,0.2)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#000000'
            }
        },
        Pure_DarkCyan: {
            FontColor: '#D2D2D2',
            LineColor: '#D2D2D2',
            FontFamily: 'Arial',
            TitleColor: '#D2D2D2',
            SubTitleColor: '#D2D2D2',
            LegendFontColor: '#D2D2D2',
            LabelAxisLineColor: '#D2D2D2',
            ValueAxisLineColor: '#D2D2D2',
            ScaleBackColors: ['rgba(41,70,86,0.5)', 'rgba(0,128,128,0.5)'],
            FooterFontColor: '#888888',
            ShadowColor: '#000000',
            TipType: 'tip_dark',
            BackGround: {
                BorderWidth: 7,
                BorderColor: '#D2D2D2',
                BackColor: '#294656'
            },
            Pie: {
                SepareateLineColor: '#D2D2D2',
                InnerLabelColor: '#D2D2D2',
                OuterLabelColor: '#D2D2D2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#D2D2D2',
                InnerLabelColor: '#D2D2D2',
                OuterLabelColor: '#D2D2D2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#D2D2D2',
                InnerLabelColor: '#D2D2D2',
                OuterLabelColor: '#D2D2D2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#D2D2D2',
                InnerLabelColor: '#D2D2D2',
                OuterLabelColor: '#D2D2D2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                InnerLabelColor: '#D2D2D2',
                OuterLabelColor: '#D2D2D2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                StaffBackColor: 'rgba(255,255,255,0.3)'
            },
            Bar: {
                TopLabelColor: '#D2D2D2'
            },
            HeapBar: {
                CutLinecolor: '#D2D2D2',
                InnerLabelColor: '#D2D2D2'
            },
            RangeBar: {
                SmallLabelColor: '#D2D2D2',
                BigLabelColor: '#D2D2D2'
            },
            Histogram: {
                TopLabelColor: '#D2D2D2'
            },
            HeapHistogram: {
                CutLinecolor: '#D2D2D2',
                InnerLabelColor: '#D2D2D2'
            },
            RangeHistogram: {
                SmallLabelColor: '#D2D2D2',
                BigLabelColor: '#D2D2D2'
            },

            Line: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#D2D2D2'
            },
            Points: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#D2D2D2'
            },
            Area: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#D2D2D2'
            },
            Radar: {
                ScaleLineColor: '#D2D2D2',
                StaffBackColor: 'rgba(255,255,255,0.3)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#D2D2D2'
            }
        },
        Pure_PowDerBlue: {
            FontColor: '#F2F2F2',
            LineColor: '#F2F2F2',
            FontFamily: 'Arial',
            TitleColor: '#F2F2F2',
            SubTitleColor: '#F2F2F2',
            LegendFontColor: '#F2F2F2',
            LabelAxisLineColor: '#F2F2F2',
            ValueAxisLineColor: '#F2F2F2',
            ScaleBackColors: ['rgba(94,127,151,0.5)', 'rgba(151,179,188,0.5)'],
            FooterFontColor: '#BBBBBB',
            ShadowColor: '#000000',
            TipType: 'tip_dark',
            BackGround: {
                BorderWidth: 7,
                BorderColor: '#D2D2D2',
                BackColor: '#5d7f97'
            },
            Pie: {
                SepareateLineColor: '#F2F2F2',
                InnerLabelColor: '#F2F2F2',
                OuterLabelColor: '#F2F2F2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#F2F2F2',
                InnerLabelColor: '#F2F2F2',
                OuterLabelColor: '#F2F2F2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#F2F2F2',
                InnerLabelColor: '#F2F2F2',
                OuterLabelColor: '#F2F2F2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#F2F2F2',
                InnerLabelColor: '#F2F2F2',
                OuterLabelColor: '#F2F2F2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                InnerLabelColor: '#F2F2F2',
                OuterLabelColor: '#F2F2F2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                StaffBackColor: 'rgba(255,255,255,0.3)'
            },
            Bar: {
                TopLabelColor: '#F2F2F2'
            },
            HeapBar: {
                CutLinecolor: '#F2F2F2',
                InnerLabelColor: '#F2F2F2'
            },
            RangeBar: {
                SmallLabelColor: '#F2F2F2',
                BigLabelColor: '#F2F2F2'
            },
            Histogram: {
                TopLabelColor: '#F2F2F2'
            },
            HeapHistogram: {
                CutLinecolor: '#F2F2F2',
                InnerLabelColor: '#F2F2F2'
            },
            RangeHistogram: {
                SmallLabelColor: '#F2F2F2',
                BigLabelColor: '#F2F2F2'
            },
            Line: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#F2F2F2'
            },
            Points: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#F2F2F2'
            },
            Area: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#F2F2F2'
            },
            Radar: {
                ScaleLineColor: '#F2F2F2',
                StaffBackColor: 'rgba(255,255,255,0.3)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#F2F2F2'
            }
        },
        Pure_SlateGray: {
            FontColor: '#E2E2E2',
            LineColor: '#E2E2E2',
            FontFamily: 'Arial',
            TitleColor: '#E2E2E2',
            SubTitleColor: '#E2E2E2',
            LegendFontColor: '#E2E2E2',
            LabelAxisLineColor: '#E2E2E2',
            ValueAxisLineColor: '#E2E2E2',
            ScaleBackColors: ['rgba(112,128,144,0.5)', 'rgba(128,144,160,0.5)'],
            FooterFontColor: '#AAAAAA',
            ShadowColor: '#000000',
            TipType: 'tip_dark',
            BackGround: {
                BorderWidth: 7,
                BorderColor: '#D2D2D2',
                BackColor: '#708090'
            },
            Pie: {
                SepareateLineColor: '#E2E2E2',
                InnerLabelColor: '#E2E2E2',
                OuterLabelColor: '#E2E2E2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            NestedPie: {
                SepareateLineColor: '#E2E2E2',
                InnerLabelColor: '#E2E2E2',
                OuterLabelColor: '#E2E2E2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Ring: {
                SepareateLineColor: '#E2E2E2',
                InnerLabelColor: '#E2E2E2',
                OuterLabelColor: '#E2E2E2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            MultiRing: {
                SepareateLineColor: '#E2E2E2',
                InnerLabelColor: '#E2E2E2',
                OuterLabelColor: '#E2E2E2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)'
            },
            Polar: {
                InnerLabelColor: '#E2E2E2',
                OuterLabelColor: '#E2E2E2',
                OuterLabelBackColor: 'rgba(255,255,255,0.3)',
                StaffBackColor: 'rgba(255,255,255,0.3)'
            },
            Bar: {
                TopLabelColor: '#E2E2E2'
            },
            HeapBar: {
                CutLinecolor: '#E2E2E2',
                InnerLabelColor: '#E2E2E2'
            },
            RangeBar: {
                SmallLabelColor: '#E2E2E2',
                BigLabelColor: '#E2E2E2'
            },
            Histogram: {
                TopLabelColor: '#E2E2E2'
            },
            HeapHistogram: {
                CutLinecolor: '#E2E2E2',
                InnerLabelColor: '#E2E2E2'
            },
            RangeHistogram: {
                SmallLabelColor: '#E2E2E2',
                BigLabelColor: '#E2E2E2'
            },
            Line: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#E2E2E2'
            },
            Points: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#E2E2E2'
            },
            Area: {
                NodeLineColor: '#ffffff',
                AlignlineLineColor: '#E2E2E2'
            },
            Radar: {
                ScaleLineColor: '#E2E2E2',
                StaffBackColor: 'rgba(255,255,255,0.3)',
                RadarNodeLinecolors: ['#ffffff'],
                LabelsFontColors: '#E2E2E2'
            }
        }
    };
    //在这里将外部Skin嵌入到配置中
    for (var skin in DChartSkins) {
        //Example仅供展示如何配置
        if (skin != 'Example') {
            DChart.Const.Skins[skin] = DChartSkins[skin];
        }
    }
})();