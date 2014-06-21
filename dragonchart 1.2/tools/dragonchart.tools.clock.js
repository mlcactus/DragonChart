//格式化日期
Date.prototype.format = function (fmt) {
    var o =
    {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
//时钟
dcharttools.clock = function (parentDivID) {
    var inner = this;
    inner.parentDivID = parentDivID;
    inner._initial = function () {
        var parentDiv = document.getElementById(inner.parentDivID);
        if (parentDiv != null && parentDiv.nodeName.toLowerCase() == 'div') {
            inner.parentDiv = parentDiv;
        }
        else {
            throw new Error("The parent element doesn't exist or isn't a div!");
        }
        inner.parentDiv.innerHTML = "";
        var canvas = document.createElement('canvas');
        inner.ID = 'DChart_' + Math.random().toString().substring(5);
        canvas.setAttribute('id', inner.ID);
        canvas.width = inner.parentDiv.clientWidth;
        canvas.height = inner.parentDiv.clientHeight;
        //非现代浏览器则使用excanvas进行兼容处理
        if (!!window.ActiveXObject && !document.createElement('canvas').getContext) {
            if (window.G_vmlCanvasManager) {
                canvas = window.G_vmlCanvasManager.initElement(canvas);
            }
            else {
                throw new Error("please include excanvas.js!");
            }
        }
        inner.parentDiv.appendChild(canvas);
        inner.canvas = canvas;
        inner.ctx = canvas.getContext('2d');
        inner._configs = {};
        //时间调整数
        inner._configs._adjust = 0;
        //指示是否真正动画中
        inner._configs._runningHandler = null;
        inner._configs._currentVal = null;
        inner._configs._computed = null;
        inner.options = inner._getDefaultOptions();
    };
    inner._getDefaultOptions = function () {
        var options = {
            centerX: null,
            centerY: null,
            radius: null,
            //秒针运行时的效果，fluent(流线型)、vibrate(颤动)
            tickType: 'fluent',
            //当前时钟偏快或偏慢时，调整显示的时间，单位是毫秒
            adjust: 0,
            //画布背景设置
            canvas: {
                backcolor: null,
                borderwidth: 1,
                bordercolor: null
            },
            //背景设置
            background: {
                backcolor: null,
                borderwidth: 1,
                bordercolor: null,
                shadowcolor: '#000000',
                shadowblur: 0
            },
            //环形刻度
            calibration: {
                //背景色
                backcolor: null,
                //环形刻度边框的距离
                margin: null,
                //大刻度间的小刻度数
                interval: 4,
                //小刻度的线宽
                thinwidth: 2,
                //大刻度的线宽
                thickwidth: 4,
                //小刻度的长度
                thinlength: null,
                //大刻度的长度
                thicklength: null,
                //大刻度的线颜色
                thinlinecolor: '#999999',
                //小刻度的线颜色
                thicklinecolor: '#000000'
            },
            //刻度文本
            labels: {
                //刻度文本与环形刻度的距离
                margin: null,
                //各个大时刻度显示文本内容
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                //各个大时刻度是否显示，以连续12位的字符串来控制，当前位为"1"表示显示该小时，为"0"表示不显示该小时
                labelcontrol: '111111111111',
                //刻度文本是否旋转
                rotate: false,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: 'bold'
            },
            //时针指针设置
            pointer: {
                //节点的颜色
                nodecolor: null,
                //圆形节点的直径
                nodelength: null,

                //时针指针的颜色
                hourpincolor: null,
                //时针指针首部的宽度
                hourheadwidth: null,
                //时针指针尾部的宽度
                hourtailwidth: null,
                //时针指针的长度
                hourpinlength: null,

                //分针指针的颜色
                minutepincolor: null,
                //分针指针首部的宽度
                minuteheadwidth: null,
                //分针指针尾部的宽度
                minutetailwidth: null,
                //分针指针的长度
                minutepinlength: null,

                //秒针指针的颜色
                secondpincolor: '#a01313',
                //秒针指针首部的宽度
                secondheadwidth: null,
                //秒针指针尾部的宽度
                secondtailwidth: null,
                //秒针指针的长度
                secondpinlength: null
            },
            //当前显示值
            currentValue: {
                show: true,
                content: function (val) {
                    return val.format("hh:mm:ss");
                },
                //距中点的距离与半径的比值
                xdistance: null,
                ydistance: null,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: null,
                backcolor: null,
                borderwidth: 0,
                bordercolor: null
            }
        };
        return options;
    };
    inner._computeOptions = function (recompute) {
        if (!recompute && inner._configs._computed) {
            return inner._configs._computed;
        }
        var ops = inner.options;
        //基本色绘制
        var centerX = ops.centerX || inner.canvas.width / 2;
        var centerY = ops.centerY || inner.canvas.height / 2;
        var radius = ops.radius || Math.min(inner.canvas.width, inner.canvas.height) * 0.4;
        //刻度相关
        var margin = ops.calibration.margin || radius / 12;
        var thinlength = ops.calibration.thinlength || radius / 15;
        var thicklength = ops.calibration.thicklength || thinlength * 1.2;
        var outerRadius = radius - margin;
        var thinInnerRadius = radius - margin - thinlength;
        var thickInnerRadius = radius - margin - thicklength;
        var calibration = { margin: margin, thinlength: thinlength, thicklength: thicklength, outerRadius: outerRadius, thinInnerRadius: thinInnerRadius, thickInnerRadius: thickInnerRadius };
        //刻度文本相关
        var labelmargin = ops.labels.margin || radius / 15;
        var labelfontsize = ops.labels.fontsize || radius / 5;
        var labelradius = thickInnerRadius - labelmargin;
        var labels = { margin: labelmargin, radius: labelradius, fontsize: labelfontsize };
        //指针相关
        var nodelength = ops.pointer.nodelength || radius / 12;
        var hourtailwidth = ops.pointer.hourtailwidth || radius / 14;
        var hourheadwidth = ops.pointer.hourheadwidth || radius / 40;
        var hourpinlength = ops.pointer.hourpinlength || radius * 0.5;
        var minutetailwidth = ops.pointer.minutetailwidth || radius / 25;
        var minuteheadwidth = ops.pointer.minuteheadwidth || radius / 40;
        var minutepinlength = ops.pointer.minutepinlength || radius * 0.8;
        var secondtailwidth = ops.pointer.secondtailwidth || radius / 40;
        var secondheadwidth = ops.pointer.secondheadwidth || 0;
        var secondpinlength = ops.pointer.secondpinlength || radius;
        if (hourpinlength >= radius + nodelength || minutepinlength >= radius + nodelength || secondpinlength >= radius + nodelength) {
            throw new Error("pinlength should be less than radius!");
        }
        var pointer = { nodelength: nodelength, hour: { tailwidth: hourtailwidth, headwidth: hourheadwidth, pinlength: hourpinlength, pincolor: ops.pointer.hourpincolor }, minute: { tailwidth: minutetailwidth, headwidth: minuteheadwidth, pinlength: minutepinlength, pincolor: ops.pointer.minutepincolor }, second: { tailwidth: secondtailwidth, headwidth: secondheadwidth, pinlength: secondpinlength, pincolor: ops.pointer.secondpincolor } };

        //当前时间显示
        var valuedistanceX = ops.currentValue.xdistance || 0;
        var valuedistanceY = ops.currentValue.ydistance == null ? 0.4 : ops.currentValue.ydistance;
        var valuefontsize = ops.currentValue.fontsize || radius / 8;
        var currentValue = { xdistance: valuedistanceX, ydistance: valuedistanceY, fontsize: valuefontsize };

        inner._configs._computed = {
            centerX: centerX, centerY: centerY, radius: radius,
            calibration: calibration, labels: labels, pointer: pointer, currentValue: currentValue
        };
        return inner._configs._computed;
    };
    //重绘canvas背景
    inner._drawCanvasBackround = function () {
        var ops = inner.options.canvas;
        if (ops.backcolor) {
            dcharttools.createRect(inner.ctx, 0, 0, inner.canvas.width, inner.canvas.height, ops.backcolor);
        }
        else {
            inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
        }
        var borderwidth = ops.borderwidth || 0;
        //绘制边框
        if (borderwidth > 0) {
            dcharttools.createRect(inner.ctx, 0, 0, inner.canvas.width, inner.canvas.height, null, borderwidth * 2, ops.bordercolor);
        }
    };
    //绘制背景
    inner._drawBackground = function () {
        var computed = inner._computeOptions();
        var ops = inner.options.background;
        var shadow = null;
        if (ops.shadowblur > 0) {
            shadow = { color: ops.shadowcolor || '#000000', blur: ops.shadowblur };
        }
        dcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.radius, 0, null, ops.backcolor || '#F2F2F2', null, null, shadow);
        dcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.radius, ops.borderwidth, ops.bordercolor);
    };
    //绘制环形刻度
    inner._drawCalibration = function () {
        var computed = inner._computeOptions();
        var ccalibration = computed.calibration;
        var clabels = computed.labels;
        var ops = inner.options.calibration;
        var opslabels = inner.options.labels;

        //绘制背景色
        if (ops.backcolor) {
            dcharttools.createRing(inner.ctx, computed.centerX, computed.centerY, ccalibration.thinInnerRadius, ccalibration.outerRadius, ops.backcolor, 0, Math.PI * 2);
        }

        var bigsplit = Math.PI * 2 / 12;
        var smallsplit = ops.interval > 0 ? bigsplit / (ops.interval + 1) : null;
        //刻度文本相对移动配置，依次对应为为12,1,2,3,4,5,6,7,8,9,10,11
        var offxs = [0, 0.2, 0.3, 0.3, 0.3, 0.2, 0, -0.25, -0.4, -0.3, -0.25, -0.25];
        var offys = [0.5, 0.4, 0.4, 0.3, 0.2, 0.1, 0.1, 0.15, 0.2, 0.3, 0.4, 0.45];

        for (var i = 0; i < 12; i++) {
            //绘制大刻度
            var angle = bigsplit * i;
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var innerX = computed.centerX + ccalibration.thickInnerRadius * sin;
            var innerY = computed.centerY - ccalibration.thickInnerRadius * cos;
            var outerX = computed.centerX + ccalibration.outerRadius * sin;
            var outerY = computed.centerY - ccalibration.outerRadius * cos;
            dcharttools.createLine(inner.ctx, innerX, innerY, outerX, outerY, ops.thickwidth, ops.thicklinecolor);

            //绘制刻度文本
            if (opslabels.labelcontrol[(i + 11) % 12] == "1") {
                var label = opslabels.labels[(i + 11) % opslabels.labels.length];
                //选择刻度文本
                if (opslabels.rotate) {
                    var labelX = computed.centerX + (clabels.radius - clabels.fontsize / 2) * sin;
                    var labelY = computed.centerY - (clabels.radius - clabels.fontsize / 2) * cos;
                    dcharttools.createText(inner.ctx, label, labelX, labelY, 'center', opslabels.fontweight, clabels.fontsize, opslabels.fontfamily, opslabels.fontcolor, angle);
                }
                else {
                    var textlength = dcharttools.measureText(inner.ctx, label, opslabels.fontweight, clabels.fontsize, opslabels.fontfamily);
                    var offX = -textlength * offxs[i];
                    var offY = offys[i] * 1.3 * clabels.fontsize;
                    var labelX = computed.centerX + clabels.radius * sin + offX;
                    var labelY = computed.centerY - clabels.radius * cos + offY;
                    dcharttools.createText(inner.ctx, label, labelX, labelY, 'center', opslabels.fontweight, clabels.fontsize, opslabels.fontfamily, opslabels.fontcolor);
                }
            }

            //绘制小刻度
            if (ops.interval > 0) {
                for (var j = 1; j <= ops.interval; j++) {
                    var sangle = angle + smallsplit * j;
                    sin = Math.sin(sangle);
                    cos = Math.cos(sangle);
                    innerX = computed.centerX + ccalibration.thinInnerRadius * sin;
                    innerY = computed.centerY - ccalibration.thinInnerRadius * cos;
                    outerX = computed.centerX + ccalibration.outerRadius * sin;
                    outerY = computed.centerY - ccalibration.outerRadius * cos;
                    dcharttools.createLine(inner.ctx, innerX, innerY, outerX, outerY, ops.thinwidth, ops.thinlinecolor);
                }
            }
        }
    };
    //绘制指针
    inner._drawPointer = function () {
        var computed = inner._computeOptions();
        var ops = inner.options.pointer;
        var currentval = inner._configs._currentVal;
        var currenttime = currentval.getTime();
        //基准时间(0点的时间)
        var basictime = Date.parse(currentval.format("yyyy/MM/dd " + (currentval.getHours() > 11 ? "12" : "00") + ":00:00"));
        var angleHour = Math.PI * 2 * (currenttime - basictime) / 43200000;
        var angleMinute = Math.PI * 2 * (currenttime - Date.parse(currentval.format("yyyy/MM/dd " + currentval.getHours() + ":00:00"))) / 3600000;
        var angleSecond = Math.PI * 2 * (currenttime - Date.parse(currentval.format("yyyy/MM/dd " + currentval.getHours() + ":" + currentval.getMinutes() + ":00"))) / 60000;
        var drawpoint = function (angle, params) {
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var outerX = computed.centerX + params.pinlength * 0.8 * sin;
            var outerY = computed.centerY - params.pinlength * 0.8 * cos;
            var outerLeftX = outerX - params.headwidth / 2 * cos;
            var outerLeftY = outerY - params.headwidth / 2 * sin;
            var outerRightX = outerX + params.headwidth / 2 * cos;
            var outerRightY = outerY + params.headwidth / 2 * sin;
            var innerX = computed.centerX - params.pinlength * 0.2 * sin;
            var innerY = computed.centerY + params.pinlength * 0.2 * cos;
            var innerLeftX = innerX - params.tailwidth / 2 * cos;
            var innerLeftY = innerY - params.tailwidth / 2 * sin;
            var innerRightX = innerX + params.tailwidth / 2 * cos;
            var innerRightY = innerY + params.tailwidth / 2 * sin;
            var points = [[outerLeftX, outerLeftY], [outerRightX, outerRightY], [innerRightX, innerRightY], [innerLeftX, innerLeftY]];
            dcharttools.createCloseFigure(inner.ctx, points, params.pincolor || '#000000');
        };
        drawpoint(angleHour, computed.pointer.hour);
        drawpoint(angleMinute, computed.pointer.minute);
        drawpoint(angleSecond, computed.pointer.second);
        dcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.pointer.nodelength / 2, 0, null, ops.nodecolor || ops.secondpincolor || '#000000')
    };
    //显示当前值
    inner._drawCurrentValue = function () {
        var ops = inner.options.currentValue;
        if (!inner._configs._currentVal || !ops.show || typeof ops.content != 'function') { return; }
        var val = inner._configs._currentVal;
        var computed = inner._computeOptions();
        var content = ops.content(val);
        var centerX = computed.centerX - computed.radius * computed.currentValue.xdistance;
        var centerY = computed.centerY - computed.radius * computed.currentValue.ydistance + computed.currentValue.fontsize / 3;
        if (ops.backcolor || ops.borderwidth) {
            var fontlength = dcharttools.measureText(inner.ctx, content, ops.fontweight, computed.currentValue.fontsize, ops.fontfamily);
            var left = centerX - fontlength / 2 - computed.currentValue.fontsize / 4;
            var top = centerY - computed.currentValue.fontsize;
            dcharttools.createRect(inner.ctx, left, top, fontlength + computed.currentValue.fontsize / 2, computed.currentValue.fontsize * 4 / 3, ops.backcolor, ops.borderwidth, ops.bordercolor);
        }
        dcharttools.createText(inner.ctx, content, centerX, centerY, 'center', ops.fontweight, computed.currentValue.fontsize, ops.fontfamily, ops.fontcolor);
    };
    //绘制一个值
    inner._drawValue = function () {
        inner._drawCanvasBackround();
        inner._drawBackground();
        inner._drawCalibration();
        inner._drawPointer();
        inner._drawCurrentValue();
    };
    inner.setOptions = function (ops) {
        inner.options = dcharttools.funcs._override(inner.options, ops);
    };
    //临时调整时间
    inner.setAdjust = function (adjust) {
        inner._configs._adjust = adjust || 0;
    };
    //绘制一个值
    inner.draw = function () {
        //强制重新计算一次
        inner._computeOptions(true);
        //如果之前有动画，则停止该动画
        if (inner._configs._runningHandler) {
            clearInterval(inner._configs._runningHandler);
        }
        inner._configs._adjust = inner.options.adjust || 0;
        if (inner.options.tickType == "fluent") {
            inner._configs._runningHandler = setInterval(function () {
                inner._configs._currentVal = new Date((new Date).getTime() + inner._configs._adjust);
                inner._drawValue();
            }, 10);
        }
        else if (inner.options.tickType == "vibrate") {
            inner._configs._runningHandler = setInterval(function () {
                var currenttime = (new Date).getTime() + inner._configs._adjust;
                inner._configs._currentVal = new Date(currenttime);
                if (currenttime - Date.parse(inner._configs._currentVal.format("yyyy/MM/dd hh:mm:ss")) <= 30) {
                    inner._drawValue();
                }
            }, 10);
        }
    };
    inner._initial();
    return inner;
}