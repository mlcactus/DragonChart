if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Histogram = {
        TopLabelColor: null
    };
}
DChart.Histogram = DChart.getCore().__extends({
    GraphType: 'Histogram',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        //所有的选项，null表示自动计算
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            //Y轴方向上是否产生动画
            animateY: true,
            //X轴方向上是否产生动画（比起Y轴方向上动画要“丑”一些）
            animateX: true,
            //柱状图绘制柱子的设置选项
            histogram: {
                //若绘制多维柱子时则为各组使用的颜色（因此要求柱子的维数与colors.length数相等），若绘制一维柱子，则为每个柱子的颜色（因为要求柱子的数目与colors.length相同）
                colors: null,
                //每个柱子的宽度
                length: null,
                //当绘制多维柱子时，相邻柱子间的距离（一般靠得很近，在一维数组中该设置无效）
                gap: null,
                //当一维柱子时，是否使用统一颜色
                useSameColor: true
            },
            //柱状图顶部的文本
            topLabel: {
                show: true,
                //需要在调用时call到options中
                content: function (data) {
                    //默认时间和日期格式不绘制topLabel
                    if (this.valueType == 'd' || this.valueType == 't') { return ''; }
                    else if (this.valueType == 'p') { return data.percent.toFixed(1).toString() + '%'; }
                    else { return data.value.toString(); }
                },
                color: null,
                fontweight: null,
                fontsize: null,
                fontfamily: null
            }
        });
        return this;
    },
    Draw: function (_data, ops) {
        var inner = this;
        if (arguments.length === 1) {
            if (!DChart.Methods.IsArray(arguments[0])) {
                ops = arguments[0];
                _data = undefined;
            }
        }
        inner.SetOptions(ops);
        inner._checkOptions();
        var options = inner.innerOptions;
        //如果横向与纵向动画都被取消，则取消整个动画
        if (!options.animateY && !options.animateX) { options.animation = false; }
        inner.SetData(_data);
        inner._onStart();
        inner.tempData.notAllowValueNegative = true;
        //记录所有柱状图
        inner.shapes.histograms = [];
        var axisData = inner._formatAxisData();
        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        var ctx = inner.ctx;
        //阴影设置
        var showshadow = options.shadow.show;
        var shadow = showshadow ? options.shadow : null;
        if (shadow) {
            //防止在X轴中的阴影重叠
            if (shadow.blur && shadow.offsetY > -shadow.blur) { shadow.offsetY = -shadow.blur; }
        }
        //绘制一个柱子相关图形（包括柱状图及Label）
        //data：指示是否绘制topLabel（鼠标指上导致重绘时，若无阴影效果，则无需重绘topLabel）
        var drawPart = function (left, top, width, height, color, data, _shadow) {
            inner.DrawFigures.createRectangleFill(left, top, width, height, color, _shadow || shadow);
            if (data && options.topLabel.show) {
                var ops = options.topLabel;
                var content = typeof ops.content == 'function' ? ops.content.call(options, data) : '';
                if (content) {
                    var centerX = left + width / 2;
                    var size = ops.fontsize || DChart.Methods.CapValue(width / 2, 18, 11);
                    var cneterY = top - size / 2;
                    inner.DrawFigures.createText(content, centerX, cneterY, 'center', data.fontweight || ops.fontweight, data.fontsize || size, ops.fontfamily, data.fontcolor || ops.color);
                }
            }
        };
        var histogramShape = function (indexX, indexY, left, top, width, height, color, data) {
            //若为多维数组，则该值为某维中的第几个；若为一维数组，则表示第几个
            this.indexX = indexX;
            //若为多维数组，则该值为第几维；若为一维数组，则该值为null
            this.indexY = indexY;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.data = data;
            this.isHovered = false;
            this.color = color;
            //重新绘制单个柱子
            this.redraw = function (color) {
                var tmpshadow = shadow;
                if (shadow && shadow.show && color) {
                    tmpshadow = DChart.Methods.DeepCopy(shadow);
                    //为阴影部分同样添加附加颜色（一般为通明的白色）
                    tmpshadow.color = color;
                }
                drawPart(this.left, this.top, this.width, this.height, color || this.color, showshadow ? this.data : null, tmpshadow);
            };
            //处罚为柱子设定的click事件
            this.click = function (e) {
                var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
                if (click) {
                    click(this.data, e);
                }
            };
            //如果设置项为显示提示内容，则创建以下属性
            if (options.tip.show && typeof options.tip.content == 'function') {
                //提示框
                this.tip = null;
                //展现提示框
                this.showTip = function () {
                    if (this.tip) {
                        this.tip.style.display = 'inline';
                    }
                    else {
                        var left = this.left + this.width / 2 + 5;
                        var top = this.top + this.height / 2;
                        this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                        //当超出可绘图区域右边界时，将提示框左移
                        if (left + this.tip.clientWidth > axisSize.maxX) {
                            inner._changeTip(this.tip, left - this.tip.clientWidth);
                        }
                        var shape = this;
                        shape.tip.onclick = function (e) { shape.click(e); };
                    }
                };
                //隐藏提示框
                this.hideTip = function () {
                    if (this.tip) { this.tip.style.display = 'none'; }
                };
            }
        };
        var length = null;
        var gap = 0;
        //绘制柱状图的颜色集合
        var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || DChart.Const.Defaults.FillColors;
        inner.tempData.legendColors = colors;
        //指示值轴数据类型是否为p
        var percentType = axisData.vValueType == 'p';
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (axisData.multiple && !gap) {
                var _gap = options.histogram.gap;
                if (_gap && _gap > 0) {
                    //允许设置的最大相邻柱子间的距离(为每个柱子预留至少2个像素)
                    var maxGap = (axisSize.labelDistance - axisData.demanCount * 2) / (axisData.demanCount + 1);
                    gap = Math.min(_gap, maxGap);
                }
                else {
                    //自动设定gap
                    gap = axisSize.labelDistance / 20;
                }
            }
            if (!length) {
                var _length = options.histogram.length;
                if (_length && _length > 0) {
                    //允许设置的最大柱子宽度（space设置成2,gap设置成1）
                    var maxLen = axisData.multiple ? ((axisSize.labelDistance - (axisData.demanCount + 1) * gap) / axisData.demanCount) : axisSize.labelDistance * 0.8;
                    length = Math.min(_length, maxLen);
                }
                else {
                    //自动计算柱子宽度
                    length = (axisSize.labelDistance - (axisData.demanCount + 1) * gap) / (axisData.multiple ? (axisData.demanCount + 0.5) : 1.5);
                }
            }
            //统一的height计算方法
            var getHeight = function (val) {
                var height = (options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return height;
            };
            //记录所有柱状型图
            inner.coordinates.histograms = [];
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                //统一的width计算方法
                var width = (options.animateX ? animationDecimal : 1) * length;
                if (axisData.multiple) {
                    var color = item.color || colors[i % colors.length];
                    var values = percentType ? item.percent : item.value;
                    for (var k = 0; k < values.length; k++) {
                        var val = values[k];
                        var cut = axisData.demanCount / 2 - i;
                        var left = axisSize.startPos + axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
                        var height = getHeight(val);
                        var top = axisSize.maxY - height;
                        if (percentAnimComplete >= 1) {
                            var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: k, indexY: i, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                            if (percentType) {
                                //当数据类型为p时，记录数值和百分数
                                data.percent = val;
                                data.value = item.value[k];
                            }
                            else { data.value = val; }
                            var shape = new histogramShape(k, i, left, top, width, height, color, data);
                            inner.shapes.histograms.push(shape);
                            drawPart(left, top, width, height, color, data);
                            if (!inner.coordinates.histograms[k]) { inner.coordinates.histograms[k] = []; }
                            inner.coordinates.histograms[k][i] = { left: left, top: top, width: width, height: height, color: color };
                        }
                        else {
                            drawPart(left, top, width, height, color);
                        }
                    }
                }
                else {
                    var left = axisSize.startPos + axisSize.labelDistance * i - length / 2;
                    var height = getHeight(percentType ? item.percent : item.value);
                    var top = axisSize.maxY - height;
                    var color = item.color || (options.histogram.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                    if (percentAnimComplete >= 1) {
                        //记录第几个
                        item.indexX = i;
                        //维数始终为1
                        item.indexY = 1;
                        var shape = new histogramShape(i, 1, left, top, width, height, color, item);
                        inner.shapes.histograms.push(shape);
                        drawPart(left, top, width, height, color, item);
                        inner.coordinates.histograms[i] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    else {
                        drawPart(left, top, width, height, color);
                    }
                }
            }
        };
        //设置鼠标事件
        var mouseEvents = function () {
            var fixShape = function (x, y) {
                var veryShape = null;
                for (var i = 0, shape; shape = inner.shapes.histograms[i]; i++) {
                    if (shape.left <= x && shape.left + shape.width >= x && shape.top <= y && shape.top + shape.height >= y) {
                        veryShape = shape; break;
                    }
                }
                return veryShape;
            };
            inner.canvas.onclick = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                var veryShape = fixShape(location.X, location.Y);
                if (veryShape) {
                    veryShape.click(e);
                }
            };
            inner.canvas.onmousemove = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                var veryShape = fixShape(location.X, location.Y);
                //当本次鼠标指向的元素与上一次不同时，才执行以下系列动作
                if (inner.tempData.currentMouseShape != veryShape) {
                    var shape = inner.tempData.currentMouseShape;
                    if (shape) {
                        var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                        if (mouseleave) {
                            mouseleave(shape.data, e);
                        }
                    }
                    //记录本次鼠标说指向的元素
                    inner.tempData.currentMouseShape = veryShape;
                    //如果绘制了阴影，则全部柱状图以及比例尺图都需重绘
                    if (showshadow) {
                        inner._clearDrawable(coordinate);
                        inner._createScales(valids);
                    }
                    for (var i = 0, shape; shape = inner.shapes.histograms[i]; i++) {
                        if (shape != veryShape && (showshadow || shape.isHovered)) {
                            shape.isHovered = false;
                            shape.redraw();
                            if (shape.hideTip) { shape.hideTip(); }
                        }
                    }
                    if (veryShape) {
                        //给该元素打上“已指向”的标记
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                        veryShape.redraw();
                        //在鼠标指向元素上方添加白色的透明层
                        var mouseoverTransp = options.mouseoverTransparency;
                        veryShape.redraw('rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
                        if (veryShape.showTip) { veryShape.showTip(); }
                        var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                        if (mouseover) {
                            //触发设定的mouseover事件
                            mouseover(veryShape.data, e);
                        }
                    }
                    else {
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'auto'; }
                    }
                }
            };
        };
        //开始绘图
        inner._startDrawAndAnimation(drawSegments, mouseEvents);
    },
    _spreadSkin: function (skinID, newOps) {
        var skins = DChart.Const.Skins;
        if (skins[skinID] && skins[skinID].Histogram) {
            var skin = skins[skinID].Histogram;
            newOps.topLabel = {};
            newOps.topLabel.color = skin.TopLabelColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['animateY', 'b'], ['animateX', 'b']],
            histogram: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
            topLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});