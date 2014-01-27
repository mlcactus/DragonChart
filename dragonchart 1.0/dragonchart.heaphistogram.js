if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.HeapHistogram = {
        CutLinecolor: null,
        InnerLabelColor: null
    };
}
DChart.HeapHistogram = DChart.getCore().__extends({
    GraphType: 'HeapHistogram',
    SetDefaultOptions: function () {
        this._resetSharedOpions();
                this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
                        animateY: true,
                        animateX: true,
                        histogram: {
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
        inner.tempData.notAllowValueNegative = true;
        var axisData = inner._formatAxisData(true);
        var valids = inner._calculateOutersValid();
        var axisSize = inner._computeAxis(valids);
        var coordinate = inner._getDrawableCoordinate();
        inner.coordinates.draw = coordinate;
        inner.shapes.histograms = [];
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
        var histogramShape = function (indexX, indexY, left, top, width, height, color, data, linetop) {
            this.indexX = indexX;
            this.indexY = indexY;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.data = data;
                        this.linetop = linetop;
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
                        var left = this.left + this.width;
                        var top = this.top + this.height / 2;
                        this.tip = inner._createTip(options.tip.content.call(options, this.data), left, top);
                                                if (left + this.tip.clientWidth > axisSize.maxX) {
                            inner._changeTip(this.tip, left - this.tip.clientWidth - this.width);
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
                var colors = (options.histogram.colors && options.histogram.colors.length > 0 ? options.histogram.colors : null) || DChart.Const.Defaults.FillColors;
        var cutlinewidth = Math.floor(options.histogram.cutlinewidth || 0);
        var cutlinecolor = options.histogram.cutlinecolor || '#ffffff';
                var drawcutline = cutlinewidth > 0;
        inner.tempData.legendColors = colors;
                var percentType = axisData.vValueType == 'p';
        var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (!length) {
                var _length = options.histogram.length;
                if (_length && _length > 0) {
                    var maxLen = axisSize.labelDistance * 0.8;
                    length = Math.min(_length, maxLen);
                }
                else { length = axisSize.labelDistance * 0.6; }
            }
            var getHeight = function (val) {
                var height = (options.animateY ? animationDecimal : 1) * (axisSize.maxY - axisSize.minY) * inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, val) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
                return height;
            };
                        inner.coordinates.histograms = [];
                        var width = (options.animateX ? animationDecimal : 1) * length;
            for (var i = 0; i < axisData.tuftCount; i++) {
                var left = axisSize.startPos + axisSize.labelDistance * i - length / 2;
                var tmpheight = 0;
                var cutlines = [];
                var lastshapes = [];
                for (var k = 0; k < axisData.demanCount; k++) {
                    var item = inner.innerData[k];
                    var color = item.color || colors[k % colors.length];
                    var values = percentType ? item.percent : item.value;
                    var height = getHeight(values[i]);
                    tmpheight += height;
                    var top = axisSize.maxY - tmpheight;
                    if (top < axisSize.minY + 1) {
                        height -= axisSize.minY + 1 - top;
                        top = axisSize.minY + 1;
                    }
                    if (k < axisData.demanCount - 1) { top += cutlinewidth / 2; }
                    if (k == axisData.demanCount - 1 || k == 0) { height -= cutlinewidth / 2; }
                    else { height -= cutlinewidth; }
                    if (height + top > axisSize.maxY) {
                        height = axisSize.maxY - top;
                    }
                    var linetop = null;
                                        if (drawcutline && k < axisData.demanCount - 1) {
                        linetop = top - cutlinewidth / 2;
                        if (linetop + cutlinewidth / 2 + 1 > axisSize.maxY) { linetop = axisSize.maxY - cutlinewidth / 2 - 1 }
                        cutlines.push(linetop);
                    }
                    if (percentAnimComplete >= 1) {
                        var data = { click: item.click, mouseover: item.mouseover, mouseleave: item.mouseleave, text: item.text, indexX: i, indexY: k, fontsize: item.fontsize, fontcolor: item.fontcolor, fontweight: item.fontweight };
                        if (percentType) {
                            data.percent = values[i];
                            data.value = item.value[i];
                        }
                        else { data.value = values[i]; }
                        var shape = new histogramShape(k, i, left, top, width, height, color, data, linetop);
                        inner.shapes.histograms.push(shape);
                        lastshapes.push(shape);
                                                shape.redrawrect();
                        if (!inner.coordinates.histograms[i]) { inner.coordinates.histograms[i] = []; }
                        inner.coordinates.histograms[i][k] = { left: left, top: top, width: width, height: height, color: color };
                    }
                    else {
                        drawPart(left, top, width, height, color);
                    }
                }
                if (drawcutline) {
                    for (var j = 0; j < cutlines.length; j++) {
                        inner.DrawFigures.createLine(left, cutlines[j], left + width, cutlines[j], cutlinewidth, cutlinecolor);
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
            for (var i = 0, shape; shape = inner.shapes.histograms[i]; i++) {
                shape.redrawrect();
            }
            for (var i = 0, shape; shape = inner.shapes.histograms[i]; i++) {
                if (shape.linetop != null) {
                    inner.DrawFigures.createLine(shape.left, shape.linetop, shape.left + shape.width, shape.linetop, cutlinewidth, cutlinecolor);
                }
            }
            for (var i = 0, shape; shape = inner.shapes.histograms[i]; i++) {
                shape.redrawtext();
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
        if (skins[skinID] && skins[skinID].HeapHistogram) {
            var skin = skins[skinID].HeapHistogram;
            newOps.histogram = {}; newOps.label = {};
            newOps.histogram.cutlinecolor = skin.CutLinecolor || null;
            newOps.label.color = skin.InnerLabelColor || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['animateY', 'b'], ['animateX', 'b']],
            histogram: [['colors', 'ca'], ['length', 'n'], ['cutlinecolor', 'c'], ['cutlinewidth', 'n']],
            label: [['show', 'b'], ['content', 'f'], ['color', 'c'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's']]
        };
    }
});