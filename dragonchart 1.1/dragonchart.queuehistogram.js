if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.QueueHistogram = {
        LabelColor: null
    };
}
DChart.QueueHistogram = DChart.getCore().__extends({
    GraphType: 'QueueHistogram',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            animateY: true,
            animateX: true,
            splitpoint: null,
            contrastmode: true,
            histogram: {
                colors: null,
                length: null,
                gap: null
            },
            label: {
                show: true,
                content: function (data) {
                    if (this.valueType == 'd') { return data.value.format('MM-dd'); }
                    else if (this.valueType == 't') { return data.value.format('HH:mm'); }
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
        var wrongmsg = DChart.Const.Language[inner.Language];
        if (!options.animateY && !options.animateX) { options.animation = false; }
        inner.SetData(_data);
        if (!inner.innerData[0].value.length || inner.innerData[0].value.length <= 1) {
            throw new Error(wrongmsg.WrongData + wrongmsg.DataMustBeMultipleArray);
        }
        if (options.valueType == 'p') {
            throw new Error(wrongmsg.WrongParam + wrongmsg.ValueTypeMustNotBePercent);
        }
        inner._onStart();

        var splitpoint = options.splitpoint;
        var computeSplitPoint = splitpoint == null;
        inner.tempData.computeSplitPoint = computeSplitPoint;
        var axisData = inner._formatAxisData();
        if (!computeSplitPoint && (axisData.vValueType == 'd' || axisData.vValueType == 't') && !DChart.Methods.IsDate(splitpoint)) {
            splitpoint = DChart.Methods.ParseDate(splitpoint.toString());
        }
        if (computeSplitPoint) { splitpoint = axisData.splitpoint; }
        else { axisData.splitpoint = splitpoint; }
        if (inner.innerData.length > 1 && splitpoint >= axisData.vMaxval || splitpoint <= axisData.vMinval) { throw new Error(wrongmsg.WrongSet + wrongmsg.WrongSplitPoint); }

        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        inner.shapes.histograms = [];

        var showshadow = options.shadow.show;
        var getShadow = function (isSmall) {
            var resShadow = null;
            if (showshadow) {
                var shadowoffsetY = Math.max(Math.abs(options.shadow.blur), Math.abs(options.shadow.offsetY));
                resShadow = DChart.Methods.DeepCopy(options.shadow);
                resShadow.offsetY = isSmall ? shadowoffsetY : -shadowoffsetY;
            }
            return resShadow;
        };
        var drawPart = function (isSmall, left, top, width, height, color, data, _shadow) {
            inner.DrawFigures.createRectangleFill(left, top, width, height, color, _shadow || getShadow(isSmall));
            if (data && options.label.show) {
                var ops = options.label;
                var content = typeof ops.content == 'function' ? ops.content.call(options, data) : '';
                if (content) {
                    var centerX = left + width / 2;
                    var size = ops.fontsize || DChart.Methods.CapValue(width / 2, 18, 11);
                    var centerY = isSmall ? top + height + size : top - size / 3;
                    inner.DrawFigures.createText(content, centerX, centerY, 'center', data.fontweight || ops.fontweight, data.fontsize || size, ops.fontfamily, data.fontcolor || ops.color);
                }
            }
        };

        var barShape = function (isSmall, indexX, indexY, left, top, width, height, color, data) {
            this.isSmall = isSmall;
            this.indexX = indexX;
            this.indexY = indexY;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.data = data;
            this.isHovered = false;
            this.color = color;
            this.redraw = function (color) {
                var tmpshadow = getShadow(this.isSmall);
                if (tmpshadow && color) { tmpshadow.color = color; }
                drawPart(this.isSmall, this.left, this.top, this.width, this.height, color || this.color, showshadow ? this.data : null, tmpshadow);
            };
            this.click = function (e) {
                var click = typeof this.data.click == 'function' ? this.data.click : (options.click || null);
                if (click) {
                    click(this.data, e);
                }
            };
            if (options.tip.show && typeof options.tip.content == 'function') {
                this.tip = null;
                this.showTip = function () {
                    if (this.tip) {
                        this.tip.style.display = 'inline';
                    }
                    else {
                        var left = this.left + this.width / 2 + 5;
                        var top = this.top + this.height / 2;
                        this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                        var shape = this;
                        shape.tip.onclick = function (e) { shape.click(e); };
                    }
                };
                this.hideTip = function () {
                    if (this.tip) { this.tip.style.display = 'none'; }
                };
            }
        };
        var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || DChart.Const.Defaults.FillColors;
        inner.tempData.legendColors = colors;
        var contrastmode = options.contrastmode;
        var demanCount = contrastmode ? Math.ceil(axisData.demanCount / 2.0 - 0.1) : axisData.demanCount;
        var gap = 0;
        var length = null;
        var multiple = demanCount > 1;
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (multiple && !gap) {
                var _gap = options.histogram.gap;
                if (_gap && _gap > 0) {
                    var maxGap = (axisSize.labelDistance - demanCount * 2) / (demanCount + 1);
                    gap = Math.min(_gap, maxGap);
                }
                else {
                    gap = axisSize.labelDistance / 20;
                }
            }
            if (!length) {
                var _length = options.histogram.length;
                if (_length && _length > 0) {
                    var maxLen = multiple ? ((axisSize.labelDistance - (demanCount + 1) * gap) / demanCount) : axisSize.labelDistance * 0.8;
                    length = Math.min(_length, maxLen);
                }
                else {
                    length = (axisSize.labelDistance - (demanCount + 1) * gap) / (multiple ? (demanCount + 0.5) : 1.5);
                }
            }
            var getHeight = function (val) {
                var valDistance = Math.abs(inner._getFormatDiff(axisData.vValueType, splitpoint, val));
                var height = (options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * valDistance / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return height;
            };
            inner.coordinates.histograms = [];
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                var width = (options.animateX ? animationDecimal : 1) * length;
                var color = item.color || colors[i % colors.length];
                for (var k = 0; k < item.value.length; k++) {
                    var val = item.value[k];
                    var isSmall = val < splitpoint;
                    var cut = demanCount / 2 - (contrastmode ? parseInt(i / 2) : i);
                    var left = axisSize.startPos + axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
                    var height = getHeight(val);
                    var top = isSmall ? axisSize.splitLinePos : axisSize.splitLinePos - height;
                    if (percentAnimComplete >= 1) {
                        var data = { text: item.text, value: val, indexX: k, indexY: i, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight, click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave };
                        var shape = new barShape(isSmall, k, i, left, top, width, height, color, data);
                        inner.shapes.histograms.push(shape);
                        drawPart(isSmall, left, top, width, height, color, data);
                        if (!inner.coordinates.histograms[k]) { inner.coordinates.histograms[k] = []; }
                        inner.coordinates.histograms[k][i] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    else {
                        drawPart(isSmall, left, top, width, height, color);
                    }
                }
            }
        };
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
                if (inner.tempData.currentMouseShape != veryShape) {
                    var shape = inner.tempData.currentMouseShape;
                    if (shape) {
                        var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                        if (mouseleave) {
                            mouseleave(shape.data, e);
                        }
                    }
                    inner.tempData.currentMouseShape = veryShape;
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
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                        veryShape.redraw();
                        var mouseoverTransp = options.mouseoverTransparency;
                        veryShape.redraw('rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
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
        if (skins[skinID] && skins[skinID].QueueHistogram) {
            var skin = skins[skinID].QueueHistogram;
            newOps.label = {};
            newOps.label.color = skin.LabelColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['animateY', 'b'], ['animateX', 'b'], ['contrastmode', 'b']],
            histogram: [['colors', 'ca'], ['length', 'n'], ['gap', 'n']],
            label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});