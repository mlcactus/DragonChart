if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Pie = {
        SepareateLineColor: null,
        InnerLabelColor: null,
        OuterLabelColor: null,
        OuterLabelBorderColor: null,
        OuterLabelBackColor: 'rgba(255,255,255,0.3)'
    };
}
DChart.Pie = DChart.getCore().__extends({
    GraphType: 'Pie',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            radius: null,
            margin: null,
            colors: null,
            animateRotate: true,
            animateScale: true,
            startAngle: null,
            clickout: true,
            separeateLine: {
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
        if (!options.animateRotate && !options.animateScale) { options.animation = false; }
        inner.SetData(_data);
        inner._onStart();
        var coordinate = inner._getDrawableCoordinate();
        var margin = DChart.Methods.IsNumber(options.margin) && options.margin > 0 ? options.margin : 15;
        var maxRadius = Math.min((coordinate.maxX - coordinate.minX) / 3, (coordinate.maxY - coordinate.minY) / 2) - margin * 2;
        var pieRadius = options.radius && options.radius < maxRadius ? options.radius : maxRadius;
        inner.coordinates.draw = coordinate;
        inner.coordinates.pie = { radius: pieRadius, centerX: coordinate.centerX, centerY: coordinate.centerY };
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
        var ctx = inner.ctx;
        var outlength = pieRadius / 10;
        inner.shapes.cemicircles = [];
        inner.shapes.outerLabels = [];
        inner.coordinates.pie.cemicircles = [];
        inner.coordinates.pie.outerlabels = [];
        var cutX = 3; var cutY = 3;
        var resetOuterLabelPosition = true;
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
                    inner._createAssists();
                    drawOuterLabels();
                    for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                        if (shape && shape != this) {
                            shape.redraw(shape.isClickout);
                        }
                        else {
                            this.redraw(this.isClickout);
                            var mouseoverTransp = options.mouseoverTransparency;
                            var newColor = 'rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')';
                            this.redraw(this.isClickout, newColor);
                            drawOuterLabels(this, newColor);
                        }
                    }
                    drawInnerLabels();
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
                        var left = coordinate.centerX + pieRadius * 0.5 * Math.cos(midAngle);
                        var top = coordinate.centerY + pieRadius * 0.5 * Math.sin(midAngle);
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
        var drawInnerLabels = function (_shape) {
            var ops = options.innerLabel;
            if (!(ops.show && typeof ops.content == 'function')) { return; }
            var distance = ops.distance || 0.6;
            var drawSingleLabel = function (shape) {
                var midAngle = (shape.angleMin + shape.angleMax) / 2;
                var data = shape.data;
                var length = shape.isClickout ? (pieRadius * distance + outlength) : pieRadius * distance;
                var left = coordinate.centerX + length * Math.cos(midAngle);
                var top = coordinate.centerY + length * Math.sin(midAngle);
                inner.DrawFigures.createText(ops.content(data), left, top, 'center', data.fontweight, data.fontsize || ops.fontsize || pieRadius / 10, ops.fontfamily, data.fontcolor || ops.color || DChart.Const.Defaults.InnerLabelColor);
            };
            if (_shape) { drawSingleLabel(_shape); }
            else {
                for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                    drawSingleLabel(shape);
                }
            }
        };
        var drawOuterLabels = function (_shape, _color) {
            var ops = options.outerLabel;
            if (!(ops.show && typeof ops.content == 'function')) { return; }
            if (resetOuterLabelPosition) {
                for (var i = 0, shape; shape = inner.shapes.outerLabels[i]; i++) { shape.resetposition(); }
                resetOuterLabelPosition = false;
            }
            var resetPosition = function () {
                var judgeOuterLabelCross = function (r1, r2) {
                    return Math.max(r1.left, r2.left) <= Math.min(r1.left + r1.width, r2.left + r2.width) && Math.max(r1.top, r2.top) <= Math.min(r1.top + r1.height, r2.top + r2.height);
                };
                var lefttop = []; var leftbuttom = []; var righttop = []; var rightbottom = [];
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
                inner.coordinates.pie.outerlabels.length = 0;
                for (var i = 0, shape; shape = inner.shapes.outerLabels[i]; i++) {
                    drawSingleLabel(shape);
                    inner.coordinates.pie.outerlabels[i] = { index: shape.contact.index, left: shape.left, top: shape.top, width: shape.width, height: shape.height };
                }
            }
        };
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            var cumulativeAngle = Math.PI * (options.startAngle == null ? -0.5 : options.startAngle);
            var scaleAnimation = options.animation && options.animateScale ? animationDecimal : 1;
            var rotateAnimation = options.animation && options.animateRotate ? animationDecimal : 1;
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                var percent = (item.value / segmentTotal) * 100;
                var segmentAngle = rotateAnimation * (percent / 100 * (Math.PI * 2));
                var color = item.color || colors[i % colors.length];
                var angleMax = cumulativeAngle + segmentAngle;
                if (percentAnimComplete >= 1) {
                    item.index = i;
                    item.percent = percent;
                    var _pieshape = new pieshape(i, cumulativeAngle, angleMax, item, item.extended == true);
                    inner.shapes.cemicircles.push(_pieshape);
                    drawPart(item.extended, scaleAnimation, cumulativeAngle, angleMax, color, item, _pieshape);
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
        var mouseEvents = function () {
            var fixShape = function (x, y) {
                var veryShape = null;
                for (var i = 0, shape; shape = inner.shapes.cemicircles[i]; i++) {
                    var midAngle = (shape.angleMin + shape.angleMax) / 2;
                    var offX = outlength * Math.cos(midAngle);
                    var offY = outlength * Math.sin(midAngle);
                    var centerX = coordinate.centerX + (shape.isClickout ? offX : 0);
                    var centerY = coordinate.centerY + (shape.isClickout ? offY : 0);
                    var currentAngle = DChart.Methods.GetCurrentAngle(x, y, centerX, centerY);
                    var withinPie = (Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(pieRadius, 2)) && DChart.Methods.JudgeBetweenAngle(shape.angleMin, shape.angleMax, currentAngle);
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
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
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
                    else {
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'auto'; }
                    }
                }
            };
        };
        inner._startDrawAndAnimation(drawSegments, mouseEvents);
    },
    _spreadSkin: function (skinID, newOps) {
        var skins = DChart.Const.Skins;
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
