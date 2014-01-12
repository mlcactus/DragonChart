if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Points = {
        NodeLineColor: '#ffffff',
        AlignlineLineColor: null
    };
}
DChart.Points = DChart.getCore().__extends({
    GraphType: 'Points',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        //所有的选项，null表示自动计算
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            //在直线图的文本轴，也可能需要像值轴那样自动计算
            labelAxis: {
                //文本轴的值类型
                valueType: null,
                content: function (val) {
                    if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                    else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                    else { return val.toString(); }
                },
                minvalue: null,
                maxvalue: null,
                interval: null,
                sort: true
            },
            //节点设置
            node: {
                colors: null,
                //节点小图形的类型（圆形、三角形、正方形），默认为c，即小圆形
                nodetype: null,
                //节点小图形的颜色（默认与线条颜色一致，当将二者设置为不同颜色时，取消将出现“断裂”的特殊效果）
                linecolor: null,
                //节点小图形线宽（默认与线条线宽一致）
                linewidth: null,
                //节点小图形的占用正方形的边长长度
                length: null,
                //当填充节点小图形时使用的颜色(默认与ringColor一致)
                fillcolor: null
            },
            //提示信息框相关设置(在原有设置的基础上添加曲线图特有的设置)
            tip: {
                //指示是否合并显示（只有在多维曲线且lValueType为null时，该设置才有效）
                merge: false,
                //重新设置content（call到options中）
                content: function (data, merge) {
                    if (merge) {
                        var res = '<div>';
                        for (var i = 0; i < data.length; i++) {
                            var val = this.valueType == 'p' ? data[i].vpercent.toFixed(2) + '%' : data[i].vvalue.toString();
                            res += (i > 0 ? '<br/>' : '') + data[i].text + " : " + val;
                        }
                        res += '&nbsp;</div>';
                        return res;
                    }
                    else {
                        var val = this.valueType == 'p' ? data.vpercent.toFixed(2) + '%' : data.vvalue.toString();
                        if (this.valueType == 'd') { val = data.vvalue.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { val = data.vvalue.format('MM-dd hh:mm'); }
                        return '<div>&nbsp;' + (data.text ? data.text + '：' : '') + val + '&nbsp;</div>';
                    }
                }
            },
            //对齐线
            alignline: {
                //是否显示纵向标尺线
                verticalline: true,
                //是否显示横向标尺线（仅当merge为true时有效）
                horizontalline: true,
                //标尺线的颜色
                linecolor: null
            },
            //背景
            scale: {
                //是否绘制垂直方向的比例线（默认为true，这样横向与纵向的比例线就交错在一起了）
                drawvertical: true
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
        //文本轴的数据类型不能设置为p
        if (options.labelAxis.valueType == 'p') {
            throw new Error(DChart.Const.Language[inner.Language].WrongParam + DChart.Const.Language[inner.Language].LabelAxisValueTypeCannotBePercent);
        }
        inner.SetData(_data);
        inner._onStart();
        //指示绘制动画时的每一帧都重新绘制“外围”图形，即调用内部_createAssists方法。
        inner.tempData.recreateAssists = true;
        //记录所有节点图
        inner.shapes.nodes = [];
        inner.coordinates.nodes = [];
        var axisData = inner._formatAxisData();
        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        var ctx = inner.ctx;
        var lValueType = options.labelAxis.valueType;
        //指示值轴数据类型是否为p
        var percentType = axisData.vValueType == 'p';
        //节点的长度(min6,max10)
        var nodelength = options.node.length || DChart.Methods.CapValue((axisSize.maxX - axisSize.minX) / 100, 10, 6);
        var nodecolors = (options.node.colors && options.node.colors.length > 0 ? options.node.colors : null) || DChart.Const.Defaults.FillColors;
        inner.tempData.legendColors = nodecolors;
        //记录一个节点
        var nodeShape = function (index, centerX, centerY, length, data, color) {
            this.index = index;
            this.centerX = centerX;
            this.centerY = centerY;
            this.color = color;
            this.isHovered = false;
            this.nodelength = length;
            this.data = data;
            //触发为柱子设定的click事件
            this.click = function (e) {
                var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
                if (click) {
                    click(this.data, e);
                }
            };
            if (options.tip.show && typeof options.tip.content == 'function') {
                //提示框
                this.tip = null;
                //展现提示框
                this.showTip = function () {
                    if (this.tip) {
                        this.tip.style.display = 'inline';
                    }
                    else {
                        var centerX = this.centerX + nodelength + 5;
                        var centerY = this.centerY - nodelength - 10;
                        this.tip = inner._createTip(options.tip.content.call(options, this.data, false), centerX, centerY);
                        //当超出可绘图区域右边界时，将提示框左移
                        if (this.centerX + this.tip.clientWidth > axisSize.maxX) {
                            inner._changeTip(this.tip, centerX - 5 - nodelength - this.tip.clientWidth);
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
        //绘制一个节点元素
        var drawnode = function (x, y, color, nodeinfo) {
            var ops = options.node;
            var _nodelength = nodeinfo.nodelength || nodelength;
            var nodetype = nodeinfo.nodetype || ops.nodetype || 'c';
            //外围线颜色倾向于一致
            var nodelinecolor = nodeinfo.nodelinecolor || ops.linecolor || color;
            var nodelinewidth = nodeinfo.nodelinewidth || ops.linewidth;
            inner.DrawFigures.createPointElement(nodetype, x, y, _nodelength, color, true, nodelinecolor, nodelinewidth, true, true);
        };
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            var getValueHeight = function (val) {
                var height = (options.animation ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return height;
            };
            var getLabelWidth = function (val) {
                if (lValueType) {
                    return (axisSize.maxX - axisSize.minX) * inner._getFormatDiff(axisData.lValueType, axisData.lMinValue, val) / inner._getFormatDiff(axisData.lValueType, axisData.lMinValue, axisData.lMaxValue);
                }
                else {
                    //多维曲线，label与节点位置分离，因此节点left的计算与该节点在数组的位置相关
                    if (axisData.multiple) {
                        return (axisSize.maxX - axisSize.minX) * val / (inner.innerData[0].value.length - 1);
                    }
                        //一维曲线，label取自inner.innerData中的每个元素中的text，因此节点的left位置与该节点在一维数组的位置相关
                    else {
                        return (axisSize.maxX - axisSize.minX) * val / (inner.innerData.length - 1);
                    }
                }
            };
            var addPointsShape = function (i, index, x, y, _nodelength, color, vvalue, lvalue, text, vpercent, dataitem) {
                if (percentAnimComplete >= 1) {
                    var data = { vvalue: vvalue, lvalue: lvalue, text: text, click: dataitem.click, mouseover: dataitem.mouseover, mouseleave: dataitem.mouseleave, nodetype: dataitem.nodetype, nodelength: dataitem.nodelength, nodelinecolor: dataitem.nodelinecolor, nodelinewidth: dataitem.nodelinewidth, nodefillcolor: dataitem.nodefillcolor };
                    if (vpercent != null) { data.vpercent = vpercent; }
                    var shape = new nodeShape(index, x, y, _nodelength, data, color);
                    inner.shapes.nodes.push(shape);
                    if (i >= 0) { inner.coordinates.nodes[i][index] = { centerX: x, centerY: y, length: _nodelength }; }
                    else { inner.coordinates.nodes[index] = { centerX: x, centerY: y, length: _nodelength }; }
                }
            };
            if (axisData.multiple) {
                for (var i = 0, dataitem; dataitem = inner.innerData[i]; i++) {
                    var text = dataitem.text || '';
                    var color = dataitem.color || nodecolors[i % nodecolors.length];
                    var nodetype = dataitem.nodetype;
                    if (percentAnimComplete >= 1) { inner.coordinates.nodes[i] = []; }
                    for (var k = 0; k < dataitem.value.length; k++) {
                        subitem = dataitem.value[k];
                        lvalue = lValueType ? subitem[0] : k;
                        vvalue = lValueType ? subitem[1] : subitem;
                        vpercent = percentType ? dataitem.percent[k] : null;
                        centerX = axisSize.minX + getLabelWidth(lvalue);
                        centerY = axisSize.maxY - getValueHeight(percentType ? vpercent : vvalue);
                        drawnode(centerX, centerY, color, dataitem);
                        addPointsShape(i, k, centerX, centerY, dataitem.nodelength || nodelength, color, vvalue, lvalue, text, vpercent, dataitem);
                    }
                }
            }
            else {
                for (var i = 0; i < inner.innerData.length; i++) {
                    var subitem = inner.innerData[i];
                    var text = subitem.text || '';
                    var color = subitem.color || (options.node.colors && options.node.colors.length > 0 ? nodecolors[i % nodecolors.length] : null) || options.node.fillcolor || '#000000';
                    var lvalue = lValueType ? subitem.value[0] : i;
                    var vvalue = lValueType ? subitem.value[1] : subitem.value;
                    var vpercent = percentType ? inner.innerData[i].percent : null;
                    var centerX = axisSize.minX + getLabelWidth(lvalue);
                    var centerY = axisSize.maxY - getValueHeight(percentType ? vpercent : vvalue);
                    drawnode(centerX, centerY, color, subitem);
                    addPointsShape(-1, i, centerX, centerY, subitem.nodelength || nodelength, color, vvalue, lvalue, text, vpercent, subitem);
                }
            }
        };
        var redrawSegments = function () {
            var centerX, centerY = null;
            for (var i = 0; i < inner.shapes.nodes.length; i++) {
                var shape = inner.shapes.nodes[i];
                drawnode(shape.centerX, shape.centerY, shape.color, shape.data);
            }
        };
        var mergeTips = [];
        var mouseEvents = function () {
            var fixSingleShape = function (x, y) {
                var veryShape = null;
                for (var i = inner.shapes.nodes.length - 1; i >= 0; i--) {
                    var shape = inner.shapes.nodes[i];
                    if (Math.sqrt(Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2)) <= shape.nodelength / 2) {
                        veryShape = shape; break;
                    }
                }
                return veryShape;
            };
            var fixRowShapes = function (x, y) {
                var shapes = [];
                //找到的shape对应文本轴的位置
                var locX = 0;
                if (y <= axisSize.maxY && y >= axisSize.minY && x >= axisSize.minX && x <= axisSize.maxX) {
                    var index = 0;
                    var cut = (axisSize.maxX - axisSize.minX) / (axisData.tuftCount - 1);
                    for (var i = 1; i < axisData.tuftCount; i++) {
                        var x1 = axisSize.minX + (i - 1) * cut;
                        var x2 = axisSize.minX + i * cut;
                        if (x1 <= x && x2 >= x) {
                            if (Math.abs(x1 - x) <= Math.abs(x2 - x)) { index = i - 1; locX = x1; }
                            else { index = i; locX = x2; }
                            break;
                        }
                    }
                    for (var i = 0, shape; shape = inner.shapes.nodes[i]; i++) {
                        if (shape.index == index) {
                            shapes.push(shape);
                        }
                    }
                }
                return { shapes: shapes, locX: locX };
            };
            inner.canvas.onclick = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                var veryShape = fixSingleShape(location.X, location.Y);
                if (veryShape) {
                    veryShape.click(e);
                }
            };
            inner.canvas.onmousemove = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                //当文本轴使用值类型或者为一维数组时，可定位单个节点
                var showByNode = axisData.lValueType || !axisData.multiple;
                var veryShape = fixSingleShape(location.X, location.Y);
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
                    for (var i = 0, shape; shape = inner.shapes.nodes[i]; i++) {
                        //如果绘制了阴影，则全部柱状图都需重绘
                        if (shape != veryShape && shape.isHovered) {
                            shape.isHovered = false;
                            if (showByNode && shape.hideTip) { shape.hideTip(); }
                        }
                    }
                    if (veryShape) {
                        //给该元素打上“已指向”的标记
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                        if (showByNode) {
                            if (options.alignline.verticalline || options.alignline.horizontalline) {
                                inner._createAssists(valids);
                                inner._createScales(valids);
                                redrawSegments();
                            }
                            if (options.alignline.verticalline) {
                                var alignlinecolor = options.alignline.linecolor || DChart.Const.Defaults.AlignLineColor;
                                inner.DrawFigures.createLine(veryShape.centerX, axisSize.minY, veryShape.centerX, axisSize.maxY + 1, 1, alignlinecolor);
                            }
                            if (options.alignline.horizontalline) {
                                var alignlinecolor = options.alignline.linecolor || DChart.Const.Defaults.AlignLineColor;
                                inner.DrawFigures.createLine(axisSize.minX, veryShape.centerY, axisSize.maxX, veryShape.centerY, 1, alignlinecolor);
                            }
                            if (veryShape.showTip && showByNode) { veryShape.showTip(); }
                        }
                        var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                        if (mouseover) {
                            //触发设定的mouseover事件
                            mouseover(veryShape.data, e);
                        }
                    }
                    else {
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'auto'; }
                        if (showByNode && (options.alignline.verticalline || options.alignline.horizontalline)) {
                            inner._createAssists(valids);
                            inner._createScales(valids);
                            redrawSegments();
                        }
                    }
                }
                //通过鼠标在文本轴的位置来定位节点
                if (!showByNode) {
                    var fixed = fixRowShapes(location.X, location.Y);
                    if (inner.locX != fixed.locX) {
                        inner.locX = fixed.locX;
                        //消除上次显示的tip
                        if (options.tip.merge) {
                            for (var i = 0; i < mergeTips.length; i++) {
                                if (mergeTips[i]) {
                                    mergeTips[i].style.display = 'none';
                                }
                            }
                        }
                        else {
                            for (var i = 0, shape; shape = inner.shapes.nodes[i]; i++) {
                                if (shape.hideTip) { shape.hideTip(); }
                            }
                        }
                        if (options.alignline.verticalline) {
                            inner._createAssists(valids);
                            inner._createScales(valids);
                            redrawSegments();
                        }
                        if (fixed.shapes.length) {
                            if (options.alignline.verticalline) {
                                var alignlinecolor = options.alignline.linecolor || DChart.Const.Defaults.AlignLineColor;
                                inner.DrawFigures.createLine(fixed.locX, axisSize.minY, fixed.locX, axisSize.maxY + 1, 1, alignlinecolor);
                            }
                            //合并显示Tip
                            if (options.tip.merge) {
                                //通过判断单个的showTip是否存在，就能够判断是否显示tip
                                if (fixed.shapes[0].showTip) {
                                    var mergeTip = mergeTips[fixed.shapes[0].index];
                                    if (!mergeTip) {
                                        var data = [];
                                        var centerYSum = 0;
                                        for (var i = 0, shape; shape = fixed.shapes[i]; i++) {
                                            data.push(shape.data);
                                            centerYSum += shape.centerY;
                                        }
                                        var centerX = fixed.locX + nodelength + 5;
                                        var centerY = centerYSum / fixed.shapes.length;
                                        mergeTip = inner._createTip(options.tip.content.call(options, data, true), centerX, centerY);
                                        inner._changeTip(mergeTip, null, centerY - mergeTip.clientHeight / 2 + 10);
                                        if (centerX + mergeTip.clientWidth > axisSize.maxX) {
                                            inner._changeTip(mergeTip, centerX - 5 - nodelength - mergeTip.clientWidth);
                                        }
                                        mergeTips[fixed.shapes[0].index] = mergeTip;
                                    }
                                    mergeTip.style.display = 'inline';
                                }
                            }
                            else {
                                for (var i = 0, shape; shape = fixed.shapes[i]; i++) {
                                    if (shape.showTip) { shape.showTip(); }
                                }
                            }

                        }
                    }
                }
            };
        };
        inner._startDrawAndAnimation(drawSegments, mouseEvents);
    },
    _spreadSkin: function (skinID, newOps) {
        var skins = DChart.Const.Skins;
        if (skins[skinID] && skins[skinID].Points) {
            var skin = skins[skinID].Points;
            newOps.node = {}; newOps.alignline = {};
            newOps.node.linecolor = skin.NodeLineColor || null;
            newOps.alignline.linecolor = skin.AlignlineLineColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            labelAxis: [['valueType', 's'], ['content', 'f'], ['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n'], ['sort', 'b']],
            node: [['colors', 'ca'], ['nodetype', 's'], ['linecolor', 'c'], ['linewidth', 'n'], ['length', 'n'], ['fillcolor', 'c']],
            tip: [['merge', 'b']],
            alignline: [['verticalline', 'b'], ['horizontalline', 'b'], ['linecolor', 'c']],
            scale: [['drawvertical', 'b']]
        };
    }
});