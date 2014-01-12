if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Polar = {
        SepareateLineColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)',
        StaffFontColor: null,
        StaffBackColor: null,
        ScaleLineColors: null
    };
}
DChart.Polar = DChart.getCore().__extends({
    //图形类型
    GraphType: 'Polar',
    //设置默认配置(注意统一命名)
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            radius: null,
            margin: null,
            colors: null,
            animateRotate: true,
            animateScale: true,
            scaleOverlay: true,
            startAngle: null,
            //指示各个半圆的角度是否平均分配
            averageAngle: false,
            separeateLine: {
                show: false,
                color: null,
                width: null
            },
            //圆形背景线条设置
            scale: {
                linewidth: 0.5,
                minvalue: null,
                maxvalue: null,
                interval: null,
                //线条的颜色，数组格式（core中linecolor在本图形中无效）
                linecolors: null
            },
            //标尺设置
            staff: {
                show: true,
                content: function (val) {
                    return val.toString();
                },
                fontcolor: null,
                fontfamily: null,
                fontsize: null,
                fontweight: null,
                //标尺显示的方向
                directions: ['n', 's', 'e', 'w'],
                //标尺文字的背景颜色
                backcolor: 'rgba(255,255,255,0.3)'
            },
            outerLabel: {
                show: true,
                content: function (data) {
                    return data.text + ' ' + data.percent.toFixed(1) + '%';
                },
                withlegend: true,
                legendtype: null,
                length: null,
                color: null,
                backcolor: 'rgba(220,220,220,0.2)',
                bordercolor: null,
                borderwidth: 0.5,
                fontsize: null,
                fontfamily: null
            }
        });
        return this;
    },
    //绘图(该方法实现：可以分开也可以同时传入数据和配置、多次调用重新绘图，相互不影响。)
    Draw: function (_data, ops) {
        var inner = this;
        //分配传入参数
        if (arguments.length === 1) {
            //如果传入的参数是不是数组，则将该参数当做配置信息而不是数据
            if (!DChart.Methods.IsArray(arguments[0])) {
                ops = arguments[0];
                _data = undefined;
            }
        }
        inner.SetOptions(ops);
        inner._checkOptions();
        var options = inner.innerOptions;
        //如果横向与纵向动画都被取消，则取消整个动画
        if (!options.animateRotate && !options.animateScale) { options.animation = false; }
        inner.SetData(_data);
        inner._onStart();
        //计算数据极值
        var minval = null;
        var maxval = null;
        var cemicircleCount = inner.innerData.length;
        //记录总值数
        var segmentTotal = 0;
        for (var i = 0; i < cemicircleCount; i++) {
            var item = inner.innerData[i];
            var tmpVal = item.value;
            //检验数据
            if (typeof tmpVal != 'number') {
                throw new Error(DChart.Const.Language[inner.Language].WrongData + '\'' + tmpVal + '\'' + DChart.Const.Language[inner.Language].NeedNumberData);
            }
            else if (tmpVal < 0) {
                throw new Error(DChart.Const.Language[inner.Language].WrongData + '\'' + tmpVal + '\'' + DChart.Const.Language[inner.Language].DataMustGreaterThanZero);
            }
            else {
                segmentTotal += tmpVal;
                if (maxval == null) { minval = maxval = tmpVal; }
                else {
                    if (tmpVal > maxval) { maxval = tmpVal; }
                    else if (tmpVal < minval) { minval = tmpVal; }
                }
            }
        }
        //计算圆形比例尺参数
        var scaleData = inner._getComputed(0, 'n', options.scale, minval, maxval, 8);
        //获取除去标题及图例外的“可自由绘图”区域的坐标信息
        var coordinate = inner._getDrawableCoordinate();
        var margin = DChart.Methods.IsNumber(options.margin) && options.margin > 0 ? options.margin : 15;
        //能够绘制饼状图的最大直径
        var maxRadius = Math.min((coordinate.maxX - coordinate.minX) / 3, (coordinate.maxY - coordinate.minY) / 2) - margin * 2;
        //计算饼状图园的半径长度
        var polarRadius = options.radius && options.radius < maxRadius ? options.radius : maxRadius;
        //记录绘制半圆的可用区域信息
        inner.coordinates.draw = coordinate;
        //记录饼状图的半径、圆点
        inner.coordinates.polar = { radius: polarRadius, centerX: coordinate.centerX, centerY: coordinate.centerY };
        var colors = (options.colors && options.colors.length > 0 ? options.colors : null) || DChart.Const.Defaults.FillColors;
        //使图例颜色与实际保持一致
        if (colors) { inner.tempData.legendColors = colors; }
        //绘制图形
        var ctx = inner.ctx;
        inner.coordinates.polar.outerlabels = [];
        inner.coordinates.polar.staff = [];
        inner.coordinates.polar.cemicircles = [];
        inner.shapes.cemicircles = [];
        inner.shapes.outerLabels = [];
        var cutX = 3; var cutY = 3;
        var resetOuterLabelPosition = true;
        var polarshape = function (index, angleMin, angleMax, data, radius) {
            this.index = index;
            this.angleMin = angleMin;
            this.angleMax = angleMax;
            this.data = data;
            this.isHovered = false;
            this.radius = radius;
            this.color = function () {
                return this.data.color || colors[this.index % colors.length];
            };
            this.redraw = function (color, full) {
                drawPart(getPartPercent(this.data.value), this.angleMin, this.angleMax, color || this.color());
            };
            this.contact = null;
            //封装一个半圆的点击事件(包括向外延伸及用户配置的click事件)
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
                        var midAngle = (this.angleMin + this.angleMax) / 2;
                        var left = coordinate.centerX + this.radius * 0.5 * Math.cos(midAngle);
                        var top = coordinate.centerY + this.radius * 0.5 * Math.sin(midAngle);
                        this.tip = inner._createTip(options.tip.content(this.data), left, top);
                        var shape = this;
                        //使提示框内容不失去鼠标点击功能
                        shape.tip.onclick = function (e) { shape.click(e); };
                    }
                };
                //隐藏提示框
                this.hideTip = function () {
                    if (this.tip) { this.tip.style.display = 'none'; }
                };
            }
        };
        var outerLabelShape = function (content, length, width, height, floatright, floattop, data, contact) {
            this.content = content;
            this.length = length;
            this.width = width;
            this.height = height;
            this.floatright = floatright;
            this.floattop = floattop;
            this.endX = function () { return this.left + (this.floatright ? 0 : this.width) };
            this.endY = function () { return this.top + this.height / 2 };
            this.data = data;
            this.contact = contact;
            this.color = function () {
                return this.contact.color();
            };
            this.index = function () {
                return this.contact.index;
            };
            this.resetposition = function () {
                var length = this.length;
                var centerX = coordinate.centerX;
                var centerY = coordinate.centerY;
                var midAngle = (this.contact.angleMin + this.contact.angleMax) / 2;
                var cosmid = Math.cos(midAngle);
                var sinmid = Math.sin(midAngle);
                var distance = 1.1;
                var cosright = cosmid > 0 ? 1 + cosmid : 0;
                var sinbottom = sinmid > 0 ? sinmid : 0;
                this.startX = centerX + this.contact.radius * cosmid;
                this.startY = centerY + this.contact.radius * sinmid;
                this.left = centerX + polarRadius * distance * cosmid + (this.floatright ? 0 : -this.width);
                this.top = centerY + polarRadius * distance * sinmid + sinbottom * length - length - cutY;
            };
        };
        //获取一个半圆的半径与最大半径的比值
        var getPartPercent = function (val) {
            return (val - scaleData.minvalue) / (scaleData.maxvalue - scaleData.minvalue);
        };
        //绘制一个饼状图半圆元素
        //scalePercent：半径比列（动态更改此值可实现动画）
        //angleMin：半圆开始角度
        //angleMax：半圆结束角度
        //color：填充半圆的颜色，采用rgba格式
        //data：半圆代表的数据，当该值不为空时，表示要绘制Label
        //polarshape：该半圆所关联的polarshape，不为空表示未第一次绘制，否则为重绘，此时部分元素无需再绘制
        var drawPart = function (scalePercent, angleMin, angleMax, color, data, polarshape) {
            var midAngle = (angleMin + angleMax) / 2;
            var centerX = coordinate.centerX;
            var centerY = coordinate.centerY;
            var cosmid = Math.cos(midAngle);
            var sinmid = Math.sin(midAngle);
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, polarRadius * scalePercent, angleMin, angleMax);
            ctx.lineTo(centerX, centerY);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            if (options.separeateLine.show) {
                ctx.lineWidth = options.separeateLine.width || 1;
                ctx.strokeStyle = options.separeateLine.color || options.lineColor || '#ffffff';
                ctx.stroke();
            }
            ctx.restore();
            var ops = options.outerLabel;
            if (data && ops.show && typeof ops.content == 'function') {
                var length = ops.length || polarRadius / 12;
                ctx.save();
                var floatright = DChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, midAngle);
                var floattop = DChart.Methods.JudgeBetweenAngle(-Math.PI, 0, midAngle);
                var content = ops.content(data);
                ctx.textAlign = floatright ? 'left' : 'right';
                ctx.font = (ops.fontsize || (length - 1)) + 'px ' + (ops.fontfamily || options.fontFamily || DChart.Const.Defaults.FontFamily);
                var ctxWidth = ctx.measureText(content).width;
                ctx.restore();
                var width = ctxWidth + (ops.withlegend ? length + 3 * cutX : 2 * cutX);
                var height = length + cutY * 2;
                var labelshape = new outerLabelShape(content, length, width, height, floatright ? 1 : 0, floattop ? 1 : 0, data, polarshape);
                inner.shapes.outerLabels.push(labelshape);
                polarshape.contact = labelshape;
            }
        };
        //绘制标尺
        var drawScales = function (recordStaff) {
            var opsScale = options.scale;
            var linewidth = opsScale.linewidth;
            if (!(opsScale.linewidth > 0)) { return; }
            var i = 0;
            for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                var linecolor = opsScale.linecolors && opsScale.linecolors.length > 0 ? opsScale.linecolors[i % opsScale.linecolors.length] : 'rgb(190,190,190)';
                inner.DrawFigures.createArc(coordinate.centerX, coordinate.centerY, polarRadius * getPartPercent(val), linewidth, linecolor);
                i++;
            }
            var opsStaff = options.staff;
            var content = opsStaff.content;
            if (!opsStaff.show || typeof content != 'function' || !(opsStaff.directions.length > 0)) { return; }
            var fontsize = opsStaff.fontsize || polarRadius / scaleData.scalecount * 0.6;
            var backcolor = opsStaff.backcolor;
            //文本的最大长度
            var maxLength = 0;
            if (backcolor) {
                for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                    var tmpLen = inner.DrawFigures.measureText(content(val), opsStaff.fontweight, fontsize, opsStaff.fontfamily);
                    maxLength = Math.max(maxLength, tmpLen);
                }
            }
            i = 0;
            var drawDirection = function (text, direc, distance) {
                var centerX = (direc == 'n' || direc == 's') ? coordinate.centerX : (direc == 'w' ? coordinate.centerX - distance : coordinate.centerX + distance);
                var bottom = (direc == 'w' || direc == 'e') ? coordinate.centerY + fontsize / 2.5 : (direc == 'n' ? coordinate.centerY - distance + fontsize / 2.5 : coordinate.centerY + distance + fontsize / 2.5);
                if (backcolor) {
                    inner.DrawFigures.createRectangleFill(centerX - maxLength / 2 - 1, bottom - fontsize + 1, maxLength + 2, fontsize + 2, backcolor);
                }
                var textLength = inner.DrawFigures.createText(text, centerX, bottom, 'center', opsStaff.fontweight, fontsize, opsStaff.fontfamily, fontcolor);
                if (recordStaff) {
                    inner.coordinates.polar.staff.push({ direction: direc, text: text, left: centerX - textLength / 2, right: centerX + textLength / 2, top: bottom - fontsize, bottom: bottom, size: fontsize, length: textLength });
                }
            };
            for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                var fontcolor = opsStaff.fontcolor || '#000000';
                var distance = polarRadius * getPartPercent(val);
                var text = content(val);
                if (opsStaff.directions.__contains('n')) {
                    drawDirection(text, 'n', distance);
                }
                if (opsStaff.directions.__contains('s')) {
                    drawDirection(text, 's', distance);
                }
                if (opsStaff.directions.__contains('e')) {
                    drawDirection(text, 'e', distance);
                }
                if (opsStaff.directions.__contains('w')) {
                    drawDirection(text, 'w', distance);
                }
                i++;
            }
        };
        //_shape:一个半圆shape
        var drawOuterLabels = function (_shape, _color) {
            var ops = options.outerLabel;
            if (!(ops.show && typeof ops.content == 'function')) { return; }
            if (resetOuterLabelPosition) {
                for (var i = 0, shape; shape = inner.shapes.outerLabels[i]; i++) { shape.resetposition(); }
                resetOuterLabelPosition = false;
            }
            //重新调整OuterLabel的位置，防止相互覆盖
            var resetPosition = function () {
                var judgeOuterLabelCross = function (r1, r2) {
                    return Math.max(r1.left, r2.left) <= Math.min(r1.left + r1.width, r2.left + r2.width) && Math.max(r1.top, r2.top) <= Math.min(r1.top + r1.height, r2.top + r2.height);
                };
                //分别分类为“左上、左下、右上、右下”区域
                var lefttop = []; var leftbuttom = []; var righttop = []; var rightbottom = [];
                //防止超出边界
                for (var i = 0, shape; shape = inner.shapes.outerLabels[i]; i++) {
                    while (coordinate.minY > shape.top) {
                        shape.top += cutY;
                        shape.left += shape.floatright ? cutX : -cutX;
                    }
                    while (coordinate.maxY < shape.top + shape.height) {
                        shape.top -= cutY;
                        shape.left += shape.floatright ? cutX : -cutX;
                    }
                    if (shape.floatright && shape.floattop) { righttop.push(shape); }
                    else if (shape.floatright && !shape.floattop) { rightbottom.push(shape); }
                    else if (!shape.floatright && shape.floattop) { lefttop.push(shape); }
                    else { leftbuttom.push(shape); }
                }
                var count = 0;
                var compares = [];
                //循环规范OuterLabel的相对位置
                var cycle = function (r) {
                    if (compares.length > 0) {
                        for (var i = 0, compare; compare = compares[i]; i++) {
                            while (judgeOuterLabelCross(compare, r) && count < 1000) {
                                r.top += r.floattop ? cutY : -cutY;
                                r.left += r.floatright ? cutX : -cutX;
                                count++
                            }
                        }
                    }
                    compares.push(r);
                };
                //不同区域进行不同的优先级重排列
                for (var i = lefttop.length - 1; i >= 0; i--) { cycle(lefttop[i]); }
                compares = [];
                for (var i = 0; i < leftbuttom.length; i++) { cycle(leftbuttom[i]); }
                compares = [];
                for (var i = 0; i < righttop.length; i++) { cycle(righttop[i]); }
                compares = [];
                for (var i = rightbottom.length - 1; i >= 0; i--) { cycle(rightbottom[i]); }
            };
            var drawSingleLabel = function (labelshape, color) {
                var shape = labelshape;
                if (!color) {
                    inner.DrawFigures.createQuadraticCurve(shape.startX, shape.startY, shape.startX * 0.8 + shape.endX() * 0.2, shape.startY * 0.2 + shape.endY() * 0.8, shape.endX(), shape.endY(), 1, ops.bordercolor);
                    //绘制背景色
                    if (ops.backcolor) {
                        inner.DrawFigures.createRectangleFill(shape.left, shape.top, shape.width, shape.height, ops.backcolor);
                    }
                    var left = shape.left + (shape.floatright ? cutX + (ops.withlegend ? shape.length + cutX : 0) : shape.width - cutX);
                    var top = shape.top + shape.length + cutY / 2;
                    inner.DrawFigures.createText(shape.content, left, top, shape.floatright ? 'left' : 'right', null, ops.fontsize || (shape.length - 1), ops.fontfamily, ops.color);
                    //绘制边框
                    if (ops.borderwidth && ops.borderwidth > 0) {
                        inner.DrawFigures.createRectangleBorder(shape.left, shape.top, shape.width, shape.height, ops.borderwidth, ops.bordercolor);
                    }
                }
                //绘制小图标，无论是鼠标指上还是重新绘制都需要绘制
                if (ops.withlegend) {
                    var legendtype = ops.legendtype || 's';
                    var color = color || shape.color();
                    inner.DrawFigures.createPointElement(legendtype, shape.left + cutX, shape.top + cutY, shape.length, color, legendtype != 'x', color, 2, legendtype == 'x');
                }
            };
            if (_shape) {
                //绘制一个半圆的OuterLabel
                drawSingleLabel(_shape.contact, _color);
            }
            else {
                resetPosition();
                //绘制所有半圆的OuterLabel
                inner.coordinates.polar.outerlabels.length = 0;
                for (var i = 0, shape; shape = inner.shapes.outerLabels[i]; i++) {
                    drawSingleLabel(shape);
                    inner.coordinates.polar.outerlabels[i] = { index: shape.contact.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
                }
            }
        };
        //单步绘图，用以产生动画。animationDecimal为动画设计完成度（有的动画设计可能导致该值<0或>1，从而实现回转等特效），percentAnimComplete为绘图过程完成度（取值0到1）
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
            var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
            var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
            if (!options.scaleOverlay) { drawScales(percentAnimComplete >= 1); }
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                var percent = (item.value / segmentTotal) * 100;
                var segmentAngle = rotateAnimation * Math.PI * 2 * (options.averageAngle ? 1 / cemicircleCount : (percent / 100));
                var color = item.color || colors[i % colors.length];
                var radiusPercent = scaleAnimation * getPartPercent(item.value);
                //最后完成绘图时，记录所有绘制的半圆
                if (percentAnimComplete >= 1) {
                    item.percent = percent;
                    item.index = i;
                    //收集绘制的图形半圆数据
                    var _polarshape = new polarshape(i, cumulativeAngle, cumulativeAngle + segmentAngle, item, polarRadius * radiusPercent);
                    inner.shapes.cemicircles.push(_polarshape);
                    drawPart(radiusPercent, cumulativeAngle, cumulativeAngle + segmentAngle, color, item, _polarshape);
                    //记录饼状图半圆信息
                    inner.coordinates.polar.cemicircles.push({ index: i, percent: percent, radius: radiusPercent, angleMin: cumulativeAngle, angleMax: cumulativeAngle + segmentAngle, color: color });
                }
                else {
                    drawPart(radiusPercent, cumulativeAngle, cumulativeAngle + segmentAngle, color);
                }
                cumulativeAngle += segmentAngle;
            }
            if (options.scaleOverlay) { drawScales(percentAnimComplete >= 1); }
            if (percentAnimComplete >= 1) { drawOuterLabels(); }
        };
        var mouseEvents = function () {
            var fixShape = function (x, y) {
                var veryShape = null;
                for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                    var midAngle = (shape.angleMin + shape.angleMax) / 2;
                    var centerX = coordinate.centerX;
                    var centerY = coordinate.centerY;
                    var currentAngle = DChart.Methods.GetCurrentAngle(x, y, centerX, centerY);
                    var withinPolar = (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(shape.radius, 2)) && DChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
                    var withinOuterLabel = false;
                    if (options.outerLabel && options.outerLabel.show && shape.contact) {
                        var rectangle = shape.contact;
                        if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                            withinOuterLabel = true;
                        }
                    }
                    if (withinPolar || withinOuterLabel) {
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
                if (inner.tempData.currentMouseShape != veryShape) {
                    var shape = inner.tempData.currentMouseShape;
                    if (shape) {
                        var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                        if (mouseleave) {
                            mouseleave(shape.data, e);
                        }
                    }
                    inner.tempData.currentMouseShape = veryShape;
                    inner._clearDrawable(coordinate);
                    drawOuterLabels();
                    for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                        if (shape.isHovered) {
                            shape.isHovered = false;
                            if (shape.hideTip) { shape.hideTip(); }
                        }
                        shape.redraw(null, true);
                    }
                    if (veryShape) {
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                        var mouseoverTransp = options.mouseoverTransparency;
                        var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                        veryShape.redraw(newColor, false);
                        drawOuterLabels(veryShape, newColor);
                        if (veryShape.showTip) { veryShape.showTip(); }
                        var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                        if (mouseover) {
                            mouseover(veryShape.data, e);
                        }
                    }
                    else {
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'auto'; }
                    }
                    drawScales(false);
                }
            };
        };
        inner._startDrawAndAnimation(drawSegments, mouseEvents);
    },
    _spreadSkin: function (skinID, newOps) {
        var skins = DChart.Const.Skins;
        if (skins[skinID] && skins[skinID].Polar) {
            var skin = skins[skinID].Polar;
            newOps.separeateLine = {}; newOps.outerLabel = {}; newOps.staff = {}; newOps.scale = {};
            newOps.separeateLine.color = skin.SepareateLineColor || null;
            newOps.outerLabel.color = skin.OuterLabelColor || null;
            newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
            newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
            newOps.staff.fontcolor = skin.StaffFontColor || null;
            newOps.staff.backcolor = skin.StaffBackColor || null;
            newOps.scale.linecolors = skin.ScaleLineColors || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['radius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['averageAngle', 'b']],
            separeateLine: [['show', 'b'], ['color', 'c'], ['width', 'n']],
            scale: [['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n'], ['linecolors', 'ca']],
            staff: [['show', 'b'], ['content', 'f'], ['fontcolor', 'c'], ['fontfamily', 's'], ['fontsize', 'n'], ['fontweight', 's'], ['directions', 'sa'], ['backcolor', 'c']],
            outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['color', 'c'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});
