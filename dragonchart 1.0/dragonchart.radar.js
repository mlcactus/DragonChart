if (!window.DChart) {
    throw new Error('未能加载dragonchart.core.js，该js必须在其他DChart框架的js加载之前被引用。\n' +
      'Not loaded dragonchart.core.js which must be loaded before other DChart\'s js.');
}
else {
    DChart.Const.Skins.BlackAndWhite.Radar = {
        ScaleLineColor: null,
        StaffFontColor: null,
        StaffBackColor: 'rgba(255,255,255,0.3)',
        RadarNodeLinecolors: ['#ffffff'],
        LabelsFontColors: '#666666'
    };
}
DChart.Radar = DChart.getCore().__extends({
        GraphType: 'Radar',
        SetDefaultOptions: function () {
        this._resetSharedOpions();
        this.innerOptions = DChart.Methods.Extend(this.originalDefaultOptions, {
            radius: null,
            margin: null,
            startDirection: null,
                        scale: {
                linewidth: 0.5,
                minvalue: null,
                maxvalue: null,
                interval: null
            },
            staff: {
                show: true,
                content: function (val) {
                    return val.toString();
                },
                fontcolor: null,
                fontfamily: null,
                fontsize: null,
                fontweight: null,
                backcolor: 'rgba(255,255,255,0.3)'
            },
            radar: {
                fillcolors: null,
                linecolors: null,
                nodefillcolors: null,
                nodelinecolors: ['#ffffff'],
                linewidth: null,
                nodetype: null,
                nodelinewidth: 1,
                nodelength: null
            },
                        labels: {
                labels: null,
                                fontcolors: null,
                fontweight: null,
                fontsize: null,
                fontfamily: null,
                                showtips: true
            },
            tip: {
                content: function (data) {
                    var val = data.value.toString();
                    return '<div>' + (data.text ? data.text + '<br/>' : '&nbsp;') + data.label + '：' + val + '&nbsp;</div>';
                }
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
        inner.SetData(_data);
        inner._onStart();
                var minval = null;
        var maxval = null;
                var multiple = inner.innerData[0].value.length != undefined;
                if (!multiple) { inner.tempData.legendInvalid = true; }
        var checkNumber = function (tmpVal) {
                        if (typeof tmpVal != 'number') {
                throw new Error(DChart.Const.Language[inner.Language].WrongData + '\'' + tmpVal + '\'' + DChart.Const.Language[inner.Language].NeedNumberData);
            }
            else if (tmpVal < 0) {
                throw new Error(DChart.Const.Language[inner.Language].WrongData + '\'' + tmpVal + '\'' + DChart.Const.Language[inner.Language].DataMustGreaterThanZero);
            }
            else {
                if (maxval == null) { minval = maxval = tmpVal; }
                else {
                    if (tmpVal > maxval) { maxval = tmpVal; }
                    else if (tmpVal < minval) { minval = tmpVal; }
                }
            }
        };
        for (var i = 0; i < inner.innerData.length; i++) {
            var item = inner.innerData[i];
            if (multiple) {
                for (var k = 0; k < item.value.length; k++) {
                    checkNumber(item.value[k]);
                }
            }
            else { checkNumber(item.value); }
        }
        var scaleData = inner._getComputed(0, 'n', options.scale, minval, maxval, 8);
        var coordinate = inner._getDrawableCoordinate();
        var margin = DChart.Methods.IsNumber(options.margin) && options.margin > 0 ? options.margin : 15;
        var maxRadius = Math.min((coordinate.maxX - coordinate.minX) / 3, (coordinate.maxY - coordinate.minY) / 2) - margin * 2;
        var radarRadius = options.radius && options.radius < maxRadius ? options.radius : maxRadius;
        inner.coordinates.draw = coordinate;
        inner.coordinates.radar = { radius: radarRadius, centerX: coordinate.centerX, centerY: coordinate.centerY };

        var fillcolors = (options.radar.fillcolors && options.radar.fillcolors.length > 0 ? options.radar.fillcolors : null) || DChart.Const.Defaults.TransparentColors;
        var linecolors = (options.radar.linecolors && options.radar.linecolors.length > 0 ? options.radar.linecolors : null) || DChart.Const.Defaults.FillColors;
        var nodefillcolors = (options.radar.nodefillcolors && options.radar.nodefillcolors.length > 0 ? options.radar.nodefillcolors : null) || linecolors;
        var nodelinecolors = (options.radar.nodelinecolors && options.radar.nodelinecolors.length > 0 ? options.radar.nodelinecolors : null) || nodefillcolors;
        inner.tempData.legendColors = linecolors;

        var labelfontcolors = options.labels.fontcolors && options.labels.fontcolors.length > 0 ? options.labels.fontcolors : null;

        var startDirection = options.startDirection || 'n';
        var startAngle = startDirection == 'e' ? 0 : (startDirection == 's' ? Math.PI / 2 : (startDirection == 'w' ? Math.PI : -Math.PI / 2));
        var dataLength = multiple ? inner.innerData[0].value.length : inner.innerData.length;
        var averageAngle = Math.PI * 2 / dataLength;

                var ctx = inner.ctx;
                var getPartPercent = function (val) {
            return (val - scaleData.minvalue) / (scaleData.maxvalue - scaleData.minvalue);
        };
                inner.shapes.nodes = [];
        inner.shapes.labels = [];
                var nodelength = options.radar.nodelength || DChart.Methods.CapValue((coordinate.maxX - coordinate.minX) / 150, 10, 6);

                var nodeShape = function (index, centerX, centerY, length, data) {
            this.index = index;
            this.centerX = centerX;
            this.centerY = centerY;
            this.isHovered = false;
            this.nodelength = length;
            this.data = data;
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
                        var centerX = this.centerX + nodelength + 5;
                        var centerY = this.centerY - nodelength - 10;
                        this.tip = inner._createTip(options.tip.content.call(options, this.data, false), centerX, centerY);
                                                if (this.centerX + this.tip.clientWidth > coordinate.maxX) {
                            inner._changeTip(this.tip, centerX - 5 - nodelength - this.tip.clientWidth);
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
        inner.coordinates.radar.nodes = [];
        inner.coordinates.radar.labels = [];
        inner.coordinates.radar.staff = [];
        var drawPart = function (scalePercent, percentAnimComplete, data, index) {
            var ops = options.radar;
            var fillcolor = (multiple ? data.color : null) || fillcolors[index % fillcolors.length];
            var linecolor = (multiple ? data.linecolor : null) || linecolors[index % linecolors.length];
            var linewidth = (multiple ? data.linewidth : null) || ops.linewidth || 1;
            var points = [];
            for (var i = 0; i < (multiple ? data.value.length : data.length) ; i++) {
                var _data = multiple ? data : data[i];
                var value = multiple ? data.value[i] : _data.value;
                var nodefillcolor = _data.nodefillcolor || nodefillcolors[index % nodefillcolors.length];
                var nodelinecolor = _data.nodelinecolor || nodelinecolors[index % nodelinecolors.length];
                var nodelinewidth = _data.nodelinewidth || ops.nodelinewidth || 0;
                var _nodelength = _data.nodelength || nodelength;
                var nodetype = _data.nodetype || ops.nodetype || 'c';
                var radius = scalePercent * radarRadius * getPartPercent(value);
                var _angle = startAngle + i * averageAngle;
                var centerX = coordinate.centerX + radius * Math.cos(_angle);
                var centerY = coordinate.centerY + radius * Math.sin(_angle);
                                points.push([centerX, centerY, nodefillcolor, nodelinecolor, nodelinewidth, _nodelength, nodetype]);
                if (percentAnimComplete >= 1) {
                    var _shapedata = { value: value, click: _data.click, mouseover: _data.mouseover, mouseleave: _data.mouseleave };
                    _shapedata.text = multiple ? data.text : '';
                    _shapedata.label = multiple ? (options.labels.labels ? options.labels.labels[i % options.labels.labels.length] : '') : _data.text;
                    var shape = new nodeShape(multiple ? index * data.value.length + i : i, centerX, centerY, _nodelength, _shapedata);
                    inner.shapes.nodes.push(shape);
                }
            }
            inner.DrawFigures.createCloseFigure(points, fillcolor, linewidth, linecolor);
            for (var i = 0, point; point = points[i]; i++) {
                inner.DrawFigures.createPointElement(point[6], point[0], point[1], point[5], point[2], true, point[3], point[4], true, true);
                if (percentAnimComplete >= 1) {
                                        var nodecoor = { centerX: point[0], centerY: point[1], length: point[5] };
                    if (multiple) {
                        if (!inner.coordinates.radar.nodes[index]) { inner.coordinates.radar.nodes[index] = []; }
                        inner.coordinates.radar.nodes[index][i] = nodecoor;
                    }
                    else { inner.coordinates.radar.nodes[i] = nodecoor; }
                }
            }
        };
        var drawScales = function (percentAnimComplete) {
            var opsScale = options.scale;
            var linewidth = opsScale.linewidth;
            if (!(opsScale.linewidth > 0)) { return; }
                        var opsLabels = options.labels;
            var labels = opsLabels.labels || [];
            if (!multiple) {
                for (var i = 0, item; item = inner.innerData[i]; i++) {
                    labels[i] = item.text || ' ';
                }
            }
            var labelfontsize = opsLabels.fontsize || radarRadius / 8;
            var linecolor = opsScale.linecolor || 'rgb(190,190,190)';
            var little = 0.1;
            var cut = 5;
            for (var k = 0; k < dataLength; k++) {
                var _startAngle = startAngle + k * averageAngle;
                var _endAngle = _startAngle + averageAngle;
                var startX = 0; var startY = 0;
                for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                    var radius = radarRadius * getPartPercent(val);
                    startX = coordinate.centerX + radius * Math.cos(_startAngle);
                    startY = coordinate.centerY + radius * Math.sin(_startAngle);
                    var endX = coordinate.centerX + radius * Math.cos(_endAngle);
                    var endY = coordinate.centerY + radius * Math.sin(_endAngle);
                    inner.DrawFigures.createLine(startX, startY, endX, endY, linewidth, linecolor);
                }
                inner.DrawFigures.createLine(coordinate.centerX, coordinate.centerY, startX, startY, linewidth, linecolor);
                                var floatRight = DChart.Methods.JudgeBetweenAngle(-Math.PI * 0.5, Math.PI * 0.5, _startAngle);
                var floatTop = DChart.Methods.JudgeBetweenAngle(-Math.PI, 0, _startAngle);
                                var inMiddle = DChart.Methods.JudgeBetweenAngle(-Math.PI / 2 - little, -Math.PI / 2 + little, _startAngle) || DChart.Methods.JudgeBetweenAngle(Math.PI / 2 - little, Math.PI / 2 + little, _startAngle);
                                var inCenter = DChart.Methods.JudgeBetweenAngle(Math.PI - little, Math.PI + little, _startAngle) || DChart.Methods.JudgeBetweenAngle(-little, little, _startAngle);
                var labelX = startX;
                var labelY = startY;
                if (!inMiddle) {
                    if (floatRight) {
                        labelX += cut + cut * Math.abs(Math.sin(_startAngle));
                    }
                    else {
                        labelX -= cut + cut * Math.abs(Math.sin(_startAngle));
                    }
                    if (inCenter) {
                        labelY += labelfontsize / 3;
                    }
                    else {
                        if (floatTop) {
                            labelY -= cut * Math.abs(Math.cos(_startAngle));
                        }
                        else {
                            labelY += labelfontsize / 2 + cut * Math.abs(Math.cos(_startAngle));
                        }
                    }
                }
                else {
                    if (floatTop) { labelY -= labelfontsize * 0.7; }
                    else { labelY += labelfontsize; }
                }
                var fontcolor = (labelfontcolors ? labelfontcolors[k % labelfontcolors.length] : null) || linecolor;
                var textLength = inner.DrawFigures.createText(labels[k], labelX, labelY, inMiddle ? 'center' : (floatRight ? 'left' : 'right'), opsLabels.fontweight, labelfontsize, opsLabels.fontfamily, fontcolor);
                if (percentAnimComplete >= 1) {
                    var labelshape = { index: k, centerX: (inMiddle ? labelX : (floatRight ? labelX + textLength / 2 : labelX - textLength / 2)), centerY: labelY - labelfontsize / 2, size: labelfontsize, length: textLength };
                    inner.shapes.labels.push(labelshape);
                    inner.coordinates.radar.labels.push({ index: k, text: labels[k], left: labelshape.centerX - textLength / 2, right: labelshape.centerX + textLength / 2, top: labelY - labelfontsize, bottom: labelY, size: labelfontsize, length: textLength });
                }
            }

                        var opsStaff = options.staff;
            var content = opsStaff.content;
            if (!opsStaff.show || typeof content != 'function') { return; }
            var fontsize = opsStaff.fontsize || radarRadius / scaleData.scalecount * 0.8;
            var backcolor = opsStaff.backcolor;
            var maxLength = 0;
            if (backcolor) {
                for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                    var tmpLen = inner.DrawFigures.measureText(content(val), opsStaff.fontweight, fontsize, opsStaff.fontfamily);
                    maxLength = Math.max(maxLength, tmpLen);
                }
            }
            var drawDirection = function (text, direc, distance) {
                var centerX = (direc == 'n' || direc == 's') ? coordinate.centerX : (direc == 'w' ? coordinate.centerX - distance : coordinate.centerX + distance);
                var bottom = (direc == 'w' || direc == 'e') ? coordinate.centerY + fontsize / 2.5 : (direc == 'n' ? coordinate.centerY - distance + fontsize / 2.5 : coordinate.centerY + distance + fontsize / 2.5);
                if (backcolor) {
                    inner.DrawFigures.createRectangleFill(centerX - maxLength / 2 - 1, bottom - fontsize + 1, maxLength + 2, fontsize + 2, backcolor);
                }
                var textLength = inner.DrawFigures.createText(text, centerX, bottom, 'center', opsStaff.fontweight, fontsize, opsStaff.fontfamily, fontcolor);
                if (percentAnimComplete >= 1) {
                    inner.coordinates.radar.staff.push({ text: text, left: centerX - textLength / 2, right: centerX + textLength / 2, top: bottom - fontsize, bottom: bottom, size: labelfontsize, length: textLength });
                }
            };
            for (var val = scaleData.minvalue + scaleData.interval; val <= scaleData.maxvalue; val += scaleData.interval) {
                var fontcolor = opsStaff.fontcolor || '#000000';
                var distance = radarRadius * getPartPercent(val);
                drawDirection(content(val), startDirection, distance);
            }
        };

                var drawSegments = function (animationDecimal, percentAnimComplete) {
            if (!options.scaleOverlay) { drawScales(percentAnimComplete); }
            if (multiple) {
                for (var i = 0, data; data = inner.innerData[i]; i++) {
                    drawPart(animationDecimal, percentAnimComplete, data, i);
                }
            }
            else {
                drawPart(animationDecimal, percentAnimComplete, inner.innerData, 0);
            }
            if (options.scaleOverlay) { drawScales(percentAnimComplete); }
        };
        var mouseEvents = function () {
            var fixSingleShape = function (x, y) {
                var veryShape = null;
                for (var i = inner.shapes.nodes.length - 1; i >= 0; i--) {
                    var shape = inner.shapes.nodes[i];
                    if (Math.sqrt(Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2)) <= shape.nodelength / 2) {
                        veryShape = shape; break;
                    }
                }
                return veryShape;
            };
            var fixSingleLabel = function (x, y) {
                var veryLabel = null;
                for (var i = inner.shapes.labels.length - 1; i >= 0; i--) {
                    var label = inner.shapes.labels[i];
                    if (Math.abs(x - label.centerX) < label.length / 2 && Math.abs(y - label.centerY) < label.size / 2) {
                        veryLabel = label; break;
                    }
                }
                return veryLabel;
            };
            inner.canvas.onclick = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                var veryShape = fixSingleShape(location.X, location.Y);
                if (veryShape) {
                    veryShape.click(e);
                }
            };
            inner.canvas.onmousemove = function (e) {
                var e = window.event || e;
                var location = inner._getMouseLoction(e);
                var veryShape = fixSingleShape(location.X, location.Y) || fixSingleLabel(location.X, location.Y);
                                if (inner.tempData.currentMouseShape != veryShape) {
                    var shape = inner.tempData.currentMouseShape;
                    if (shape && shape.data) {
                        var mouseleave = typeof shape.data.mouseleave == 'function' ? shape.data.mouseleave : (options.mouseleave || null);
                        if (mouseleave) {
                            mouseleave(shape.data, e);
                        }
                    }
                                        inner.tempData.currentMouseShape = veryShape;
                    for (var i = 0, shape; shape = inner.shapes.nodes[i]; i++) {
                                                if (shape != veryShape && shape.isHovered) {
                            shape.isHovered = false;
                            if (shape.hideTip) { shape.hideTip(); }
                        }
                    }
                    if (veryShape) {
                                                if (veryShape.data) {
                            if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                            veryShape.isHovered = true;
                            if (veryShape.showTip) { veryShape.showTip(); }
                            var mouseover = typeof veryShape.data.mouseover == 'function' ? veryShape.data.mouseover : (options.mouseover || null);
                            if (mouseover) {
                                                                mouseover(veryShape.data, e);
                            }
                        }
                        else {
                            if (options.labels.showtips) {
                                if (options.mouseoverChangeCursor) { inner.canvas.style.cursor = 'pointer'; }
                                var index = veryShape.index;
                                for (var i = inner.shapes.nodes.length - 1; i >= 0; i--) {
                                    var shape = inner.shapes.nodes[i];
                                    if (shape.index % dataLength == index && shape.showTip) {
                                        shape.isHovered = true;
                                        shape.showTip();
                                    }
                                }
                            }
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
        if (skins[skinID] && skins[skinID].Radar) {
            var skin = skins[skinID].Radar;
            newOps.scale = {}; newOps.staff = {}; newOps.radar = {}; newOps.labels = {};
            newOps.scale.linecolor = skin.ScaleLineColor || null;
            newOps.staff.fontcolor = skin.StaffFontColor || null;
            newOps.staff.backcolor = skin.StaffBackColor || null;
            newOps.radar.nodelinecolors = skin.RadarNodeLinecolors || null;
            newOps.labels.fontcolors = skin.LabelsFontColors || null;
        }
    },
    _getCheckOptions: function () {
        return {
            __top: [['radius', 'n'], ['margin', 'n'], ['startDirection', 's']],
            scale: [['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n']],
            staff: [['show', 'b'], ['content', 'f'], ['fontcolor', 'c'], ['fontfamily', 's'], ['fontsize', 'n'], ['fontweight', 's'], ['backcolor', 'c']],
            radar: [['fillcolors', 'ca'], ['linecolors', 'ca'], ['nodefillcolors', 'ca'], ['nodelinecolors', 'ca'], ['linewidth', 'n'], ['nodetype', 's'], ['nodelinewidth', 'n'], ['nodelength', 'n']],
            labels: [['labels', 'sa'], ['fontcolors', 'ca'], ['fontweight', 's'], ['fontsize', 'n'], ['fontfamily', 's'], ['showtips', 'b']]
        };
    }
});