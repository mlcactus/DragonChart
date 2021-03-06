﻿if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Bar = {
        TopLabelColor: null
    };
}
DChart.Bar = DChart.getCore().__extends({
    GraphType: 'Bar',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            animateY: true,
            animateX: true,
            bar: {
                colors: null,
                length: null,
                gap: null,
                useSameColor: true
            },
            topLabel: {
                show: true,
                content: function (data) {
                    if (this.valueType == 'd' || this.valueType == 't') { return ''; }
                    else if (this.valueType == 'p') { return data.percent.toFixed(1).toString() + '%'; }
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
        if (!options.animateY && !options.animateX) { options.animation = false; }
        inner.SetData(_data);
        inner._onStart();
        inner.tempData.invertAxis = true;
        inner.tempData.notAllowValueNegative = true;
        inner.shapes.bars = [];
        var axisData = inner._formatAxisData();
        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        var showshadow = options.shadow.show;
        var shadow = showshadow ? options.shadow : null;
        if (shadow) {
            if (shadow.blur && shadow.offsetX < shadow.blur) { shadow.offsetX = shadow.blur; }
        }
        var drawPart = function (left, top, width, height, color, data, _shadow) {
            inner.DrawFigures.createRectangleFill(left, top, width, height, color, _shadow || shadow);
            if (data && options.topLabel.show) {
                var ops = options.topLabel;
                var content = typeof ops.content == 'function' ? ops.content.call(options, data) : '';
                if (content) {
                    var size = ops.fontsize || DChart.Methods.CapValue(height, 18, 11);
                    var _left = left + width + size / 2;
                    var _top = top + height / 2 + size / 3;
                    inner.DrawFigures.createText(content, _left, _top, 'left', data.fontweight || ops.fontweight, data.fontsize || size, ops.fontfamily, data.fontcolor || ops.color);
                }
            }
        };
        var barShape = function (indexX, indexY, left, top, width, height, color, data) {
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
                    tmpshadow = DChart.Methods.DeepCopy(shadow);
                    tmpshadow.color = color;
                }
                drawPart(this.left, this.top, this.width, this.height, color || this.color, showshadow ? this.data : null, tmpshadow);
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
        var length = null;
        var gap = 0;
        var colors = (options.bar.colors && options.bar.colors.length > 0 ? options.bar.colors : null) || DChart.Const.Defaults.FillColors;
        inner.tempData.legendColors = colors;
        var percentType = axisData.vValueType == 'p';
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (axisData.multiple && !gap) {
                var _gap = options.bar.gap;
                if (_gap && _gap > 0) {
                    var maxGap = (axisSize.labelDistance - axisData.demanCount * 2) / (axisData.demanCount + 1);
                    gap = Math.min(_gap, maxGap);
                }
                else {
                    gap = axisSize.labelDistance / 20;
                }
            }
            if (!length) {
                var _length = options.bar.length;
                if (_length && _length > 0) {
                    var maxLen = axisData.multiple ? ((axisSize.labelDistance - (axisData.demanCount + 1) * gap) / axisData.demanCount) : axisSize.labelDistance * 0.8;
                    length = Math.min(_length, maxLen);
                }
                else {
                    length = (axisSize.labelDistance - (axisData.demanCount + 1) * gap) / (axisData.multiple ? (axisData.demanCount + 0.5) : 1.5);
                }
            }
            var getWidth = function (val) {
                var width = (options.animateX ? animationDecimal : 1) * (axisSize.maxX - axisSize.minX) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return width;
            };
            inner.coordinates.bars = [];
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                var height = (options.animateY ? animationDecimal : 1) * length;
                if (axisData.multiple) {
                    var color = item.color || colors[i % colors.length];
                    var values = percentType ? item.percent : item.value;
                    for (var k = 0; k < values.length; k++) {
                        var val = values[k];
                        var cut = axisData.demanCount / 2 - i;
                        var top = axisSize.startPos - axisSize.labelDistance * k - cut * length - (cut - 0.5) * gap;
                        var width = getWidth(val);
                        var left = axisSize.minX;
                        if (percentAnimComplete >= 1) {
                            var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: k, indexY: i, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                            if (percentType) {
                                data.percent = val;
                                data.value = item.value[k];
                            }
                            else { data.value = val; }
                            var shape = new barShape(k, i, left, top, width, height, color, data);
                            inner.shapes.bars.push(shape);
                            drawPart(left, top, width, height, color, data);
                            if (!inner.coordinates.bars[k]) { inner.coordinates.bars[k] = []; }
                            inner.coordinates.bars[k][i] = { left: left, top: top, width: width, height: height, color: color };
                        }
                        else {
                            drawPart(left, top, width, height, color);
                        }
                    }
                }
                else {
                    var top = axisSize.startPos - axisSize.labelDistance * i - length / 2;
                    var width = getWidth(percentType ? item.percent : item.value);
                    var left = axisSize.minX;
                    var color = item.color || (options.bar.useSameColor ? 'rgba(69,114,167,1)' : colors[i % colors.length]);
                    if (percentAnimComplete >= 1) {
                        item.indexX = i;
                        item.indexY = 1;
                        var shape = new barShape(i, 1, left, top, width, height, color, item);
                        inner.shapes.bars.push(shape);
                        drawPart(left, top, width, height, color, item);
                        inner.coordinates.bars[i] = { left: left, top: top, width: width, height: height, color: color };
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
                for (var i = 0, shape; shape = inner.shapes.bars[i]; i++) {
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
                    for (var i = 0, shape; shape = inner.shapes.bars[i]; i++) {
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
        if (skins[skinID] && skins[skinID].Bar) {
            var skin = skins[skinID].Bar;
            newOps.topLabel = {};
            newOps.topLabel.color = skin.TopLabelColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['animateY', 'b'], ['animateX', 'b']],
            bar: [['colors', 'ca'], ['length', 'n'], ['gap', 'n'], ['useSameColor', 'b']],
            topLabel: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});