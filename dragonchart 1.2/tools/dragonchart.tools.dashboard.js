//仪表盘
dcharttools.dashboard = function (parentDivID) {
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
        //当前显示的值
        inner._configs._currentval = 0;
        inner._configs._nextval = 0;
        //待显示的值列表
        inner._configs._unfinished = [];
        //指示是否真正动画中
        inner._configs._isRunning = false;
        inner._configs._isWarning = false;
        //用户表现闪动效果的计数
        inner._configs._warningCount = 0;
        //控制动画
        inner._configs._warningHandler = null;
        inner._configs._computed = null;
        inner.options = inner._getDefaultOptions();
    };
    inner._getDefaultOptions = function () {
        var options = {
            animation: true,
            //动画持续的时间
            animationTime: 1,
            //动画执行的帧数
            animationSteps: 24,
            centerX: null,
            centerY: null,
            radius: null,
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
                margin: null,
                minvalue: 0,
                maxvalue: 200,
                scalecount: 10,
                //开始角度
                startangle: -0.8,
                //结束角度
                endangle: 0.8,
                //刻度线的长度
                length: null,
                linecolor: '#999999',
                //小刻度的线宽
                thinwidth: 1,
                //大刻度的线宽
                thickwidth: 2,
                thickerwidth: 4,
                //颜色分类
                grades: [
                    { color: 'rgba(16,173,28,0.5)', minvalue: 0, maxvalue: 100 },
                    { color: 'rgba(255,153,51,0.5)', minvalue: 100, maxvalue: 150 },
                    { color: 'rgba(239,11,11,0.5)', minvalue: 150, maxvalue: null }
                ]
            },
            //刻度文本
            labels: {
                margin: null,
                content: function (val) {
                    return val.toString();
                },
                //几个小刻度绘制一个label
                interval: 10,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: null
            },
            //指针设置
            pointer: {
                //节点的颜色
                nodecolor: null,
                //圆形节点的直径
                nodelength: null,
                //指针的颜色
                pincolor: null,
                //指针尾部的宽度
                tailwidth: null,
                //指针的长度
                pinlength: null
            },
            //单位说明
            unit: {
                content: null,
                //距中点的距离与半径的比值
                distance: null,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: null,
                backcolor: null,
                borderwidth: 0,
                bordercolor: null
            },
            //当前显示值
            currentValue: {
                show: true,
                content: function (val) {
                    return val.toFixed(1);
                },
                //距中点的距离与半径的比值
                distance: null,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: null,
                backcolor: null,
                borderwidth: 0,
                bordercolor: null
            },
            //警告标志
            warning: {
                //阀值设置
                thresholdmin: null,
                thresholdmax: null,
                warningframes: 5,
                contentmin: 'Exceeded the minimum warning value!!!',
                contentmax: 'Exceeded the maximum warning value!!!',
                //是否位于顶部，否则位于底部
                locatetop: true,
                distance: null,
                fontcolor: null,
                fontsize: null,
                fontfamily: null,
                fontweight: null
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
        var margin = ops.calibration.margin || radius / 20;
        var length = ops.calibration.length || radius / 10;
        var innerRadius = radius - margin - length;
        var outerRadius = radius - margin;
        var calibration = { length: length, margin: margin, innerRadius: innerRadius, outerRadius: outerRadius };
        var labelmargin = ops.labels.margin || radius / 15;
        var labelfontsize = ops.labels.fontsize || radius / 10;
        var labelradius = innerRadius - labelmargin;
        var labels = { margin: labelmargin, radius: labelradius, fontsize: labelfontsize };
        //指针相关
        var nodelength = ops.pointer.nodelength || radius / 12;
        var tailwidth = ops.pointer.tailwidth || radius / 25;
        var pinlength = ops.pointer.pinlength || radius * 0.9;
        if (pinlength >= radius + nodelength) {
            throw new Error("pinlength should be less than radius!");
        }
        var pointer = { nodelength: nodelength, tailwidth: tailwidth, pinlength: pinlength };

        var unitdistance = ops.unit.distance == null ? 0.2 : ops.unit.distance;
        var unitfontsize = ops.unit.fontsize || radius / 8;
        var unit = { distance: unitdistance, fontsize: unitfontsize };

        var valuedistance = ops.currentValue.distance == null ? 0.2 : ops.currentValue.distance;
        var valuefontsize = ops.currentValue.fontsize || radius / 8;
        var currentValue = { distance: valuedistance, fontsize: valuefontsize };

        var warningdistance = ops.warning.distance == null ? 1.1 : ops.warning.distance;
        var warningfontsize = ops.warning.fontsize || radius / 8;
        var warning = { distance: warningdistance, fontsize: warningfontsize };

        inner._configs._computed = {
            centerX: centerX, centerY: centerY, radius: radius,
            calibration: calibration, labels: labels, pointer: pointer, unit: unit, currentValue: currentValue, warning: warning
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
        var ops = inner.options.calibration;
        var opslabels = inner.options.labels;
        var margin = computed.calibration.margin;
        var length = computed.calibration.length;
        var innerRadius = computed.calibration.innerRadius;
        var outerRadius = computed.calibration.outerRadius;
        var labelRadius = computed.labels.radius;
        //绘制分级背景色
        var grades = ops.grades;
        for (var i = 0; i < grades.length; i++) {
            var minval = grades[i].minvalue || ops.minvalue;
            var maxval = grades[i].maxvalue || ops.maxvalue;
            var angleMin = ops.startangle - 0.5 + (ops.endangle - ops.startangle) * (minval - ops.minvalue) / (ops.maxvalue - ops.minvalue);
            var angleMax = ops.startangle - 0.5 + (ops.endangle - ops.startangle) * (maxval - ops.minvalue) / (ops.maxvalue - ops.minvalue);
            dcharttools.createRing(inner.ctx, computed.centerX, computed.centerY, innerRadius, outerRadius, grades[i].color, angleMin * Math.PI, angleMax * Math.PI);
        }
        //绘制小刻度
        var scalecount = ops.scalecount * 10;
        var anglecut = (ops.endangle - ops.startangle) * Math.PI / scalecount;
        var valuecut = (ops.maxvalue - ops.minvalue) / scalecount;
        for (var i = 0; i < scalecount + 1; i++) {
            var angle = ops.startangle * Math.PI + anglecut * i;
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var innerX = computed.centerX + innerRadius * sin;
            var innerY = computed.centerY - innerRadius * cos;
            var outerX = computed.centerX + outerRadius * sin;
            var outerY = computed.centerY - outerRadius * cos;
            dcharttools.createLine(inner.ctx, innerX, innerY, outerX, outerY, i % 10 == 0 ? ops.thickerwidth : (i % 5 == 0 ? ops.thickwidth : ops.thinwidth), ops.linecolor);
            if (i % opslabels.interval == 0) {
                var labelval = ops.minvalue + i * valuecut;
                var content = opslabels.content(labelval);
                var labelX = computed.centerX + (labelRadius - computed.labels.fontsize / 2) * sin;
                var labelY = computed.centerY - (labelRadius - computed.labels.fontsize / 2) * cos;
                dcharttools.createText(inner.ctx, content, labelX, labelY, 'center', opslabels.fontweight, computed.labels.fontsize, opslabels.fontfamily, opslabels.fontcolor, angle);
            }
        }
    };
    //绘制指针
    inner._drawPointer = function (val) {
        var computed = inner._computeOptions();
        var ops = inner.options.pointer;
        var opscalibration = inner.options.calibration;
        var angle = opscalibration.startangle * Math.PI + (opscalibration.endangle - opscalibration.startangle) * Math.PI * (val - opscalibration.minvalue) / (opscalibration.maxvalue - opscalibration.minvalue);
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var outerX = computed.centerX + (computed.pointer.pinlength - computed.pointer.nodelength) * sin;
        var outerY = computed.centerY - (computed.pointer.pinlength - computed.pointer.nodelength) * cos;
        var innerLeftX = computed.centerX - computed.pointer.nodelength * sin - computed.pointer.tailwidth / 2 * cos;
        var innerLeftY = computed.centerY + computed.pointer.nodelength * cos - computed.pointer.tailwidth / 2 * sin;
        var innerRightX = computed.centerX - computed.pointer.nodelength * sin + computed.pointer.tailwidth / 2 * cos;
        var innerRightY = computed.centerY + computed.pointer.nodelength * cos + computed.pointer.tailwidth / 2 * sin;
        var points = [[outerX, outerY], [innerLeftX, innerLeftY], [innerRightX, innerRightY]];
        dcharttools.createArc(inner.ctx, computed.centerX, computed.centerY, computed.pointer.nodelength / 2, 0, null, ops.nodecolor || '#000000');
        dcharttools.createCloseFigure(inner.ctx, points, ops.pincolor || '#000000');
    };
    //绘制单位说明
    inner._drawUnit = function () {
        var ops = inner.options.unit;
        if (!ops.content) {
            return;
        }
        var computed = inner._computeOptions();
        var centerY = computed.centerY - computed.radius * computed.unit.distance + computed.unit.fontsize / 3;
        if (ops.backcolor || ops.borderwidth) {
            var fontlength = dcharttools.measureText(inner.ctx, ops.content, ops.fontweight, computed.unit.fontsize, ops.fontfamily);
            var left = computed.centerX - fontlength / 2 - computed.unit.fontsize / 4;
            var top = centerY - computed.unit.fontsize;
            dcharttools.createRect(inner.ctx, left, top, fontlength + computed.unit.fontsize / 2, computed.unit.fontsize * 4 / 3, ops.backcolor, ops.borderwidth, ops.bordercolor);
        }
        dcharttools.createText(inner.ctx, ops.content, computed.centerX, centerY, 'center', ops.fontweight, computed.unit.fontsize, ops.fontfamily, ops.fontcolor);
    };
    //显示当前值
    inner._drawCurrentValue = function () {
        var ops = inner.options.currentValue;
        if (!inner._configs._nextval || !ops.show || typeof ops.content != 'function') { return; }
        var computed = inner._computeOptions();
        var centerY = computed.centerY + computed.radius * computed.currentValue.distance + computed.currentValue.fontsize / 3;
        var content = ops.content(inner._configs._nextval);
        if (ops.backcolor || ops.borderwidth) {
            var fontlength = dcharttools.measureText(inner.ctx, content, ops.fontweight, computed.currentValue.fontsize, ops.fontfamily);
            var left = computed.centerX - fontlength / 2 - computed.currentValue.fontsize / 4;
            var top = centerY - computed.currentValue.fontsize;
            dcharttools.createRect(inner.ctx, left, top, fontlength + computed.currentValue.fontsize / 2, computed.currentValue.fontsize * 4 / 3, ops.backcolor, ops.borderwidth, ops.bordercolor);
        }
        dcharttools.createText(inner.ctx, content, computed.centerX, centerY, 'center', ops.fontweight, computed.currentValue.fontsize, ops.fontfamily, ops.fontcolor);
    };
    //当操作警告阀值时，发出警告
    inner._drawWarning = function () {
        var computed = inner._computeOptions();
        var ops = inner.options.warning;
        var animationSteps = inner.options.animationSteps;
        var warningframes = ops.warningframes;
        var beyondMin = ops.thresholdmin != null && inner._configs._currentval <= ops.thresholdmin;
        var beyondMax = ops.thresholdmax != null && inner._configs._currentval >= ops.thresholdmax;
        if (beyondMin || beyondMax) {
            if (inner._configs._isWarning) {
                inner.disarmWarning();
            }
            inner._configs._isWarning = true;
            inner._configs._warningHandler = setInterval(function () {
                if (!inner._configs._isRunning) {
                    //一半时间显示，一半时间隐藏，从而形成动画
                    if (inner._configs._warningCount < warningframes) {
                        inner._drawCanvasBackround();
                    }
                    else {
                        inner._drawValue(inner._configs._currentval);
                        var centerY = computed.centerY + (ops.locatetop ? -computed.radius * computed.warning.distance : computed.radius * computed.warning.distance) + computed.warning.fontsize / 3;
                        dcharttools.createText(inner.ctx, beyondMin ? ops.contentmin : ops.contentmax, computed.centerX, centerY, 'center', ops.fontweight, computed.warning.fontsize, ops.fontfamily, ops.fontcolor || '#ff0000');
                    }
                    inner._configs._warningCount++;
                    //达到两倍，计数重新归零
                    if (inner._configs._warningCount > warningframes * 2) {
                        inner._configs._warningCount = 0;
                    }
                }
            }, 1000 / animationSteps);
        }
        else {
            inner.disarmWarning();
        }
    };
    //绘制一个值
    inner._drawValue = function (val) {
        inner._drawCanvasBackround();
        inner._drawBackground();
        inner._drawCalibration();
        inner._drawUnit();
        inner._drawCurrentValue();
        inner._drawPointer(val);
    };
    //解除当前警报
    inner.disarmWarning = function () {
        if (inner._configs._warningHandler != null) {
            inner._configs._isWarning = false;
            clearInterval(inner._configs._warningHandler);
            inner._drawValue(inner._configs._currentval);
        }
    };
    inner.setOptions = function (ops) {
        inner.options = dcharttools.funcs._override(inner.options, ops);
    };
    //绘制一个值
    inner.draw = function (val) {
        //强制重新计算一次
        inner._computeOptions(true);
        if (inner.options.animation) {
            var animationTime = (inner.options.animationTime || 1) * 1000;
            var animationSteps = inner.options.animationSteps || 24;
            if (animationTime > 1000) {
                throw new Error("animationTime should not be bigger than 1!");
            }
            if (animationSteps > 50) {
                throw new Error("animationSteps should not be bigger than 50!");
            }
            inner._configs._unfinished.push(val);
            var finish = function (finishval) {
                inner._configs._currentval = finishval;
                inner._drawWarning();
                if (inner._configs._unfinished.length > 1) {
                    inner._configs._unfinished = inner._configs._unfinished.slice(1);
                    addAmination();
                }
                else {
                    inner._drawValue(inner._configs._currentval);
                    inner._configs._unfinished.length = 0;
                    inner._configs._isRunning = false;
                }
            };
            var addAmination = function () {
                var amiVal = inner._configs._unfinished[0];
                inner._configs._nextval = amiVal;
                var tmpval = inner._configs._currentval;
                var valuecut = (amiVal - tmpval) / animationSteps;
                if (Math.abs(valuecut) < 0.000001) {
                    finish(amiVal);
                }
                else {
                    inner._configs._isRunning = true;
                    var bigger = amiVal >= tmpval;
                    var handler = setInterval(function () {
                        tmpval += valuecut;
                        if (Math.abs(tmpval - amiVal) < 0.0001 || bigger && tmpval <= amiVal || !bigger && tmpval >= amiVal) {
                            inner._drawValue(tmpval);
                        }
                        else {
                            clearInterval(handler);
                            finish(amiVal);
                        }
                    }, animationTime / animationSteps);
                }
            };
            if (!inner._configs._isRunning) {
                addAmination();
            }
        }
        else {
            inner._configs._currentval = val;
            inner._configs._nextval = val;
            inner._drawValue(val);
        }
    };
    inner._initial();
    return inner;
}