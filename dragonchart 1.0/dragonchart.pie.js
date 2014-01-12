//判断是否加载dragonchart.core
if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    //补充Pie中特有的皮肤设置，SkinID与core中需一对一（可以比core少，但不能增加）
    DChart.Const.Skins.BlackAndWhite.Pie = {
        SepareateLineColor: null,
        InnerLabelColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)'
    };
}
DChart.Pie = DChart.getCore().__extends({
    //图形类型
    GraphType: 'Pie',
    //设置默认配置(注意统一命名)
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            //半径，null表示根据canvas宽度高度自动计算，计算公式为“min(width,height)/2-margin”
            radius: null,
            //当radius为null时，自动计算半径时饼状图离canvas边界的距离
            margin: null,
            //各半圆的颜色设置(优先取各个Item传入的颜色、然后本设置、然后DChart.Const.Defaults.FillColors)
            colors: null,
            //半径方向是否产生动画
            animateRotate: true,
            //角度方向是否产生动画
            animateScale: true,
            //展开角度，取值范围为-1到1，0表示从右侧展开，-0.5表示从上侧等等
            startAngle: null,
            //当鼠标点击时，点中的半圆是否向外延伸一段距离，以明显的表示被选中
            clickout: true,
            //饼状图半圆的分割线
            separeateLine: {
                show: false,
                color: null,
                width: null
            },
            //内部Label相关选项
            innerLabel: {
                show: true,
                content: function (data) {
                    return data.percent.toFixed(1) + '%';
                },
                //文本中心距离饼状图圆点的距离与该园半径的比值
                distance: null,
                color: null,
                fontsize: null,
                fontfamily: null
            },
            //外部Label相关设置
            outerLabel: {
                show: true,
                content: function (data) {
                    return data.text + ' ' + data.percent.toFixed(1) + '%';
                },
                //是否显示图例小图标
                withlegend: true,
                //小图标类型：c(ycle)-圆形，s(quare)-正方形，t(riangle)-三角形
                legendtype: null,
                //小图标的宽度
                length: null,
                //文本颜色
                color: null,
                //背景颜色
                backcolor: 'rgba(255,255,255,0.3)',
                //边框颜色
                bordercolor: null,
                //边框颜色，null或<=0表示不绘制
                borderwidth: 0.5,
                //字体大小
                fontsize: null,
                //字体
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
        //获取除去标题及图例外的“可自由绘图”区域的坐标信息
        var coordinate = inner._getDrawableCoordinate();
        var margin = DChart.Methods.IsNumber(options.margin) && options.margin > 0 ? options.margin : 15;
        //能够绘制饼状图的最大直径
        var maxRadius = Math.min((coordinate.maxX - coordinate.minX) / 3, (coordinate.maxY - coordinate.minY) / 2) - margin * 2;
        //计算饼状图园的半径长度
        var pieRadius = options.radius && options.radius < maxRadius ? options.radius : maxRadius;
        //记录绘制半圆的可用区域信息
        inner.coordinates.draw = coordinate;
        //记录饼状图的半径、圆点
        inner.coordinates.pie = { radius: pieRadius, centerX: coordinate.centerX, centerY: coordinate.centerY };
        //记录总值数
        var segmentTotal = 0;
        var wrongmsg = DChart.Const.Language[inner.Language];
        for (var i = 0, item; item = inner.innerData[i]; i++) {
            var tmpVal = item.value;
            if (typeof tmpVal != 'number' || tmpVal < 0) {
                throw new Error(wrongmsg.WrongData + '\'' + tmpVal + '\'' + wrongmsg.DataMustGreaterThanZero);
            }
            else { segmentTotal += tmpVal; }
        }
        var colors = (options.colors && options.colors.length > 0 ? options.colors : null) || DChart.Const.Defaults.FillColors;
        inner.tempData.legendColors = colors;
        //绘制图形
        var ctx = inner.ctx;
        //当点击半圆时向外移出一段距离的参考距离
        var outlength = pieRadius / 10;
        //记录所有图形半圆
        inner.shapes.cemicircles = [];
        //记录所有OuterLabel中的长方形
        inner.shapes.outerLabels = [];
        //记录饼状图半圆的信息
        inner.coordinates.pie.cemicircles = [];
        //记录饼状图半圆的OuterLabel的位置、大小信息（整个大的长方形，而不是具体的小图标或文本）
        inner.coordinates.pie.outerlabels = [];
        var cutX = 3; var cutY = 3;
        //指示是否需要重载各个OuterLabel的位置
        var resetOuterLabelPosition = true;
        //饼状图半圆的类
        var pieshape = function (index, angleMin, angleMax, data, isClickout) {
            this.index = index;
            this.angleMin = angleMin;
            this.angleMax = angleMax;
            this.data = data;
            //标记该半圆是否被鼠标指向
            this.isHovered = false;
            //标记该半圆是否被鼠标点击而向外伸出一段记录
            this.isClickout = isClickout;
            this.color = function () {
                return this.data.color || colors[this.index % colors.length];
            };
            this.redraw = function (clickout, color) {
                drawPart(clickout, 1, this.angleMin, this.angleMax, color || this.color());
            };
            this.contact = null;
            //封装一个半圆的点击事件(包括向外延伸及用户配置的click事件)
            this.click = function (e, color) {
                //实现被点击半圆向外伸出一段距离
                if (options.clickout) {
                    resetOuterLabelPosition = true;
                    this.isClickout = !this.isClickout;
                    inner._createAssists();
                    drawOuterLabels();
                    //对每个半圆进行重绘
                    for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                        if (shape && shape != this) {
                            shape.redraw(shape.isClickout);
                        }
                        else {
                            this.redraw(this.isClickout);
                            //在鼠标指向元素上方添加白色的透明层
                            var mouseoverTransp = options.mouseoverTransparency;
                            var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                            //加上白色的透明层来重绘特定目标半圆
                            this.redraw(this.isClickout, newColor);
                            drawOuterLabels(this, newColor);
                        }
                    }
                    drawInnerLabels();
                }
                //只有当半圆之前为向外延伸时触发点击事件
                if (!options.clickout || this.isClickout) {
                    //触发用户设定的click事件
                    var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
                    if (click) {
                        click(this.data, e);
                    }
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
                        var left = coordinate.centerX + pieRadius * 0.5 * Math.cos(midAngle);
                        var top = coordinate.centerY + pieRadius * 0.5 * Math.sin(midAngle);
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
        //描述一个OuterLabel
        var outerLabelShape = function (content, length, width, height, floatright, floattop, data, contact) {
            this.content = content;
            this.length = length;
            this.width = width;
            this.height = height;
            this.floatright = floatright;
            this.floattop = floattop;
            this.endX = function () { return this.left + (this.floatright ? 0 : this.width) };
            this.endY = function () { return this.top + this.height / 2 };
            //关联数据
            this.data = data;
            //关联半圆shape
            this.contact = contact;
            this.color = function () {
                return this.contact.color();
            };
            this.index = function () {
                return this.contact.index;
            };
            //重新计算外部文本的位置信息
            this.resetposition = function () {
                var length = this.length;
                var centerX = coordinate.centerX;
                var centerY = coordinate.centerY;
                var midAngle = (this.contact.angleMin + this.contact.angleMax) / 2;
                var cosmid = Math.cos(midAngle);
                var sinmid = Math.sin(midAngle);
                if (this.contact.isClickout) {
                    centerX += outlength * cosmid;
                    centerY += outlength * sinmid;
                }
                var distance = 1.15;
                var cosright = cosmid > 0 ? 1 + cosmid : 0;
                var sinbottom = sinmid > 0 ? sinmid : 0;
                this.startX = centerX + pieRadius * cosmid;
                this.startY = centerY + pieRadius * sinmid;
                this.left = centerX + pieRadius * distance * cosmid + (this.floatright ? 0 : -this.width);
                this.top = centerY + pieRadius * distance * sinmid + sinbottom * length - length - cutY;
            };
        };
        //绘制一个饼状图半圆元素
        //clickout：是否为点击时向外伸出一段距离
        //scalePercent：半径比列（动态更改此值可实现动画）
        //angleMin：半圆开始角度
        //angleMax：半圆结束角度
        //color：填充半圆的颜色，采用rgba格式
        //data：半圆代表的数据，当该值不为空时，表示要绘制Label
        //pieshape：该半圆所关联的pieshape，不为空表示未第一次绘制，否则为重绘，此时部分元素无需再绘制
        var drawPart = function (clickout, scalePercent, angleMin, angleMax, color, data, pieshape) {
            var midAngle = (angleMin + angleMax) / 2;
            var centerX = coordinate.centerX;
            var centerY = coordinate.centerY;
            var cosmid = Math.cos(midAngle);
            var sinmid = Math.sin(midAngle);
            if (clickout) {
                centerX += outlength * cosmid;
                centerY += outlength * sinmid;
            }
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, pieRadius * scalePercent, angleMin, angleMax);
            ctx.lineTo(centerX, centerY);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            //绘制半圆分割线
            if (options.separeateLine.show) {
                ctx.lineWidth = options.separeateLine.width || 1;
                ctx.strokeStyle = options.separeateLine.color || options.lineColor || '#ffffff';
                ctx.stroke();
            }
            ctx.restore();
            var ops = options.outerLabel;
            if (data && ops.show && typeof ops.content == 'function') {
                var length = ops.length || pieRadius / 12;
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
                var labelshape = new outerLabelShape(content, length, width, height, floatright ? 1 : 0, floattop ? 1 : 0, data, pieshape);
                inner.shapes.outerLabels.push(labelshape);
                pieshape.contact = labelshape;
            }
        };
        //绘制InnerLabel
        var drawInnerLabels = function (_shape) {
            var ops = options.innerLabel;
            if (!(ops.show && typeof ops.content == 'function')) { return; }
            var distance = ops.distance || 0.6;
            //绘制单个半圆的innerLabel
            var drawSingleLabel = function (shape) {
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var data = shape.data;
                var length = shape.isClickout ? (pieRadius * distance + outlength) : pieRadius * distance;
                var left = coordinate.centerX + length * Math.cos(midAngle);
                var top = coordinate.centerY + length * Math.sin(midAngle);
                inner.DrawFigures.createText(ops.content(data), left, top, 'center', data.fontweight, data.fontsize || ops.fontsize || pieRadius / 10, ops.fontfamily, data.fontcolor || ops.color || DChart.Const.Defaults.InnerLabelColor);
            };
            //如果指定某个半圆，则只绘制该半圆的InnerLabel，否则绘制所有半圆的InnerLabel
            if (_shape) { drawSingleLabel(_shape); }
            else {
                for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                    drawSingleLabel(shape);
                }
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
                inner.coordinates.pie.outerlabels.length = 0;
                for (var i = 0, shape; shape = inner.shapes.outerLabels[i]; i++) {
                    drawSingleLabel(shape);
                    inner.coordinates.pie.outerlabels[i] = { index: shape.contact.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
                }
            }
        };
        //单步绘图，用以产生动画。animationDecimal为动画设计完成度（有的动画设计可能导致该值<0或>1，从而实现回转等特效），percentAnimComplete为绘图过程完成度（取值0到1）
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
            var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
            var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                var percent = (item.value / segmentTotal) * 100;
                var segmentAngle = rotateAnimation * (percent / 100 * (Math.PI * 2));
                var color = item.color || colors[i % colors.length];
                var angleMax = cumulativeAngle + segmentAngle;
                //最后完成绘图时，记录所有绘制的半圆
                if (percentAnimComplete >= 1) {
                    item.index = i;
                    item.percent = percent;
                    var _pieshape = new pieshape(i, cumulativeAngle, angleMax, item, item.extended == true);
                    inner.shapes.cemicircles.push(_pieshape);
                    drawPart(item.extended, scaleAnimation, cumulativeAngle, angleMax, color, item, _pieshape);
                    //记录饼状图半圆信息
                    inner.coordinates.pie.cemicircles.push({ index: i, percent: percent, angleMin: cumulativeAngle, angleMax: angleMax, color: color });
                }
                else {
                    drawPart(item.extended, scaleAnimation, cumulativeAngle, angleMax, color);
                }
                cumulativeAngle += segmentAngle;
            }
            if (percentAnimComplete >= 1) {
                drawInnerLabels();
                drawOuterLabels();
            }
        };
        //设置鼠标事件
        var mouseEvents = function () {
            //获取鼠标事件发生时所在的图形半圆，若没有，则返回null
            var fixShape = function (x, y) {
                var veryShape = null;
                for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                    var midAngle = (shape.angleMin + shape.angleMax) / 2;
                    var offX = outlength * Math.cos(midAngle);
                    var offY = outlength * Math.sin(midAngle);
                    var centerX = coordinate.centerX + (shape.isClickout ? offX : 0);
                    var centerY = coordinate.centerY + (shape.isClickout ? offY : 0);
                    //当前角度
                    var currentAngle = DChart.Methods.GetCurrentAngle(x, y, centerX, centerY);
                    //判断鼠标是否在半圆上
                    var withinPie = (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(pieRadius, 2)) && DChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
                    //判断鼠标是否在所属的OuterLabel中 
                    var withinOuterLabel = false;
                    if (options.outerLabel && options.outerLabel.show && shape.contact) {
                        var rectangle = shape.contact;
                        if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                            withinOuterLabel = true;
                        }
                    }
                    //当鼠标在半圆内或在所属的OuterLabel中，则将该半圆选中
                    if (withinPie || withinOuterLabel) {
                        veryShape = shape; break;
                    }
                }
                return veryShape;
            };
            inner.canvas.onclick = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                var veryShape = fixShape(location.X, location.Y);
                //若发生在目标半圆中，判断是否设置click事件，若有则调用。
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
                    //重绘所有半圆
                    for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                        if (shape.isHovered) {
                            shape.isHovered = false;
                            drawOuterLabels(shape, shape.color());
                            if (shape.hideTip) { shape.hideTip(); }
                        }
                        shape.redraw(shape.isClickout);
                    }
                    drawInnerLabels();
                    if (veryShape) {
                        //给该元素打上“已指向”的标记
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                        //在鼠标指向元素上方添加白色的透明层
                        var mouseoverTransp = options.mouseoverTransparency;
                        var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                        veryShape.redraw(veryShape.isClickout, newColor);
                        drawOuterLabels(veryShape, newColor);
                        //绘制提示框(是否显示、怎样显示等逻辑全部在showTip方法中)
                        if (veryShape.showTip) { veryShape.showTip(); }
                        //若发生在目标半圆中，判断是否设置mouseover事件，若有则调用。
                        var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                        if (mouseover) {
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
    //设置Pie类型图的特有的皮肤
    _spreadSkin: function (skinID, newOps) {
        var skins = DChart.Const.Skins;
        //判断该Skin是否存在
        if (skins[skinID] && skins[skinID].Pie) {
            var skin = skins[skinID].Pie;
            newOps.separeateLine = {}; newOps.innerLabel = {}; newOps.outerLabel = {};
            newOps.separeateLine.color = skin.SepareateLineColor || null;
            newOps.innerLabel.color = skin.InnerLabelColor || null;
            newOps.outerLabel.color = skin.OuterLabelColor || null;
            newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
            newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['radius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['clickout', 'b']],
            separeateLine: [['show', 'b'], ['color', 'c'], ['width', 'n']],
            innerLabel: [['show', 'b'], ['content', 'f'], ['distance', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
            outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});
