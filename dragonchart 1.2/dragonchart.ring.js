﻿if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Ring = {
        SeparateLineColor: null,
        InnerLabelColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)'
    };
}
DChart.Ring = DChart.getCore().__extends({ GraphType: 'Ring' });
DChart.Ring._spreadSkin = function (newOps, skin) {
    newOps.separateLine = {}; newOps.innerLabel = {}; newOps.outerLabel = {};
    newOps.separateLine.color = skin.SeparateLineColor || null;
    newOps.innerLabel.color = skin.InnerLabelColor || null;
    newOps.outerLabel.color = skin.OuterLabelColor || null;
    newOps.outerLabel.bordercolor = skin.OuterLabelBorderColor || null;
    newOps.outerLabel.backcolor = skin.OuterLabelBackColor || null;
};
DChart.Ring._getDefaultOptions = function (originalCommonOptions) {
    var options = DChart.Methods.Extend(originalCommonOptions, {
        offX: 0,
        offY: 0,
        innerRadius: null,
        outerRadius: null,
        margin: null,
        colors: null,
        animateRotate: true,
        animateScale: true,
        startAngle: null,
        clickout: true,
        separateLine: {
            show: false,
            color: null,
            width: null
        },
        innerLabel: {
            show: true,
            content: function (data) {
                return data.percent.toFixed(1) + '%';
            },
            distance: null,
            color: null,
            fontsize: null,
            fontfamily: null
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
            backcolor: 'rgba(255,255,255,0.3)',
            bordercolor: null,
            borderwidth: 0.5,
            fontsize: null,
            fontfamily: null
        }
    });
    return options;
};
DChart.Ring._getCheckOptions = function () {
    return {
        __top: [['offX', 'n'], ['offX', 'n'], ['innerRadius', 'n'], ['outerRadius', 'n'], ['margin', 'n'], ['colors', 'ca'], ['animateRotate', 'b'], ['animateScale', 'b'], ['startAngle', 'n'], ['clickout', 'b']],
        separateLine: [['show', 'b'], ['color', 'c'], ['width', 'n']],
        innerLabel: [['show', 'b'], ['content', 'f'], ['distance', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
        outerLabel: [['show', 'b'], ['content', 'f'], ['withlegend', 'b'], ['legendtype', 's'], ['length', 'n'], ['backcolor', 'c'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's']]
    };
};
DChart.Ring._drawgraphic = function (inner, graphicID, innerData, options) {
    var segmentTotal = inner._computeSegmentTotal(innerData).segmentTotal;
    var separateLineWidth = options.separateLine.show ? (options.separateLine.width || 0.5) : 0;
    var radiusInfo = inner._computeRadiusForPies(options);
    var pieOuterRadius = !options.outerRadius || !DChart.Methods.IsNumber(options.outerRadius) ? radiusInfo.maxRadius : options.outerRadius;
    var pieInnerRadius = options.innerRadius && options.innerRadius > pieOuterRadius * 0.1 && options.innerRadius < pieOuterRadius ? options.innerRadius : pieOuterRadius * 0.7;
    if (pieOuterRadius <= pieInnerRadius) {
        throw new Error(inner._messages.WrongSet + inner._messages.OuterRadiusShouldBigger);
    }
    var isMain = graphicID == inner.ID;
    var colors = (options.colors && options.colors.length > 0 ? options.colors : null) || DChart.Const.Defaults.FillColors;
    if (isMain) {
        inner.coordinates.draw = radiusInfo.coordinate;
        inner._configs.legendColors = colors;
    }
    var clickoutLength = pieOuterRadius / 10;
    if (!inner.coordinates.ring) { inner.coordinates.ring = {}; }
    inner.coordinates.ring[graphicID] = { outerRadius: pieOuterRadius, innerRadius: pieInnerRadius, centerX: radiusInfo.centerX, centerY: radiusInfo.centerY, cemicircles: [], outerlabels: [] };
    inner.shapes[graphicID] = { cemicircles: [], outerLabels: [] };
    var shapes = inner.shapes[graphicID];
    var cutX = 3; var cutY = 3;
    var resetOuterLabelPosition = true;
    var specificConfig = inner._configs.specificConfig[graphicID];
    var pieshape = function (index, angleMin, angleMax, data, isClickout) {
        this.index = index;
        this.angleMin = angleMin;
        this.angleMax = angleMax;
        this.data = data;
        this.isHovered = false;
        this.isClickout = isClickout;
        this.color = function () {
            return this.data.color || colors[this.index % colors.length];
        };
        this.redraw = function (clickout, color) {
            drawPart(clickout, 1, this.angleMin, this.angleMax, color || this.color());
        };
        this.contact = null;
        this.click = function (e, color) {
            if (options.clickout) {
                resetOuterLabelPosition = true;
                this.isClickout = !this.isClickout;
                inner.redrawAll();
                var mouseoverTransp = options.mouseoverTransparency;
                var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                this.redraw(this.isClickout, newColor);
                drawOuterLabels(this, newColor);
            }
            if (!options.clickout || this.isClickout) {
                var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
                if (click) {
                    click(this.data, e);
                }
            }
        };
        if (options.tip.show && typeof options.tip.content == 'function') {
            this.tip = null;
            this.showTip = function () {
                if (this.tip) {
                    this.tip.style.display = 'inline';
                }
                else {
                    var midAngle = (this.angleMin + this.angleMax) / 2;
                    var left = radiusInfo.centerX + (pieOuterRadius + pieInnerRadius) / 2 * Math.cos(midAngle);
                    var top = radiusInfo.centerY + (pieOuterRadius + pieInnerRadius) / 2 * Math.sin(midAngle);
                    this.tip = inner._createTip(options.tip.content(this.data), left, top);
                    var shape = this;
                    shape.tip.onclick = function (e) { shape.click(e); };
                }
            };
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
        this.endX = function () { return this.left + (this.floatright ? 0 : this.width); };
        this.endY = function () { return this.top + this.height / 2; };
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
            var centerX = radiusInfo.centerX;
            var centerY = radiusInfo.centerY;
            var midAngle = (this.contact.angleMin + this.contact.angleMax) / 2;
            var cosmid = Math.cos(midAngle);
            var sinmid = Math.sin(midAngle);
            if (this.contact.isClickout) {
                centerX += clickoutLength * cosmid;
                centerY += clickoutLength * sinmid;
            }
            var distance = 1.15;
            var cosright = cosmid > 0 ? 1 + cosmid : 0;
            var sinbottom = sinmid > 0 ? sinmid : 0;
            this.startX = centerX + pieOuterRadius * cosmid;
            this.startY = centerY + pieOuterRadius * sinmid;
            this.left = centerX + pieOuterRadius * distance * cosmid + (this.floatright ? 0 : -this.width);
            this.top = centerY + pieOuterRadius * distance * sinmid + sinbottom * length - length - cutY;
        };
    };
    var drawPart = function (clickout, scalePercent, angleMin, angleMax, color, data, pieshape) {
        var midAngle = (angleMin + angleMax) / 2;
        var centerX = radiusInfo.centerX;
        var centerY = radiusInfo.centerY;
        var cosmid = Math.cos(midAngle);
        var sinmid = Math.sin(midAngle);
        if (clickout) {
            centerX += clickoutLength * cosmid;
            centerY += clickoutLength * sinmid;
        }
        var linewidth = options.separateLine.show ? (options.separateLine.width || 1) : 0;
        inner.DrawFigures.createRing(centerX, centerY, pieInnerRadius * scalePercent, pieOuterRadius * scalePercent, color, angleMin, angleMax, linewidth, options.separateLine.color);
        var ops = options.outerLabel;
        if (data && ops.show && typeof ops.content == 'function') {
            var length = ops.length || pieOuterRadius / 12;
            var floatright = DChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, midAngle);
            var floattop = DChart.Methods.JudgeBetweenAngle(-Math.PI, 0, midAngle);
            var content = ops.content(data);
            var ctxWidth = inner.DrawFigures.measureText(content, null, ops.fontsize || (length - 1), ops.fontfamily);
            var width = ctxWidth + (ops.withlegend ? length + 3 * cutX : 2 * cutX);
            var height = length + cutY * 2;
            var labelshape = new outerLabelShape(content, length, width, height, floatright ? 1 : 0, floattop ? 1 : 0, data, pieshape);
            shapes.outerLabels.push(labelshape);
            pieshape.contact = labelshape;
        }
    };
    var drawInnerLabels = function (_shape) {
        var ops = options.innerLabel;
        if (!(ops.show && typeof ops.content == 'function')) { return; }
        var distance = (ops.distance || 0.5);
        var drawSingleLabel = function (shape) {
            var midAngle = (shape.angleMin + shape.angleMax) / 2;
            var data = shape.data;
            var length = pieInnerRadius + (pieOuterRadius - pieInnerRadius) * distance + (shape.isClickout ? clickoutLength : 0);
            var left = radiusInfo.centerX + length * Math.cos(midAngle);
            var top = radiusInfo.centerY + length * Math.sin(midAngle);
            inner.DrawFigures.createText(ops.content(data), left, top, 'center', data.fontweight, data.fontsize || ops.fontsize || pieOuterRadius / 10, ops.fontfamily, data.fontcolor || ops.color || DChart.Const.Defaults.InnerLabelColor);
        };
        if (_shape) { drawSingleLabel(_shape); }
        else {
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                drawSingleLabel(shape);
            }
        }
    };
    var drawOuterLabels = function (_shape, _color) {
        var ops = options.outerLabel;
        if (!(ops.show && typeof ops.content == 'function')) { return; }
        var minY = isMain ? radiusInfo.coordinate.minY : 5;
        var maxY = isMain ? radiusInfo.coordinate.maxY : inner.canvas.height - 5;
        if (resetOuterLabelPosition) {
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) { shape.resetposition(); }
            resetOuterLabelPosition = false;
        }
        var resetPosition = function () {
            var judgeOuterLabelCross = function (r1, r2) {
                return Math.max(r1.left, r2.left) <= Math.min(r1.left + r1.width, r2.left + r2.width) && Math.max(r1.top, r2.top) <= Math.min(r1.top + r1.height, r2.top + r2.height);
            };
            var lefttop = []; var leftbuttom = []; var righttop = []; var rightbottom = [];
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) {
                while (minY > shape.top) {
                    shape.top += cutY;
                    shape.left += shape.floatright ? cutX : -cutX;
                }
                while (maxY < shape.top + shape.height) {
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
                if (ops.backcolor) {
                    inner.DrawFigures.createRectangleFill(shape.left, shape.top, shape.width, shape.height, ops.backcolor);
                }
                var left = shape.left + (shape.floatright ? cutX + (ops.withlegend ? shape.length + cutX : 0) : shape.width - cutX);
                var top = shape.top + shape.length + cutY / 2;
                inner.DrawFigures.createText(shape.content, left, top, shape.floatright ? 'left' : 'right', null, ops.fontsize || (shape.length - 1), ops.fontfamily, ops.color);
                if (ops.borderwidth && ops.borderwidth > 0) {
                    inner.DrawFigures.createRectangleBorder(shape.left, shape.top, shape.width, shape.height, ops.borderwidth, ops.bordercolor);
                }
            }
            if (ops.withlegend) {
                var legendtype = ops.legendtype || 's';
                var color = color || shape.color();
                inner.DrawFigures.createPointElement(legendtype, shape.left + cutX, shape.top + cutY, shape.length, color, legendtype != 'x', color, 2, legendtype == 'x');
            }
        };
        if (_shape) {
            drawSingleLabel(_shape.contact, _color);
        }
        else {
            resetPosition();
            inner.coordinates.ring[graphicID].outerlabels.length = 0;
            for (var i = 0, shape; shape = shapes.outerLabels[i]; i++) {
                drawSingleLabel(shape);
                inner.coordinates.ring[graphicID].outerlabels[i] = { index: shape.contact.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
            }
        }
    };
    var redraw = function () {
        for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
            shape.redraw(shape.isClickout);
        }
        drawInnerLabels();
        drawOuterLabels();
    };
    var drawSegments = function (animationDecimal, percentAnimComplete) {
        var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
        var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
        var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
        for (var i = 0, item; item = innerData[i]; i++) {
            var percent = (item.value / segmentTotal) * 100;
            var segmentAngle = rotateAnimation * (percent / 100 * (Math.PI * 2));
            var color = item.color || colors[i % colors.length];
            var angleMax = cumulativeAngle + segmentAngle;
            if (percentAnimComplete >= 1) {
                item.index = i;
                item.percent = percent;
                var _pieshape = new pieshape(i, cumulativeAngle, angleMax, item, item.extended == true);
                shapes.cemicircles.push(_pieshape);
                drawPart(item.extended, scaleAnimation, cumulativeAngle, angleMax, color, item, _pieshape);
                inner.coordinates.ring[graphicID].cemicircles.push({ index: i, percent: percent, angleMin: cumulativeAngle, angleMax: angleMax, color: color });
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
    var mouseEvents = function () {
        var fixShape = function (x, y) {
            var veryShape = null;
            for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var offX = clickoutLength * Math.cos(midAngle);
                var offY = clickoutLength * Math.sin(midAngle);
                var centerX = radiusInfo.centerX + (shape.isClickout ? offX : 0);
                var centerY = radiusInfo.centerY + (shape.isClickout ? offY : 0);
                var currentAngle = DChart.Methods.GetCurrentAngle(x, y, centerX, centerY);
                var distance2 = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
                var withinPie = distance2 >= Math.pow(pieInnerRadius, 2) && distance2 <= Math.pow(pieOuterRadius, 2) && DChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
                var withinOuterLabel = false;
                if (options.outerLabel && options.outerLabel.show && shape.contact) {
                    var rectangle = shape.contact;
                    if (x >= rectangle.left && x <= rectangle.left + rectangle.width && y >= rectangle.top && y <= rectangle.top + rectangle.height) {
                        withinOuterLabel = true;
                    }
                }
                if (withinPie || withinOuterLabel) {
                    veryShape = shape; break;
                }
            }
            return veryShape;
        };
        var onclick = function (e) {
            var e = window.event || e;
            var location = inner._getMouseLoction(e);
            var veryShape = fixShape(location.X, location.Y);
            if (veryShape) {
                veryShape.click(e);
            }
        };
        var onmousemove = function (e) {
            var e = window.event || e;
            var location = inner._getMouseLoction(e);
            var veryShape = fixShape(location.X, location.Y);
            if (veryShape) { inner._configs.cursorPointer = true; }
            if (specificConfig.currentMouseShape != veryShape) {
                var shape = specificConfig.currentMouseShape;
                if (shape) {
                    var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                    if (mouseleave) {
                        mouseleave(shape.data, e);
                    }
                }
                if (specificConfig.currentMouseShape) {
                    inner.redrawAll();
                }
                specificConfig.currentMouseShape = veryShape;
                for (var i = 0, shape; shape = shapes.cemicircles[i]; i++) {
                    if (shape.isHovered) {
                        shape.isHovered = false;
                        if (shape.hideTip) { shape.hideTip(); }
                    }
                }
                if (veryShape) {
                    veryShape.isHovered = true;
                    var mouseoverTransp = options.mouseoverTransparency;
                    var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                    veryShape.redraw(veryShape.isClickout, newColor);
                    drawOuterLabels(veryShape, newColor);
                    if (veryShape.showTip) { veryShape.showTip(); }
                    var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                    if (mouseover) {
                        mouseover(veryShape.data, e);
                    }
                }
            }
        };
        inner._addEventListener('click', onclick);
        inner._addEventListener('mousemove', onmousemove);
    };
    return { drawSegments: drawSegments, mouseEvents: mouseEvents, redraw: redraw };
};

