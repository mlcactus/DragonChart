//默认配置
window.dcharttools = {};
dcharttools.canvasConfigs = { defaultLineColor: '#CCCCCC', defaultLineWidth: 1, defaultFontFamily: '微软雅黑', defaultFontSize: 14, defaultFontColor: '#000000' };
dcharttools.funcs = {};
dcharttools.funcs._getMouseLoction = function(e) {
    //判断浏览器是否直接支持Offset
    if (e.offsetX != null) {
        return { X: e.offsetX, Y: e.offsetY };
    }
    else {
        //兼容火狐
        var getPageCoord = function(element) {
            var coord = { x: 0, y: 0 };
            while (element) {
                coord.x += element.offsetLeft;
                coord.y += element.offsetTop;
                element = element.offsetParent;
            }
            return coord;
        };
        var target = e.target;
        if (target.offsetLeft == undefined) { target = target.parentNode; }
        var pageCoord = getPageCoord(target);
        var eventCoord = { x: window.pageXOffset + e.clientX, y: window.pageYOffset + e.clientY };
        return { X: eventCoord.x - pageCoord.x, Y: eventCoord.y - pageCoord.y };
    }
};
dcharttools.funcs._judgeNormalObject = function(obj) {
    return obj && typeof obj == 'object' && !(Object.prototype.toString.call(obj) === '[object Array]') && !(typeof obj == 'object' && obj.constructor == Date);
};
dcharttools.funcs._deepCopy = function(oldops) {
    var result = {};
    var deepDig = function(res, obj, path) {
        backupPath = path;
        for (var attrname in obj) {
            path += attrname + '.';
            if (dcharttools.funcs._judgeNormalObject(obj[attrname])) {
                res[attrname] = {};
                deepDig(res[attrname], obj[attrname], path);
            }
            else {
                if (obj.hasOwnProperty(attrname)) {
                    res[attrname] = obj[attrname];
                }
            }
            path = backupPath;
        }
    };
    deepDig(result, oldops, '');
    return result;
};
//扩展和覆盖对象
dcharttools.funcs._override = function(defaults, overrides, ingoreNull) {
    var result = dcharttools.funcs._deepCopy(defaults);
    var deepDig = function(res, obj, path) {
        var backupPath = path;
        for (var attrname in obj) {
            path += attrname + '.';
            if (res[attrname] !== undefined && obj.hasOwnProperty(attrname)) {
                if (dcharttools.funcs._judgeNormalObject(obj[attrname]) && dcharttools.funcs._judgeNormalObject(res[attrname])) {
                    deepDig(res[attrname], obj[attrname], path);
                }
                else if (!ingoreNull || obj[attrname] != null) {
                    res[attrname] = obj[attrname];
                }
            }
            path = backupPath;
        }
    };
    deepDig(result, overrides, '');
    return result;
};
//根据线宽来微调整x、y的大小，以真正绘制出所需要的线宽（不会把linewidth=1绘制成2）
//如果绘制直线，则y为undefined；如果绘制方形边框，则x与y值都不为空
dcharttools.funcs._formatLinePosition = function(width, x, y) {
    var width = Math.ceil(width);
    var format = function(val) {
        var i = Math.floor(val);
        if (width % 2 == 0) {
            return val - i > 0.5 ? i + 1 : i;
        }
        else {
            return i + 0.5;
        }
    };
    if (arguments.length == 3) {
        return { x: format(x), y: format(y) };
    }
    else {
        return format(x);
    }
};
//跟踪平滑曲线
dcharttools.funcs._curveSmoothPoints = function(ctx, point0, point1, invertAxis) {
    var centerX = (point0[0] + point1[0]) / 2;
    var centerY = (point0[1] + point1[1]) / 2;
    if (invertAxis) {
        ctx.quadraticCurveTo(point0[0], 0.5 * centerY + 0.5 * point0[1], centerX, centerY);
        ctx.quadraticCurveTo(point1[0], 0.5 * centerY + 0.5 * point1[1], point1[0], point1[1]);
    }
    else {
        ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point0[0], point0[1], centerX, centerY);
        ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point1[0], point1[1], point1[0], point1[1]);
    }
};
//设置阴影
dcharttools.funcs._setShadow = function(ctx, shadow) {
    if (shadow) {
        if (shadow.color) {
            ctx.shadowColor = shadow.color;
        }
        if (shadow.blur) {
            ctx.shadowBlur = shadow.blur;
        }
        if (shadow.offsetX) {
            ctx.shadowOffsetX = shadow.offsetX;
        }
        if (shadow.offsetY) {
            ctx.shadowOffsetY = shadow.offsetY;
        }
    }
};
//绘制一个弧状图形
dcharttools.createArc = function(ctx, centerX, centerY, radius, linewidth, linecolor, fillcolor, angleMin, angleMax, shadow, linkCenter) {
    if (arguments.length < 4) {
        return;
    }
    angleMin = angleMin || 0;
    angleMax = angleMax || Math.PI * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angleMin, angleMax);
    if (linkCenter && Math.abs(angleMax - angleMin) < Math.PI * 2 - 0.0001) {
        ctx.lineTo(centerX, centerY);
    }
    ctx.closePath();
    dcharttools.funcs._setShadow(ctx, shadow);
    if (linewidth > 0) {
        ctx.strokeStyle = linecolor || dcharttools.canvasConfigs.defaultLineColor;
        ctx.lineWidth = linewidth;
        ctx.stroke();
    }
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    ctx.restore();
};
//绘制一个环状图形
dcharttools.createRing = function(ctx, centerX, centerY, innerRadius, outerRadius, fillcolor, angleMin, angleMax, linewidth, linecolor) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX + outerRadius * Math.cos(angleMin), centerY + outerRadius * Math.sin(angleMin));
    ctx.arc(centerX, centerY, outerRadius, angleMin, angleMax);
    ctx.lineTo(centerX + innerRadius * Math.cos(angleMax), centerY + innerRadius * Math.sin(angleMax));
    ctx.arc(centerX, centerY, innerRadius, angleMax, angleMin, true);
    ctx.closePath();
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    if (linewidth > 0) {
        ctx.lineWidth = linewidth;
        ctx.strokeStyle = linecolor || dcharttools.canvasConfigs.defaultLineColor;
        ctx.stroke();
    }
    ctx.restore();
};
//计算文本占用的宽度
dcharttools.measureText = function(ctx, content, fontweight, fontsize, fontfamily) {
    ctx.save();
    ctx.font = (fontweight || 'normal') + ' ' + (fontsize || dcharttools.canvasConfigs.defaultFontSize) + 'px ' + (fontfamily || dcharttools.canvasConfigs.defaultFontFamily);
    var textWidth = ctx.measureText(content).width;
    ctx.restore();
    return textWidth;
};
//绘制文本
dcharttools.createText = function (ctx, content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate) {
    ctx.save();
    ctx.textAlign = textAlign || 'left';
    ctx.font = (fontweight || 'normal') + ' ' + (fontsize || dcharttools.canvasConfigs.defaultFontSize) + 'px ' + (fontfamily || dcharttools.canvasConfigs.defaultFontFamily);
    var textWidth = ctx.measureText(content).width;
    ctx.fillStyle = color || dcharttools.canvasConfigs.defaultFontColor;
    //旋转文字
    if (fontrotate) {
        ctx.translate(x, y);
        ctx.rotate(fontrotate);
        ctx.fillText(content, 0, 0);
    }
    else {
        ctx.fillText(content, x, y);
    }
    ctx.restore();
    return textWidth;
};
//绘制长方形图形
dcharttools.createRect = function(ctx, left, top, width, height, fillcolor, borderwidth, bordercolor, shadow) {
    if (width <= 0 || height <= 0) {
        return;
    }
    ctx.save();
    dcharttools.funcs._setShadow(ctx, shadow);
    ctx.beginPath();
    ctx.rect(left, top, width, height);
    ctx.closePath();
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    if (borderwidth > 0) {
        ctx.lineWidth = borderwidth;
        ctx.strokeStyle = bordercolor || dcharttools.canvasConfigs.defaultLineColor;
        ctx.stroke();
    }
    ctx.restore();
};
//绘制两点间的线
dcharttools.createLine = function(ctx, startX, startY, endX, endY, linewidth, linecolor) {
    var linewidth = Math.ceil(linewidth);
    if (startX == endX) {
        startX = endX = dcharttools.funcs._formatLinePosition(linewidth, startX);
    }
    else if (startY == endY) {
        startY = endY = dcharttools.funcs._formatLinePosition(linewidth, startY);
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = linewidth || dcharttools.canvasConfigs.defaultLineWidth;
    ctx.strokeStyle = linecolor || dcharttools.canvasConfigs.defaultLineColor;
    ctx.stroke();
    ctx.restore();
};
//绘制多点曲线
dcharttools.createPointsLine = function(ctx, points, linewidth, linecolor, smoothline, invertAxis) {
    var len = points.length;
    if (len < 3) {
        return;
    }
    ctx.save();
    ctx.lineWidth = linewidth || dcharttools.canvasConfigs.defaultLineWidth;
    ctx.strokeStyle = linecolor || dcharttools.canvasConfigs.defaultLineColor;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 0; i < len - 1; i++) {
        if (!smoothline) {
            ctx.lineTo(points[i + 1][0], points[i + 1][1]);
        }
        else {
            dcharttools.funcs._curveSmoothPoints(ctx, points[i], points[i + 1], invertAxis);
        }
    }
    ctx.stroke();
    ctx.restore();
};
//绘制一个闭合的图形
dcharttools.createCloseFigure = function(ctx, points, fillcolor, linewidth, linecolor, smoothline, invertAxis, shadow) {
    ctx.save();
    ctx.beginPath();
    var len = points.length;
    dcharttools.funcs._setShadow(ctx, shadow);
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 0; i < len - 1; i++) {
        if (!smoothline) {
            ctx.lineTo(points[i + 1][0], points[i + 1][1]);
        }
        else {
            dcharttools.funcs._curveSmoothPoints(ctx, points[i], points[i + 1], invertAxis);
        }
    }
    ctx.closePath();
    if (fillcolor) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    if (linewidth > 0) {
        ctx.lineWidth = linewidth;
        ctx.strokeStyle = linecolor || dcharttools.canvasConfigs.defaultLineColor;
        ctx.stroke();
    }
    ctx.restore();
};