if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.HeapBar = {
        CutLinecolor: null,
        InnerLabelColor: null
    };
}
DChart.HeapBar = DChart.getCore().__extends({
    GraphType: 'HeapBar',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            animateY: true,
            animateX: true,
            bar: {
                colors: null,
                length: null,
                cutlinecolor: null,
                cutlinewidth: null
            },
            label: {
                show: true,
                content: function (data) {
                    return this.valueType == 'p' ? data.percent.toFixed(1) + '%' : data.value.toString();
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
        if (options.valueType && options.valueType != 'n' && options.valueType != 'p') {
            throw new Error(wrongmsg.WrongParam + wrongmsg.ValueTypeMustBeNumberOrPercent);
        }
        if (!inner.innerData[0].value.length || inner.innerData[0].value.length <= 1) {
            throw new Error(wrongmsg.WrongData + wrongmsg.DataMustBeMultipleArray);
        }
        inner._onStart();
        inner.tempData.invertAxis = true;
        inner.tempData.notAllowValueNegative = true;
        var axisData = inner._formatAxisData(true);
        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        inner.shapes.bars = [];
        var ctx = inner.ctx;
        var drawPart = function (left, top, width, height, color, data, drawtextonly) {
            if (!drawtextonly) { inner.DrawFigures.createRectangleFill(left, top, width, height, color); }
            if (data && options.label.show) {
                var ops = options.label;
                var content = typeof ops.content == 'function' ? ops.content.call(options, data) : '';
                if (content) {
                    var centerX = left + width / 2;
                    var size = ops.fontsize || DChart.Methods.CapValue(width / 2, 18, 11);
                    var cneterY = top + height / 2 + size / 3;
                    var color = ops.color || '#ffffff';
                    inner.DrawFigures.createText(content, centerX, cneterY, 'center', data.fontweight || ops.fontweight, data.fontsize || size, ops.fontfamily, data.fontcolor || color);
                }
            }
        };
        var barShape = function (indexX, indexY, left, top, width, height, color, data, lineright) {
            this.indexX = indexX;
            this.indexY = indexY;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.data = data;
            this.lineright = lineright;
            this.isHovered = false;
            this.color = color;
            this.redrawrect = function (color) {
                drawPart(this.left, this.top, this.width, this.height, color || this.color);
            };
            this.redrawtext = function () {
                drawPart(this.left, this.top, this.width, this.height, color || this.color, this.data, true);
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
                        var left = this.left + this.width * 0.7 + 5;
                        var top = this.top + this.height / 2;
                        this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                        if (left + this.tip.clientWidth > axisSize.maxX) {
                            inner._changeTip(this.tip, left - this.tip.clientWidth - this.width * 0.5);
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
        var colors = (options.bar.colors && options.bar.colors.length > 0 ? options.bar.colors : null) || DChart.Const.Defaults.FillColors;
        var cutlinewidth = Math.floor(options.bar.cutlinewidth || 0);
        var cutlinecolor = options.bar.cutlinecolor || '#ffffff';
        var drawcutline = cutlinewidth > 0;
        inner.tempData.legendColors = colors;
        var percentType = axisData.vValueType == 'p';
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (!length) {
                var _length = options.bar.length;
                if (_length && _length > 0) {
                    var maxLen = axisSize.labelDistance * 0.8;
                    length = Math.min(_length, maxLen);
                }
                else { length = axisSize.labelDistance * 0.6; }
            }
            var getWidth = function (val) {
                var width = (options.animateX ? animationDecimal : 1) * (axisSize.maxX - axisSize.minX) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return width;
            };
            inner.coordinates.bars = [];

            var height = (options.animateY ? animationDecimal : 1) * length;
            for (var i = 0; i < axisData.tuftCount; i++) {
                var top = axisSize.startPos + axisSize.labelDistance * i - length / 2;
                var tmpwidth = 0;
                var cutlines = [];
                var lastshapes = [];
                for (var k = 0; k < axisData.demanCount; k++) {
                    var item = inner.innerData[k];
                    var color = item.color || colors[k % colors.length];
                    var values = percentType ? item.percent : item.value;
                    var left = axisSize.minX + tmpwidth;
                    var width = getWidth(values[i]);
                    tmpwidth += width;
                    if (left + width > axisSize.maxX - 1) {
                        width -= left + width - axisSize.maxX + 1;
                        left = axisSize.maxX - 1 - width;
                    }
                    if (k > 0) { left += cutlinewidth / 2; }
                    if (k == axisData.demanCount - 1 || k == 0) { width -= cutlinewidth / 2; }
                    else { width -= cutlinewidth; }
                    if (left < axisSize.minX) { left = axisSize.minX; }
                    var lineright = null;
                    if (drawcutline && k < axisData.demanCount - 1) {
                        lineright = left + width + cutlinewidth / 2;
                        if (lineright - cutlinewidth / 2 - 1 < axisSize.minX) { lineright = axisSize.minX + cutlinewidth / 2 + 1 }
                        cutlines.push(lineright);
                    }
                    if (percentAnimComplete >= 1) {
                        var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: i, indexY: k, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                        if (percentType) {
                            data.percent = values[i];
                            data.value = item.value[i];
                        }
                        else { data.value = values[i]; }
                        var shape = new barShape(k, i, left, top, width, height, color, data, lineright);
                        inner.shapes.bars.push(shape);
                        lastshapes.push(shape);
                        shape.redrawrect();
                        if (!inner.coordinates.bars[i]) { inner.coordinates.bars[i] = []; }
                        inner.coordinates.bars[i][k] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    else {
                        drawPart(left, top, width, height, color);
                    }
                }
                if (drawcutline) {
                    for (var j = 0; j < cutlines.length; j++) {
                        inner.DrawFigures.createLine(cutlines[j], top, cutlines[j], top + height, cutlinewidth, cutlinecolor);
                    }
                }
                if (percentAnimComplete >= 1) {
                    for (var j = 0, shape; shape = lastshapes[j]; j++) {
                        shape.redrawtext();
                    }
                }
            }
        };
        var redrawSegments = function () {
            inner._clearDrawable(coordinate);
            inner._createScales(valids);
            for (var i = 0, shape; shape = inner.shapes.bars[i]; i++) {
                shape.redrawrect();
            }
            for (var i = 0, shape; shape = inner.shapes.bars[i]; i++) {
                if (shape.lineright != null) {
                    inner.DrawFigures.createLine(shape.lineright, shape.top, shape.lineright, shape.top + shape.height, cutlinewidth, cutlinecolor);
                }
            }
            for (var i = 0, shape; shape = inner.shapes.bars[i]; i++) {
                shape.redrawtext();
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
                        shape.isHovered = false;
                        if (shape.hideTip) { shape.hideTip(); }
                        var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                        if (mouseleave) {
                            mouseleave(shape.data, e);
                        }
                    }
                    redrawSegments();
                    inner.tempData.currentMouseShape = veryShape;
                    if (veryShape) {
                        veryShape.isHovered = true;
                        if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                        var mouseoverTransp = options.mouseoverTransparency;
                        veryShape.redrawrect('rgba(255,255,255,' + (mouseoverTransp > 0 && mouseoverTransp < 1 ? mouseoverTransp : 0.2) + ')');
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
        if (skins[skinID] && skins[skinID].HeapBar) {
            var skin = skins[skinID].HeapBar;
            newOps.bar = {}; newOps.label = {};
            newOps.bar.cutlinecolor = skin.CutLinecolor || null;
            newOps.label.color = skin.InnerLabelColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['animateY', 'b'], ['animateX', 'b']],
            bar: [['colors', 'ca'], ['length', 'n'], ['cutlinecolor', 'c'], ['cutlinewidth', 'n']],
            label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});