if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.RangeHistogram = {
        SmallLabelColor: null,
        BigLabelColor: null
    };
}
DChart.RangeHistogram = DChart.getCore().__extends({
    GraphType: 'RangeHistogram',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            animateY: true,
            animateX: true,
            histogram: {
                colors: null,
                length: null,
                gap: null,
                useSameColor: true
            },
            tip: {
                content: function (data) {
                    var val = null;
                    if (this.valueType == 'd') { val = '<br/>Small Value: ' + data.value[0].format('yyyy-MM-dd') + '<br/>Big Value: ' + data.value[1].format('yyyy-MM-dd'); }
                    else if (this.valueType == 't') { val = '<br/>Small Value: ' + data.value[0].format('MM-dd hh:mm') + '<br/>Big Value: ' + data.value[1].format('MM-dd hh:mm'); }
                    else { val = '<br/>Small Value: ' + data.value[0] + '<br/>Big Value: ' + data.value[1]; }
                    return '<div>' + data.text + '：' + val + '&nbsp;</div>';
                }
            },
            smallLabel: {
                show: true,
                content: function (val) {
                    if (this.valueType == 'd') {
                        return val.format('yyyy-MM-dd');
                    }
                    else if (this.valueType == 't') {
                        return val.format('MM-dd hh:mm');
                    }
                    else { return val.toString(); }
                },
                color: null,
                fontweight: null,
                fontsize: null,
                fontfamily: null
            },
            bigLabel: {
                show: true,
                content: function (val) {
                    if (this.valueType == 'd') {
                        return val.format('yyyy-MM-dd');
                    }
                    else if (this.valueType == 't') {
                        return val.format('MM-dd hh:mm');
                    }
                    else { return val.toString(); }
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
        if (!options.animateY && !options.animateX) { options.animation = false; }
        inner.SetData(_data);
        var wrongmsg = DChart.Const.Language[inner.Language];
        if (options.valueType == 'p') {
            throw new Error(wrongmsg.WrongParam + wrongmsg.ValueTypeMustNotBePercent);
        }
        inner._onStart();
        inner.tempData.valueAxiaDataIsRange = true;
        inner.shapes.histograms = [];
        var axisData = inner._formatAxisData();
        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        var shadow = options.shadow.show ? options.shadow : null;
        var drawPart = function (left, top, width, height, color, data, _shadow) {
            inner.DrawFigures.createRectangleFill(left, top, width, height, color, _shadow || shadow);
            if (data) {
                var smallVal = data.value[0];
                var bigVal = data.value[1];
                if (smallVal > bigVal) { smallVal = data.value[1]; bigVal = data.value[0]; }
                var ops = options.smallLabel;
                if (ops.show) {
                    var minContent = typeof ops.content == 'function' ? ops.content.call(options, smallVal) : '';
                    if (minContent) {
                        var fontsize = data.smallfontsize || ops.fontsize || DChart.Methods.CapValue(height, 18, 11);
                        var fontweight = data.smallfontweight || ops.fontweight;
                        var fontcolor = data.smallfontcolor || ops.color;
                        var centerX = left + width / 2;
                        var centerY = top + height + fontsize * 1.15;
                        inner.DrawFigures.createText(minContent, centerX, centerY, 'center', fontweight, fontsize, ops.fontfamily, fontcolor);
                    }
                }
                ops = options.bigLabel;
                if (ops.show) {
                    var maxContent = typeof ops.content == 'function' ? ops.content.call(options, bigVal) : '';
                    if (maxContent) {
                        var fontsize = data.bigfontsize || ops.fontsize || DChart.Methods.CapValue(height, 18, 11);
                        var fontweight = data.bigfontweight || ops.fontweight;
                        var fontcolor = data.bigfontcolor || ops.color;
                        var centerX = left + width / 2;
                        var centerY = top - fontsize / 3;
                        inner.DrawFigures.createText(maxContent, centerX, centerY, 'center', fontweight, fontsize, ops.fontfamily, fontcolor);
                    }
                }
            }
        };
        var histogramShape = function (indexX, indexY, left, top, width, height, color, data) {
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
                var tmpshadow = shadow;
                if (shadow && shadow.show && color) {
                    var language = inner.Language;
                    tmpshadow = DChart.Methods.DeepCopy(shadow);
                    tmpshadow.color = color;
                }
                drawPart(this.left, this.top, this.width, this.height, color || this.color, options.shadow.show ? this.data : null, tmpshadow);
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
                        if (left + this.tip.clientWidth > axisSize.maxX) {
                            inner._changeTip(this.tip, left - this.tip.clientWidth);
                        }
                        var shape = this;
                        shape.tip.onclick = function (e) { shape.click(e); };
                    }
                };
                this.hideTip = function () {
                    if (this.tip) { this.tip.style.display = 'none'; }
                };
            }
        };
        var length = null;
        var gap = 0;
        var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || DChart.Const.Defaults.FillColors;
        inner.tempData.legendColors = colors;
        var percentType = axisData.vValueType == 'p';
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (axisData.multiple && !gap) {
                var _gap = options.histogram.gap;
                if (_gap && _gap > 0) {
                    var maxGap = (axisSize.labelDistance - axisData.demanCount * 2) / (axisData.demanCount + 1);
                    gap = Math.min(_gap, maxGap);
                }
                else {
                    gap = axisSize.labelDistance / 20;
                }
            }
            if (!length) {
                var _length = options.histogram.length;
                if (_length && _length > 0) {
                    var maxLen = axisData.multiple ? ((axisSize.labelDistance - (axisData.demanCount + 1) * gap) / axisData.demanCount) : axisSize.labelDistance * 0.8;
                    length = Math.min(_length, maxLen);
                }
                else {
                    length = (axisSize.labelDistance - (axisData.demanCount + 1) * gap) / (axisData.multiple ? (axisData.demanCount + 0.5) : 1.5);
                }
            }
            var getHeight = function (val) {
                var height = (options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return height;
            };
            var getDiffHeight = function (small, big, animation) {
                var height = (animation && options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * inner._getFormatDiff(axisData.vValueType, small, big) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return height;
            };
            inner.coordinates.histograms = [];
            for (var i = 0, item; item = inner.innerData[i]; i++) {
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
                        var height = getDiffHeight(val[0], val[1], true);
                        var top = axisSize.maxY - height - getDiffHeight(axisData.vMinValue, Math.min(val[0], val[1]));
                        if (percentAnimComplete >= 1) {
                            var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: k, indexY: i, bigfontcolor: item.bigfontcolor, bigfontsize: item.bigfontsize, bigfontweight: item.bigfontweight, smallfontcolor: item.smallfontcolor, smallfontsize: item.smallfontsize, smallfontweight: item.smallfontweight };
                            if (percentType) {
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
                    var val = percentType ? item.percent : item.value;
                    var left = axisSize.startPos + axisSize.labelDistance * i - length / 2;
                    var height = getDiffHeight(val[0], val[1], true);
                    var top = axisSize.maxY - height - getDiffHeight(axisData.vMinValue, Math.min(val[0], val[1]));
                    var color = item.color || (options.histogram.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                    if (percentAnimComplete >= 1) {
                        item.indexX = i;
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
                    if (options.shadow.show) {
                        inner._clearDrawable(coordinate);
                        inner._createScales(valids);
                    }
                    for (var i = 0, shape; shape = inner.shapes.histograms[i]; i++) {
                        if (shape != veryShape && (options.shadow.show || shape.isHovered)) {
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
        if (skins[skinID] && skins[skinID].RangeHistogram) {
            var skin = skins[skinID].RangeHistogram;
            newOps.smallLabel = {};
            newOps.smallLabel.color = skin.SmallLabelColor || null;
            newOps.bigLabel = {};
            newOps.bigLabel.color = skin.BigLabelColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['animateY', 'b'], ['animateX', 'b']],
            histogram: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
            smallLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']],
            bigLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});