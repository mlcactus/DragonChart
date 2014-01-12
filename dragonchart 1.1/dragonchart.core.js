Function.prototype.__extends = function (objs) {
    for (var obj in objs) {
        this.prototype[obj] = objs[obj];
    }
    return this;
};
Date.prototype.format = function (fmt) {
    var o =
    {
        "M+": this.getMonth() + 1, "d+": this.getDate(), "h+": this.getHours(), "m+": this.getMinutes(), "s+": this.getSeconds(), "q+": Math.floor((this.getMonth() + 3) / 3), "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
Date.prototype.addMinutes = function (value) {
    var minute = this.getMinutes();
    this.setMinutes(minute + value);
    return this;
};
Date.prototype.addDays = function (value) {
    var date = this.getDate();
    this.setDate(date + value);
    return this;
};
Date.prototype.shortOf = function (interval, endTime) {
    switch (interval) {
        case "s":
            return parseInt((endTime - this) / 1000);
        case "n":
            return parseInt((endTime - this) / 60000);
        case "h":
            return parseInt((endTime - this) / 3600000);
        case "d":
            return parseInt((endTime - this) / 86400000);
        case "w":
            return parseInt((endTime - this) / (86400000 * 7));
        case "m":
            return (endTime.getMonth() + 1) + ((endTime.getFullYear() - this.getFullYear()) * 12) - (this.getMonth() + 1);
        case "y":
            return endTime.getFullYear() - this.getFullYear();
        default:
            return undefined;
    }
};
Array.prototype.__copy = function () {
    var newArray = [];
    for (var i = 0; i < this.length; i++) {
        newArray.push(this[i]);
    }
    return newArray;
};
Array.prototype.__multiply = function (param) {
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i] * param;
    }
};
Array.prototype.__contains = function (val) {
    var contain = false;
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) { contain = true; break; }
    }
    return contain;
};
Array.prototype.__only = function (val) {
    var judge = true;
    for (var i = 0; i < this.length; i++) {
        if (this[i] !== val) { judge = false; break; }
    }
    return judge;
};


window.DChart = {};
DChart.Methods = {
    JudgeNormalObject: function (obj) {
        return obj && typeof obj == 'object' && !DChart.Methods.IsArray(obj);
    },
    DeepCopy: function (oldops) {
        var result = {};
        var deepDig = function (res, obj, path) {
            backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                if (DChart.Methods.JudgeNormalObject(obj[attrname]) && !DChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
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
    },
    Override: function (defaults, overrides) {
        var result = DChart.Methods.DeepCopy(defaults);
        var deepDig = function (res, obj, path) {
            var backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                if (res[attrname] !== undefined && obj.hasOwnProperty(attrname)) {
                    if (DChart.Methods.JudgeNormalObject(obj[attrname]) && DChart.Methods.JudgeNormalObject(res[attrname]) && !DChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                        deepDig(res[attrname], obj[attrname], path);
                    }
                    else {
                        res[attrname] = obj[attrname];
                    }
                }
                path = backupPath;
            }
        };
        deepDig(result, overrides, '');
        return result;
    },
    Extend: function (defaults, extendes) {
        var result = DChart.Methods.DeepCopy(defaults);
        var deepDig = function (res, obj, path) {
            var backupPath = path;
            for (var attrname in obj) {
                if (obj.hasOwnProperty(attrname)) {
                    if (DChart.Methods.JudgeNormalObject(obj[attrname]) && !DChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                        if (!DChart.Methods.JudgeNormalObject(res[attrname])) {
                            res[attrname] = {};
                        }
                        deepDig(res[attrname], obj[attrname]);
                    }
                    else {
                        res[attrname] = obj[attrname];
                    }
                }
                path = backupPath;
            }
        };
        deepDig(result, extendes, '');
        return result;
    },
    CapValue: function (valueToCap, maxValue, minValue) {
        if (DChart.Methods.IsNumber(maxValue) && valueToCap > maxValue) { return maxValue; }
        if (DChart.Methods.IsNumber(minValue) && valueToCap < minValue) { return minValue; }
        return valueToCap;
    },
    GetRandomString: function () {
        return Math.random().toString().substring(2);
    },
    GetCurrentAngle: function (x, y, locX, locY) {
        var angle = Math.asin((y - locY) / Math.sqrt(Math.pow(x - locX, 2) + Math.pow(y - locY, 2)));
        if (angle != 0) {
            if (x < locX && y > locY) {
                angle = Math.PI - angle;
            }
            else if (x < locX && y < locY) {
                angle = -Math.PI - angle;
            }
        }
        else {
            if (x < locX) { angle = Math.PI; }
        }
        return angle;
    },
    JudgeBetweenAngle: function (min, max, target) {
        var right = false;
        var pi = Math.PI;
        while (target <= max) {
            if (target >= min) { right = true; break; }
            target += pi * 2;
        }
        if (!right) {
            while (target >= min) {
                if (target <= max) { right = true; break; }
                target -= pi * 2;
            }
        }
        return right;
    },
    CopyInnerValue: function (valueType, value) {
        if (valueType == 'd' || valueType == 't') {
            return new Date(value.getTime());
        }
        return value;
    },
    AddInnerValue: function (valueType, value, add) {
        if (valueType == 'd') {
            value = value.addDays(add);
        }
        else if (valueType == 't') {
            value = value.addMinutes(add);
        }
        else {
            value += add;
        }
        return value;
    },
    FormatLinePosition: function (width, x, y) {
        var width = Math.ceil(width);
        var format = function (val) {
            var i = Math.floor(val);
            if (width % 2 == 0) { return val - i > 0.5 ? i + 1 : i; }
            else { return i + 0.5; }
        };
        if (arguments.length == 3) { return { x: format(x), y: format(y) } }
        else { return format(x); }
    },
    ObjectHaveSameValues: function (obj1, obj2, fields) {
        var same = true;
        for (var i = 0, field; field = fields[i]; i++) {
            if (obj1[field] !== obj2[field]) { same = false; break; }
        }
        return same;
    },
    IsArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    IsNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    IsColor: function (color) {
        return DChart.Const.RegExps.HexColor.test(color) || DChart.Const.RegExps.RGBColor.test(color) || DChart.Const.RegExps.RGBAColor.test(color);
    },
    ParseDate: function (str) {
        return new Date(Date.parse(str.replace(/-/g, "/")));
    },
    IsDate: function (obj) {
        return (typeof obj == 'object') && obj.constructor == Date;
    },
    FormatNumber: function (num) {
        if (typeof num != 'number') { return num; }
        var res = num;
        for (var i = 0; i < 8; i++) {
            var tmp = parseFloat(num.toFixed(i));
            if (Math.abs(tmp - num) < 0.00001) { res = tmp; break; }
        }
        return res;
    }
};

DChart.Const = {
    Language: {
        CN: {
            WrongParam: '参数错误！',
            WrongData: '数据错误！',
            WrongSet: '设置错误！',
            NeedDiv: '需传入一个div节点元素或其id。',
            DataMustBeArray: '数据不能为空且必须为数组格式。',
            FirstValueShouldBeString: '数据第一个项必须为字符串以表示text',
            ValueMustNotBeUndefined: '数据的值不能为空',
            HexColorMalformed: '十六进制的颜色表达形式格式错误。',
            RGBColorMalformed: 'rgb的颜色表达形式格式错误。',
            RGBAChangeTransparencyWrongParam: 'RGBA表达式格式错误，或透明度值错误，必须>=0且<=1。',
            NeedDateData: '数据必须是日期格式。',
            NeedNumberData: '数据必须是数字格式。',
            OuterRadiusShouldBigger: '环状图外部半径应大于内部半径',
            AxisMaxLessThanMin: '坐标设定的最大值应该大于最小值。',
            AxisMaxLessThanActual: '坐标设定的最大值应该大于实际数据的最大值。',
            AxisMinMoreThanActual: '坐标设定的最小值应该小于实际数据的最小值。',
            LabelAxisValueTypeCannotBePercent: '文本轴的数据类型不能为百分数。',
            LabelDistanceExceedMax: '文本开始间距与结束间距不能为负数且之和不能超出最大值。',
            ValueTypeMustBeNumberOrPercent: '值轴的数据类型必须为n或p。',
            ValueTypeMustNotBePercent: '值轴的数据类型不能为p。',
            AxisVauleShouldBeDArray: '数据必须为二维数组（第一个元素为文本轴值，第二个元素为值轴值）。',
            DataMustGreaterThanZero: '数据必须为不小于零的数字。',
            SubItemsValueShouldEqualSuperValue: '子节点值的总和应该等于上级母节点的值。',
            DataMustBeMultipleArray: '数据必须为多维数组。',
            SumOfLengthsMustBeLessThanRadius: '环状图的宽度之和应小于半径',
            OptionShouldNotBeUndefined: '选项值不能为undefined',
            OptionShouldBeString: '选项值必须为字符串格式。',
            OptionShouldBeBoolean: '选项值必须为布尔格式。',
            OptionShouldBeNumber: '选项值必须为数字格式。',
            OptionShouldBeColorStr: '选项值必须为颜色格式的字符串。',
            OptionShouldBeFunction: '选项值必须为一个function。',
            OptionShouldBeColorArray: '选项值必须为由颜色字符串组成的数组。',
            OptionShouldBeStringArray: '选项值必须为由字符串组成的数组。',
            OptionShouldBeNumberArray: '选项值必须为由数字组成的数组。',
            WrongLegendSet: '错误的图例位置设置，不允许X和Y方向上都居中或者当type为\"row\"时Y方向居中。',
            WrongSplitPoint: '错误的临界值设定，该值必须大于实际最小值并小于实际最大值。'
        },
        EN: {
            WrongParam: 'Wrong parameter!',
            WrongData: 'Wrong data!',
            WrongSet: 'Wrong set！',
            NeedDiv: 'A div DOM element or its id is needed.',
            DataMustBeArray: 'data must not be empty and be an array.',
            FirstValueShouldBeString: 'To indicate text property that the first item of data must be a string.',
            ValueMustNotBeUndefined: 'The value of data must not be null or undefined.',
            HexColorMalformed: 'Hex color expression is wrong.',
            RGBColorMalformed: 'Rgb color expression is wrong.',
            RGBAChangeTransparencyWrongParam: 'RGBA expression is wrong，or transparency number is unqualified, it must be >=0 and <=1.',
            NeedDateData: 'Data must be a date format.',
            NeedNumberData: 'Data must be a number format.',
            OuterRadiusShouldBigger: 'Ring graphic outer radius should be larger than the internal radius',
            AxisMaxLessThanMin: 'The maximum value set of axis should be greater than the minimum value.',
            AxisMaxLessThanActual: 'The maximum value set of axis should be greater than the actual maximum value.',
            AxisMinMoreThanActual: 'The minimum value set of axis should be less than the actual minimum value.',
            LabelAxisValueTypeCannotBePercent: 'The valueType of text-axis cannot be percent.',
            LabelDistanceExceedMax: 'label distance should not be negative and the sum of label distance should be less than the max length.',
            ValueTypeMustBeNumberOrPercent: 'The valueType of value-axis must be n or p.',
            ValueTypeMustNotBePercent: 'The valueType of value-axis cannot be percent.',
            AxisVauleShouldBeDArray: 'Data must be double-array（first value for label axis，second for value axis）',
            DataMustGreaterThanZero: 'Data must not be less than zero.',
            SubItemsValueShouldEqualSuperValue: 'The sum of value of subitems should equal the value of mother node.',
            DataMustBeMultipleArray: 'Data must be multiple array.',
            SumOfLengthsMustBeLessThanRadius: 'The sum of lengths in multiring picture must be less than the radius set',
            OptionShouldNotBeUndefined: 'Option value should not be undefined.',
            OptionShouldBeString: 'Option value should be a string.',
            OptionShouldBeBoolean: 'Option value should be a boolean.',
            OptionShouldBeNumber: 'Option value should be a number.',
            OptionShouldBeColorStr: 'Option value should be a string array.',
            OptionShouldBeFunction: 'Option value should be a function.',
            OptionShouldBeColorArray: 'Option value should be a color array.',
            OptionShouldBeStringArray: 'Option value should be a string array.',
            OptionShouldBeNumberArray: 'Option value should be a number array.',
            WrongLegendSet: 'Wrong legend position sets, direction X and direction Y cannot be center(middle) at the same time, and when type is \"row\" direction Y cannot be middle.',
            WrongSplitPoint: 'Wrong split point, the value should be less than min data value and more than max data value.'
        }
    },
    CustomCss: {
        tip_blue: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(13, 142, 207); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(13, 142, 207); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_red: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(176, 23,  31); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(176, 23,  31); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_dark: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(79 , 79, 79  ); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(79 , 79, 79  ); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_purple: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(138,43,226); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(138,43,226); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_yellow: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(255,128,0); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(255,128,0); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_bisque: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid #BEBEBE; border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(190,190,190);; opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}'
    },
    AnimationAlgorithms: {
        linear: function (t) {
            return t;
        },
        easeInQuad: function (t) {
            return t * t;
        },
        easeOutQuad: function (t) {
            return -1 * t * (t - 2);
        },
        easeInOutQuad: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
            return -1 / 2 * ((--t) * (t - 2) - 1);
        },
        easeInCubic: function (t) {
            return t * t * t;
        },
        easeOutCubic: function (t) {
            return 1 * ((t = t / 1 - 1) * t * t + 1);
        },
        easeInOutCubic: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t + 2);
        },
        easeInQuart: function (t) {
            return t * t * t * t;
        },
        easeOutQuart: function (t) {
            return -1 * ((t = t / 1 - 1) * t * t * t - 1);
        },
        easeInOutQuart: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
            return -1 / 2 * ((t -= 2) * t * t * t - 2);
        },
        easeInQuint: function (t) {
            return 1 * (t /= 1) * t * t * t * t;
        },
        easeOutQuint: function (t) {
            return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
        },
        easeInOutQuint: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
        },
        easeInSine: function (t) {
            return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
        },
        easeOutSine: function (t) {
            return 1 * Math.sin(t / 1 * (Math.PI / 2));
        },
        easeInOutSine: function (t) {
            return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
        },
        easeInExpo: function (t) {
            return (t == 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
        },
        easeOutExpo: function (t) {
            return (t == 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
        },
        easeInOutExpo: function (t) {
            if (t == 0) return 0;
            if (t == 1) return 1;
            if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
            return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
        },
        easeInCirc: function (t) {
            if (t >= 1) return t;
            return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
        },
        easeOutCirc: function (t) {
            return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
        },
        easeInOutCirc: function (t) {
            if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
            return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        easeInElastic: function (t) {
            var s = 1.70158; var p = 0; var a = 1;
            if (t == 0) return 0; if ((t /= 1) == 1) return 1; if (!p) p = 1 * .3;
            if (a < Math.abs(1)) { a = 1; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
        },
        easeOutElastic: function (t) {
            var s = 1.70158; var p = 0; var a = 1;
            if (t == 0) return 0; if ((t /= 1) == 1) return 1; if (!p) p = 1 * .3;
            if (a < Math.abs(1)) { a = 1; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
        },
        easeInOutElastic: function (t) {
            var s = 1.70158; var p = 0; var a = 1;
            if (t == 0) return 0; if ((t /= 1 / 2) == 2) return 1; if (!p) p = 1 * (.3 * 1.5);
            if (a < Math.abs(1)) { a = 1; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * .5 + 1;
        },
        easeInBack: function (t) {
            var s = 1.70158;
            return 1 * (t /= 1) * t * ((s + 1) * t - s);
        },
        easeOutBack: function (t) {
            var s = 1.70158;
            return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
        },
        easeInOutBack: function (t) {
            var s = 1.70158;
            if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
            return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
        },
        easeInBounce: function (t) {
            return 1 - DChart.Const.AnimationAlgorithms.easeOutBounce(1 - t);
        },
        easeOutBounce: function (t) {
            if ((t /= 1) < (1 / 2.75)) {
                return 1 * (7.5625 * t * t);
            } else if (t < (2 / 2.75)) {
                return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
            } else if (t < (2.5 / 2.75)) {
                return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375);
            } else {
                return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375);
            }
        },
        easeInOutBounce: function (t) {
            if (t < 1 / 2) return DChart.Const.AnimationAlgorithms.easeInBounce(t * 2) * .5;
            return DChart.Const.AnimationAlgorithms.easeOutBounce(t * 2 - 1) * .5 + 1 * .5;
        }
    },
    RegExps: {
        BlankCharacter: /\s/g,
        HexColor: /^#[a-fA-F0-9]{5}[a-fA-F0-9]$/,
        RGBColor: /^(rgb)\([0-9]{0,3},[0-9]{0,3},[0-9]{0,3}\)/,
        RGBAColor: /^(rgba)\([0-9]{0,3},[0-9]{0,3},[0-9]{0,3},(0.)?[0-9]+\)/,
        ReturnFunction: /function *\(.*\) *\{.*return.*\}$/,
        NormalFunction: /function *\(.*\) *\{.*\}$/
    },
    Defaults: {
        FillColors: [
    '#3F5C71',
    '#2F4F4F',
    '#0d233a',
    '#910000',
    '#2A962A',
    '#778088',
    '#4F7DE7',
    '#b5bcc5',
    '#1aadce',
    '#484848',
    '#3883bd',
    '#a5aaaa',
    '#782A56',
    '#B97944',
    '#7A3C9C',
    '#a6bfd2',
    '#008B8B',
    '#7d7f97',
    '#4F4F4F',
    '#9F2626'
        ],
        TransparentColors: [
    'rgba(72,72,72,0.5)',
    'rgba(56,131,189,0.5)',
    'rgba(13,35,58,0.5)',
    'rgba(42,150,42,0.5)',
    'rgba(119,128,136,0.5)',
    'rgba(79,125,231,0.5)',
    'rgba(26,173,206,0.5)',
    'rgba(165,170,170,0.5)',
    'rgba(145,0,0,0.5)',
    'rgba(120,42,86,0.5)',
    'rgba(47,79,79,0.5)',
    'rgba(185,121,68,0.5)',
    'rgba(122,60,156,0.5)',
    'rgba(166,191,210,0.5)',
    'rgba(0,139,139,0.5)',
    'rgba(63,92,113,0.5)',
    'rgba(159,38,38,0.5)',
    'rgba(125,127,151,0.5)',
    'rgba(181,188,197,0.5)',
    'rgba(79,79,79,0.5)'
        ],
        Language: 'CN',
        SavedPicName: 'exportCanvas_' + (new Date()).getTime(),
        LineColor: '#BEBEBE',
        FontColor: '#000000',
        FontSize: 13,
        FontFamily: 'Arial',
        LineWidth: 1,
        LegendType: 's',
        TipType: 'tip_blue',
        InnerLabelColor: '#ffffff',
        OuterLabelColor: '#000000',
        ValueType: 'n',
        ScaleLineColor: '#BEBEBE',
        AxisLineColor: '#000000',
        FooterFontColor: '#8B8386',
        AlignLineColor: '#21251e',
        FooterBottomDistance: 0.01,
        FooterRightDistance: 0.03,
        LengthReferCutForPies: 60,
        LengthReferCutForAxis: 90,
        OffXCutForPies: 20,
        OffXCutForAxis: 70,
        AxisXDrawableCut: 6,
        AxisYDrawableCut: { n: 9, p: 9, d: 7, t: 7 },
        AxisYTitleLocation: { n: 0.7, p: 0.7, d: 0.75, t: 0.75 },
        AxisXTitleLocation: { n: 0.8, p: 0.8, d: 0.8, t: 0.8 }
    },
    Exceps: ['background.fillstyle'],
    DrawAxis: ['Bar', 'HeapBar', 'RangeBar', 'Histogram', 'HeapHistogram', 'RangeHistogram', 'Line', 'Points', 'Area', 'RangeArea', 'QueueBar', 'QueueHistogram'],
    AxisFromFirstLeft: ['Line', 'Area', 'Points', 'RangeArea'],
    DrawSplitLine: ['QueueBar', 'QueueHistogram'],
    Skins: {
        BlackAndWhite: {
            BackGround: {
                BorderWidth: 1,
                BorderColor: null,
                BackColor: '#ffffff',
                LinearGradient: null,
                RadialGradient: null
            },
            TipType: null,
            FontColor: null,
            LineColor: null,
            FontFamily: null,
            TitleColor: null,
            SubTitleColor: null,
            LegendFontColor: null,
            LegendBorderColor: null,
            ScaleLineColor: null,
            ScaleBackColors: ['rgba(150,150,150,0.3)', 'rgba(210,210,210,0.3)'],
            LabelAxisLineColor: null,
            LabelAxisFontColor: null,
            ValueAxisLineColor: null,
            ValueAxisFontColor: null,
            SplitLineColor: null,
            CrossLineColor: null,
            CloseLineColor: null,
            CaptionFontColor: null,
            XAxisTitleFontColor: null,
            YAxisTitleFontColor: null,
            FooterFontColor: 'rgba(110,110,110,0.8)',
            ShadowColor: '#000000'
        }
    },
    Interval: {
        n: [1, 2, 3, 4, 5, 8, 10, 20, 30, 40, 50, 80, 100, 200, 300, 500, 800, 1000],
        p: [1, 2, 3, 4, 5, 8, 10, 20, 25, 50],
        d: [1, 2, 3, 5, 7, 10, 14, 20, 21, 30, 60, 90, 365],
        t: [1, 2, 5, 10, 20, 30, 60, 120, 180, 240, 300, 480, 720, 1440]
    }
};
DChart.getCore = function () {
    var core = function (_targetdiv, _language) {
        var inner = this;
        inner.Language = DChart.Const.Language[_language] != undefined ? _language : 'CN';
        inner.onStart = null;
        inner.onBeforeAnimation = null;
        inner.onAnimation = null;
        inner.onFinish = null;
        var targetdiv = null;
        var wrongParam = false;
        if (_targetdiv) {
            if (typeof _targetdiv == 'string' && _targetdiv.constructor == String) {
                var tempTargetdiv = document.getElementById(_targetdiv);
                if (tempTargetdiv != null && tempTargetdiv.nodeName.toLowerCase() == 'div') {
                    targetdiv = tempTargetdiv;
                }
                else { wrongParam = true; }
            }
            else if (typeof _targetdiv == 'object' && _targetdiv.nodeName != undefined && _targetdiv.nodeName.toLowerCase() == 'div') {
                targetdiv = _targetdiv;
            }
            else {
                wrongParam = true;
            }
        }
        else { wrongParam = true; }
        if (wrongParam) {
            throw new Error(DChart.Const.Language[inner.Language].WrongParam + DChart.Const.Language[inner.Language].NeedDiv);
        }
        else {
            if (targetdiv.clientWidth == 0) {
                targetdiv.style.width = "800px";
            }
            if (targetdiv.clientHeight == 0) {
                targetdiv.style.height = (targetdiv.clientWidth / 2).toString() + "px";
            }
            targetdiv.style.padding = '';
        }
        var getPosNum = function (num) {
            if (num != null) { return num < 0 ? 0 : num; }
            else { return null; }
        };
        var _basicOptions = {
            Off: 0,
            OffLeft: null,
            OffRight: null,
            OffTop: null,
            OffBottom: null,
            Width: null,
            Height: null
        };
        inner._computeBasic = function (_ops) {
            var ops = _ops || _basicOptions;
            var Off = getPosNum(ops.Off);
            var offleft = getPosNum(ops.OffLeft) || Off || 0;
            var offright = getPosNum(ops.offright) || Off || 0;
            var offtop = getPosNum(ops.offtop) || Off || 0;
            var offbottom = getPosNum(ops.offbottom) || Off || 0;
            var defaultWidth = getPosNum(targetdiv.clientWidth - offleft - offright);
            var defaultHeight = getPosNum(targetdiv.clientHeight - offtop - offbottom);
            var width = DChart.Methods.CapValue(ops.Width || defaultWidth, targetdiv.clientWidth, 0);
            var height = DChart.Methods.CapValue(ops.Height || defaultHeight, targetdiv.clientHeight, 0);
            var result = { offleft: offleft, offright: offright, offtop: offtop, offbottom: offbottom, width: width, height: height };
            if (!_ops) { inner.calculatedBasic = result; }
            return result;
        };
        inner._resetSharedOpions = function () {
            inner.originalDefaultOptions = {
                valueType: null,
                animation: true,
                animationSteps: 100,
                animationEasing: 'easeInOutQuart',
                scaleOverlay: false,
                lineColor: null,
                fontFamily: null,
                fontColor: null,
                background: {
                    bordercolor: null,
                    borderwidth: null,
                    fillstyle: null
                },
                title: {
                    show: true,
                    content: null,
                    color: null,
                    fontfamily: null,
                    fontsize: null,
                    fontweight: null,
                    offtop: null,
                    height: null
                },
                subTitle: {
                    show: true,
                    content: null,
                    color: null,
                    fontfamily: null,
                    fontsize: null,
                    fontweight: null,
                    height: null
                },
                legend: {
                    show: true,
                    type: null,
                    elementtype: null,
                    placeX: null,
                    placeY: null,
                    sidelength: null,
                    offX: null,
                    offY: null,
                    bordercolor: null,
                    borderwidth: 1,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null
                },
                scale: {
                    linewidth: 1,
                    linecolor: null,
                    backcolors: null
                },
                labelAxis: {
                    labels: null,
                    startlength: null,
                    endlength: null,
                    length: null,
                    linewidth: 1,
                    linecolor: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    fontrotate: null
                },
                valueAxis: {
                    length: null,
                    content: function (val) {
                        if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                        else if (this.valueType == 'p') { return val.toFixed(0).toString() + '%'; }
                        else { return val.toString(); }
                    },
                    minvalue: null,
                    maxvalue: null,
                    interval: null,
                    verticalcomputeP: false,
                    linewidth: null,
                    linecolor: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    fontrotate: null
                },
                splitLine: {
                    show: false,
                    linecolor: null,
                    linewidth: null
                },
                cross: {
                    show: true,
                    length: null,
                    linewidth: null,
                    linecolor: null
                },
                close: {
                    show: true,
                    linewidth: null,
                    linecolor: null
                },
                caption: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null
                },
                xAxisTitle: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    titlelocation: null
                },
                yAxisTitle: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    titlelocation: null
                },
                footer: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    rightdistance: null,
                    bottomdistance: null
                },
                shadow: {
                    show: true,
                    color: null,
                    blur: null,
                    offsetX: null,
                    offsetY: null
                },
                supportMouseEvents: true,
                tip: {
                    show: true,
                    content: function (data) {
                        var val = data.value.toString();
                        if (this.valueType == 'd') { val = data.value.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { val = data.value.format('MM-dd hh:mm'); }
                        return '<div>&nbsp;' + data.text + '：' + val + '&nbsp;</div>';
                    },
                    tiptype: null
                },
                click: null,
                mouseover: null,
                mouseleave: null,
                mouseoverTransparency: 0.3,
                mouseoverChangeCursor: true,
                onAnimationComplete: null
            };
        };
        inner.SetBasicOptions = function (ops) {
            var _computedNew = inner._computeBasic(ops);
            if (inner.calculatedBasic && DChart.Methods.ObjectHaveSameValues(inner.calculatedBasic, _computedNew, ['offleft', 'offright', 'offtop', 'offbottom', 'height', 'width'])) { return; }
            _basicOptions = DChart.Methods.Override(_basicOptions, ops);
            inner.Initial();
            return inner;
        };
        inner._TransferArrayDataToObject = function (arr) {
            var res = {};
            var wrongMsgs = DChart.Const.Language[inner.Language];
            if (arr[0] && typeof arr[0] == 'string') { res.text = arr[0]; }
            else {
                throw new Error(wrongMsgs.WrongParam + '\'' + arr + '\'' + wrongMsgs.FirstValueShouldBeString);
            }
            if (arr[1] != null) { res.value = arr[1]; }
            else {
                throw new Error(wrongMsgs.WrongParam + '\'' + arr + '\'' + wrongMsgs.ValueMustNotBeUndefined);
            }
            var index = 2;
            if (DChart.Methods.IsArray(arr[index])) {
                var subitems = arr[index];
                if (DChart.Methods.IsArray(subitems[0]) && subitems[0].length > 0 && typeof subitems[0][0] == 'string') {
                    for (var i = 0; i < subitems.length; i++) {
                        subitems[i] = inner._TransferArrayDataToObject(subitems[i]);
                    }
                }
                res.subitems = subitems;
                index++;
            }
            if (typeof arr[index] == 'string') { res.color = arr[index]; index++ }
            if (typeof arr[index] == 'function') { res.click = arr[index]; index++ }
            if (typeof arr[index] == 'function') { res.mouseover = arr[index]; index++ }
            if (typeof arr[index] == 'function') { res.mouseleave = arr[index]; }
            return res;
        };
        inner.SetData = function (data) {
            var wrongMsgs = DChart.Const.Language[inner.Language];
            if ((!data || !DChart.Methods.IsArray(data)) && (!inner.innerData || !DChart.Methods.IsArray(inner.innerData))) {
                throw new Error(wrongMsgs.WrongParam + wrongMsgs.DataMustBeArray);
            }
            if (data) {
                if (DChart.Methods.IsArray(data[0]) && data[0].length > 0 && typeof data[0][0] == 'string') {
                    var tranData = [];
                    for (var i = 0, item; item = data[i]; i++) {
                        var newitem = inner._TransferArrayDataToObject(item);
                        tranData.push(newitem);
                    }
                    data = tranData;
                }
                inner.innerData = data;
            }
            return inner;
        };
        inner.SetOptions = function (ops) {
            if (!inner.innerOptions) {
                inner.SetDefaultOptions();
            }
            if (ops) {
                inner.innerOptions = DChart.Methods.Override(inner.innerOptions, ops);
            }
            return inner;
        };
        inner._onStart = function () {
            inner.coordinates = {};
            inner.tempData = {};
            inner.canvas.onclick = null;
            inner.canvas.onmousemove = null;
            if (inner.onStart) { inner.onStart(); }
        };
        inner._checkOptions = function () {
            var _checkOption = function (name, val, type) {
                var throwErr = function (errName) {
                    var wrongMsgs = DChart.Const.Language[inner.Language];
                    throw new Error(wrongMsgs.WrongParam + name + wrongMsgs[errName]);
                };
                if (val === null) { return; }
                else if (val === undefined) { throwErr('OptionShouldNotBeUndefined'); }
                var returnval = null;
                switch (type) {
                    case 's':
                        if (typeof val != 'string') { throwErr('OptionShouldBeString'); }
                        break;
                    case 'b':
                        if (typeof val != 'boolean') { throwErr('OptionShouldBeBoolean'); }
                        break;
                    case 'c':
                        if (typeof val != 'string' || !DChart.Methods.IsColor(val)) { throwErr('OptionShouldBeColorStr'); }
                        break;
                    case 'f':
                        if (typeof val != 'function') { throwErr('OptionShouldBeFunction'); }
                        break;
                    case 'ca':
                        if (typeof val == 'string' && DChart.Methods.IsColor(val)) { returnval = [val]; }
                        else {
                            var fluent = true;
                            if (DChart.Methods.IsArray(val) && val.length) { for (var i = 0, str; str = val[i]; i++) { if (typeof str != 'string' || !DChart.Methods.IsColor(str)) { fluent = false; } } }
                            else { fluent = false; }
                            if (!fluent) { throwErr('OptionShouldBeColorArray'); }
                        }
                        break;
                    case 'sa':
                        if (typeof val == 'string') { returnval = [val]; }
                        else {
                            var fluent = true;
                            if (DChart.Methods.IsArray(val) && val.length) { for (var i = 0, str; str = val[i]; i++) { if (typeof str != 'string') { fluent = false; } } }
                            else { fluent = false; }
                            if (!fluent) { throwErr('OptionShouldBeStringArray'); }
                        }
                        break;
                    case 'na':
                        if (typeof val == 'number' && DChart.Methods.IsNumber(val)) { returnval = [val]; }
                        else {
                            var fluent = true;
                            if (DChart.Methods.IsArray(val) && val.length) { for (var i = 0; i < val.length; i++) { if (typeof val[i] != 'number' || !DChart.Methods.IsNumber(val[i])) { fluent = false; } } }
                            else { fluent = false; }
                            if (!fluent) { throwErr('OptionShouldBeNumberArray'); }
                        }
                        break;
                    default:
                        if (typeof val != 'number' || !DChart.Methods.IsNumber(val)) { throwErr('OptionShouldBeNumber'); }
                        break;
                }
                return returnval;
            };
            var commonsets = {
                __top: [['valueType', 's'], ['animation', 'b'], ['animationSteps', 'n'], ['animationEasing', 's'], ['scaleOverlay', 'b'], ['lineColor', 'c'], ['fontFamily', 's'], ['fontColor', 'c'], ['supportMouseEvents', 'b'], ['click', 'f'], ['mouseover', 'f'], ['mouseleave', 'f'], ['mouseoverTransparency', 'n'], ['mouseoverChangeCursor', 'b'], ['onAnimationComplete', 'f']],
                title: [['show', 'b'], ['content', 's'], ['offtop', 'n'], ['height', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's']],
                subTitle: [['show', 'b'], ['content', 's'], ['height', 'n'], ['color', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's']],
                legend: [['show', 'b'], ['type', 's'], ['elementtype', 's'], ['placeX', 's'], ['placeY', 's'], ['sidelength', 'n'], ['offX', 'n'], ['offY', 'n'], ['bordercolor', 'c'], ['borderwidth', 'n'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's']],
                background: [['bordercolor', 'c'], ['borderwidth', 'n']],
                scale: [['linewidth', 'n'], ['linecolor', 'c'], ['backcolors', 'ca']],
                labelAxis: [['labels', 'sa'], ['startlength', 'n'], ['endlength', 'n'], ['length', 'n'], ['linewidth', 'n'], ['linecolor', 'c'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['fontrotate', 'n']],
                valueAxis: [['length', 'n'], ['content', 'f'], ['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n'], ['verticalcomputeP', 'b'], ['linewidth', 'n'], ['linecolor', 'c'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['fontrotate', 'n']],
                splitLine: [['show', 'b'], ['linewidth', 'n'], ['linecolor', 'c']],
                cross: [['show', 'b'], ['length', 'n'], ['linewidth', 'n'], ['linecolor', 'c']],
                close: [['show', 'b'], ['linewidth', 'n'], ['linecolor', 'c']],
                caption: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's']],
                xAxisTitle: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['titlelocation', 'n']],
                yAxisTitle: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['titlelocation', 'n']],
                footer: [['content', 's'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['rightdistance', 'n'], ['bottomdistance', 'n']],
                shadow: [['show', 'b'], ['color', 'c'], ['blur', 'n'], ['offsetX', 'n'], ['offsetY', 'n']],
                tip: [['show', 'b'], ['content', 'f'], ['tiptype', 's']]
            };
            var checksets = function (sets) {
                for (var _item in sets) {
                    var ops = _item == '__top' ? inner.innerOptions : inner.innerOptions[_item];
                    for (var i = 0, subitem; subitem = sets[_item][i]; i++) {
                        var name = _item == '__top' ? subitem[0] : _item + '.' + subitem[0];
                        var val = ops[subitem[0]];
                        var type = subitem[1];
                        var returnval = _checkOption(name, val, type);
                        if (returnval != null) { ops[subitem[0]] = returnval; }
                    }
                }
            };
            var specificsets = inner._getCheckOptions();
            checksets(commonsets);
            checksets(specificsets);
        };

        inner.GetCoordinate = function (location) {
            var coors = inner.coordinates;
            if (typeof location != 'string') { return coors; }
            else {
                var splits = location.replace(DChart.Const.RegExps.BlankCharacter, '').split(".");
                for (var i = 0, item; item = splits[i]; i++) {
                    if (coors) { coors = coors[item]; }
                }
                return coors;
            }
        };
        inner.SetSkin = function (skinID) {
            if (!DChart.Const.Skins[skinID]) { skinID = 'BlackAndWhite'; }
            var skin = DChart.Const.Skins[skinID];
            var newOps = {};
            newOps.fontColor = skin.FontColor || null;
            newOps.lineColor = skin.LineColor || null;
            newOps.fontFamily = skin.FontFamily || null;
            newOps.background = {};
            newOps.background.fillstyle = null;
            if (skin.BackGround) {
                newOps.background.bordercolor = skin.BackGround.BorderColor || null;
                newOps.background.borderwidth = skin.BackGround.BorderWidth || null;
                if (skin.BackGround.BackColor) {
                    newOps.background.fillstyle = skin.BackGround.BackColor;
                }
                else {
                    var ops = skin.BackGround.LinearGradient;
                    if (ops && ops.Location && ops.ColorStops && ops.ColorStops.length) {
                        var loc = ops.Location;
                        var gradient = inner.ctx.createLinearGradient(loc.minX || 0, loc.minY || 0, loc.maxX || inner.canvas.width, loc.maxY || inner.canvas.height);
                        for (var i = 0, stop; stop = ops.ColorStops[i]; i++) {
                            gradient.addColorStop(stop.offset, stop.color);
                        }
                        newOps.background.fillstyle = gradient;
                    }
                    else {
                        ops = skin.BackGround.RadialGradient;
                        if (ops && ops.Location && ops.ColorStops && ops.ColorStops.length) {
                            var loc = ops.Location;
                            var gradient = inner.ctx.createRadialGradient(loc.x0 || inner.canvas.width / 2, loc.y0 || inner.canvas.height / 2, loc.r0 || 0, loc.x1 || inner.canvas.width / 2, loc.y1 || inner.canvas.height / 2, loc.r1 || Math.max(inner.canvas.width, inner.canvas.height));
                            for (var i = 0, stop; stop = ops.ColorStops[i]; i++) {
                                gradient.addColorStop(stop.offset, stop.color);
                            }
                            newOps.background.fillstyle = gradient;
                        }
                    }
                }
            }
            newOps.title = {};
            newOps.title.color = skin.TitleColor || null;
            newOps.subTitle = {};
            newOps.subTitle.color = skin.SubTitleColor || null;
            newOps.legend = {};
            newOps.legend.fontcolor = skin.LegendFontColor || null;
            newOps.legend.bordercolor = skin.LegendBorderColor || null;
            newOps.title = {};
            newOps.title.color = skin.TitleColor || null;
            newOps.scale = {};
            newOps.scale.linecolor = skin.ScaleLineColor || null;
            newOps.scale.backcolors = skin.ScaleBackColors || null;
            newOps.labelAxis = {};
            newOps.labelAxis.linecolor = skin.LabelAxisLineColor || null;
            newOps.labelAxis.fontcolor = skin.LabelAxisFontColor || null;
            newOps.valueAxis = {};
            newOps.valueAxis.linecolor = skin.ValueAxisLineColor || null;
            newOps.valueAxis.fontcolor = skin.ValueAxisFontColor || null;
            newOps.splitLine = {};
            newOps.splitLine.linecolor = skin.SplitLineColor || null;
            newOps.cross = {};
            newOps.cross.linecolor = skin.CrossLineColor || null;
            newOps.close = {};
            newOps.close.linecolor = skin.CloseLineColor || null;
            newOps.caption = {};
            newOps.caption.fontcolor = skin.CaptionFontColor || null;
            newOps.xAxisTitle = {};
            newOps.xAxisTitle.fontcolor = skin.XAxisTitleFontColor || null;
            newOps.yAxisTitle = {};
            newOps.yAxisTitle.fontcolor = skin.YAxisTitleFontColor || null;
            newOps.footer = {};
            newOps.footer.fontcolor = skin.FooterFontColor || null;
            newOps.shadow = {};
            newOps.shadow.color = skin.ShadowColor || null;
            newOps.tip = {};
            newOps.tip.tiptype = skin.TipType || null;
            inner._spreadSkin(skinID, newOps);
            inner.innerOptions = DChart.Methods.Override(inner.innerOptions, newOps);
            return inner;
        };
        inner.randoms = {};
        inner.shapes = {};
        inner.Initial = function () {

            var children = targetdiv.children;
            for (var i = 0, child; child = children[i]; i++) {
                if (child.nodeName.toLowerCase() == 'canvas') {
                    targetdiv.removeChild(child);
                    break;
                }
            }

            var head = document.getElementsByTagName('head')[0];
            var dchartStyle = head.getElementsByTagName('style');
            for (var i = 0, style; style = dchartStyle[i]; i++) {
                if (style.id.indexOf('DChart') == 0) {
                    head.removeChild(style);
                }
            }
            var style = document.createElement('style');
            var styleID = 'DChart' + DChart.Methods.GetRandomString();
            style.id = styleID;
            inner.randoms.styleID = styleID;
            head.appendChild(style);
            var classes = DChart.Const.CustomCss;
            for (var className in classes) {
                if (classes.hasOwnProperty(className)) {
                    var newClassName = className + DChart.Methods.GetRandomString();
                    inner.randoms[className] = newClassName;
                    var css = '.' + newClassName + classes[className] + '\n';
                    if (style.styleSheet) {
                        style.styleSheet.cssText += css;
                    }
                    else {
                        style.appendChild(document.createTextNode(css));
                    }
                }
            }
            inner._computeBasic();
            var canvas = document.createElement('canvas');
            var canvasID = 'DChart' + DChart.Methods.GetRandomString();
            inner.ID = canvasID;
            canvas.setAttribute('id', canvasID);
            inner.randoms.canvasID = canvasID;
            canvas.width = inner.calculatedBasic.width;
            canvas.height = inner.calculatedBasic.height;
            style = 'margin:' + inner.calculatedBasic.offtop + 'px ' + inner.calculatedBasic.offright + 'px ' + inner.calculatedBasic.offbottom + 'px ' + inner.calculatedBasic.offleft + 'px;';
            canvas.innerHTML = '<p>您的浏览器不支持HTML5</p>';
            canvas.setAttribute('style', style);
            targetdiv.appendChild(canvas);
            inner.canvas = canvas;
            inner.ctx = canvas.getContext('2d');
            inner.innerData = [];
            inner.SetDefaultOptions();
            inner.ClearBackGround();
        };
        inner.SavePic = function (filename, type) {
            type = type || 'png';
            var _fixType = function (type) {
                type = type.toLowerCase().replace(/jpg/i, 'jpeg');
                var r = type.match(/png|jpeg|bmp|gif/)[0];
                return 'image/' + r;
            };
            var saveFile = function (data, filename) {
                var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                save_link.href = data;
                save_link.download = filename;
                var event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                save_link.dispatchEvent(event);
            };
            var imgData = inner.canvas.toDataURL(_fixType(type));
            imgData = imgData.replace(_fixType(type), 'image/octet-stream');
            var filename = (filename || DChart.Const.Defaults.SavedPicName) + '.' + type;
            saveFile(imgData, filename);
        };
        inner._clearTips = function () {
            var children = targetdiv.children;
            for (var i = 0, child; child = children[i]; i++) {
                if (child.nodeName && child.nodeName.toLowerCase() != 'canvas') {
                    targetdiv.removeChild(child);
                    i--;
                }
            }
        };
        inner.DrawFigures = {};
        inner.DrawFigures.createPointElement = function (type, X, Y, length, fillcolor, fill, strokecolor, linewidth, stroke, middle) {
            if (arguments.length < 5) { return; }
            if (fill == null) { fill = true; }
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            switch (type) {
                case 'c':
                    if (middle) { ctx.arc(X, Y, length / 2, 0, Math.PI * 2); }
                    else { ctx.arc(X + length / 2, Y + length / 2, length / 2, 0, Math.PI * 2); }
                    break;
                case 't':
                    if (middle) {
                        ctx.moveTo(X - length / 2, Y + length / 2);
                        ctx.lineTo(X + length / 2, Y + length / 2);
                        ctx.lineTo(X, Y - length / 2);
                        ctx.lineTo(X - length / 2, Y + length / 2);
                    }
                    else {
                        ctx.moveTo(X, Y + length);
                        ctx.lineTo(X + length, Y + length);
                        ctx.lineTo(X + length / 2, Y);
                        ctx.lineTo(X, Y + length);
                    }
                    break;
                case 'x':
                    length += linewidth;
                    if (middle) {
                        ctx.moveTo(X - length / 2, Y - length / 2);
                        ctx.lineTo(X + length / 2, Y + length / 2);
                        ctx.moveTo(X - length / 2, Y + length / 2);
                        ctx.lineTo(X + length / 2, Y - length / 2);
                    }
                    else {
                        ctx.moveTo(X, Y);
                        ctx.lineTo(X + length, Y + length);
                        ctx.moveTo(X, Y + length);
                        ctx.lineTo(X + length, Y);
                    }
                    break;
                default:
                    if (middle) { ctx.rect(X - length / 2, Y - length / 2, length, length); }
                    else { ctx.rect(X, Y, length, length); }
                    break;
            }
            ctx.closePath();
            if (stroke && (linewidth > 0 || type == 'x')) {
                ctx.strokeStyle = (type == 'x' ? fillcolor : strokecolor);
                ctx.lineWidth = linewidth * 2;
                ctx.stroke();
            }
            if (fill && type != 'x') {
                ctx.fillStyle = fillcolor;
                ctx.fill();
            }
            ctx.restore();
        };
        inner.DrawFigures.createArc = function (centerX, centerY, radius, linewidth, linecolor, fillcolor, startAngle, endAngle, linkCenter) {
            if (arguments.length < 4) { return; }
            var ctx = inner.ctx;
            startAngle = startAngle || 0;
            endAngle = endAngle || Math.PI * 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            if (linkCenter && Math.abs(endAngle - startAngle) < Math.PI * 2 - 0.01) {
                ctx.lineTo(centerX, centerY);
            }
            ctx.closePath();
            if (linewidth > 0) {
                ctx.strokeStyle = linecolor || DChart.Const.Defaults.LineColor;
                ctx.lineWidth = linewidth;
                ctx.stroke();
            }
            if (fillcolor) {
                ctx.fillStyle = fillcolor;
                ctx.fill();
            }
            ctx.restore();
        };
        inner.DrawFigures.createRing = function (centerX, centerY, innerRadius, outerRadius, fillcolor, angleMin, angleMax, linewidth, linecolor) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX + outerRadius * Math.cos(angleMin), centerY + outerRadius * Math.sin(angleMin));
            ctx.arc(centerX, centerY, outerRadius, angleMin, angleMax);
            ctx.lineTo(centerX + innerRadius * Math.cos(angleMax), centerY + innerRadius * Math.sin(angleMax));
            ctx.arc(centerX, centerY, innerRadius, angleMax, angleMin, true);
            ctx.closePath();
            ctx.fillStyle = fillcolor;
            ctx.fill();
            if (linewidth > 0) {
                ctx.lineWidth = linewidth;
                ctx.strokeStyle = linecolor || DChart.Const.Defaults.LineColor;
                ctx.stroke();
            }
            ctx.restore();
        };
        inner.DrawFigures.measureText = function (content, fontweight, fontsize, fontfamily) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.font = (fontweight || 'normal') + ' ' + (fontsize || DChart.Const.Defaults.FontSize) + 'px ' + (fontfamily || inner.innerOptions.fontFamily || DChart.Const.Defaults.FontFamily);
            var textWidth = ctx.measureText(content).width;
            ctx.restore();
            return textWidth;
        };
        inner.DrawFigures.createText = function (content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate, reference) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.textAlign = textAlign || 'left';
            ctx.font = (fontweight || 'normal') + ' ' + (fontsize || DChart.Const.Defaults.FontSize) + 'px ' + (fontfamily || inner.innerOptions.fontFamily || DChart.Const.Defaults.FontFamily);
            var textWidth = ctx.measureText(content).width;
            ctx.fillStyle = color || inner.innerOptions.fontColor || DChart.Const.Defaults.FontColor;
            if (fontrotate) {
                if (textAlign == 'center' && reference == 'right') {
                    y -= Math.sin(fontrotate * Math.PI) * textWidth / 2;
                }
                ctx.translate(x, y);
                ctx.rotate(fontrotate * Math.PI);
                ctx.fillText(content, 0, 0);
            }
            else {
                ctx.fillText(content, x, y);
            }
            ctx.restore();
            return textWidth;
        };
        inner.DrawFigures.createRectangleFill = function (left, top, width, height, fillstyle, shadow) {
            if (width <= 0 || height <= 0) { return; }
            var ctx = inner.ctx;
            ctx.save();
            ctx.fillStyle = fillstyle;
            if (shadow) {
                if (shadow.color) { ctx.shadowColor = shadow.color; }
                if (shadow.blur) { ctx.shadowBlur = shadow.blur; }
                if (shadow.offsetX) { ctx.shadowOffsetX = shadow.offsetX; }
                if (shadow.offsetY) { ctx.shadowOffsetY = shadow.offsetY; }
            }
            ctx.fillRect(left, top, width, height);
            ctx.restore();
        };
        inner.DrawFigures.createRectangleBorder = function (left, top, width, height, borderwidth, bordercolor) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = borderwidth || DChart.Const.Defaults.LineWidth;
            ctx.rect(left, top, width, height);
            ctx.closePath();
            ctx.strokeStyle = bordercolor || inner.innerOptions.lineColor || DChart.Const.Defaults.LineColor;
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.createLine = function (startX, startY, endX, endY, linewidth, linecolor) {
            var linewidth = Math.ceil(linewidth);
            if (startX == endX) {
                startX = endX = DChart.Methods.FormatLinePosition(linewidth, startX);
            }
            else if (startY == endY) {
                startY = endY = DChart.Methods.FormatLinePosition(linewidth, startY);
            }
            var ctx = inner.ctx;
            ctx.save();
            ctx.lineWidth = linewidth || DChart.Const.Defaults.LineWidth;
            ctx.strokeStyle = linecolor || inner.innerOptions.lineColor || DChart.Const.Defaults.LineColor;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.createQuadraticCurve = function (startX, startY, controlX, controlY, endX, endY, linewidth, linecolor) {
            var linewidth = Math.ceil(linewidth);
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
            ctx.lineWidth = linewidth || DChart.Const.Defaults.LineWidth;
            ctx.strokeStyle = linecolor || inner.innerOptions.lineColor || DChart.Const.Defaults.LineColor;
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.curveSmoothPoints = function (ctx, point0, point1, upturnAxis) {
            var centerX = (point0[0] + point1[0]) / 2;
            var centerY = (point0[1] + point1[1]) / 2;
            if (upturnAxis) {
                ctx.quadraticCurveTo(point0[0], 0.5 * centerY + 0.5 * point0[1], centerX, centerY);
                ctx.quadraticCurveTo(point1[0], 0.5 * centerY + 0.5 * point1[1], point1[0], point1[1]);
            }
            else {
                ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point0[0], point0[1], centerX, centerY);
                ctx.quadraticCurveTo(0.5 * centerX + 0.5 * point1[0], point1[1], point1[0], point1[1]);
            }
        };
        inner.DrawFigures.createSmoothLine = function (points, linewidth, linecolor, upturnAxis) {
            var ctx = inner.ctx;
            var len = points.length;
            if (len < 3) { return; }
            ctx.save();
            ctx.lineWidth = linewidth || DChart.Const.Defaults.LineWidth;
            ctx.strokeStyle = linecolor || inner.innerOptions.lineColor || DChart.Const.Defaults.LineColor;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 0; i < len - 1; i++) {
                inner.DrawFigures.curveSmoothPoints(ctx, points[i], points[i + 1]);
            }
            ctx.stroke();
            ctx.restore();
        };
        inner.DrawFigures.createCloseFigure = function (points, fillcolor, linewidth, linecolor, smoothline, upturnAxis) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            var len = points.length;
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 0; i < len - 1; i++) {
                if (!smoothline) { ctx.lineTo(points[i + 1][0], points[i + 1][1]); }
                else { inner.DrawFigures.curveSmoothPoints(ctx, points[i], points[i + 1], upturnAxis); }
            }
            ctx.closePath();
            ctx.fillStyle = fillcolor;
            ctx.fill();
            if (linewidth > 0 && linecolor) {
                ctx.lineWidth = linewidth;
                ctx.strokeStyle = linecolor;
                ctx.stroke();
            }
            ctx.restore();
        };
        inner.DrawFigures.createPointsLine = function (points, linewidth, linecolor) {
            if (points.length < 2) { return; }
            var x0 = points[0][0]; var y0 = points[0][1];
            for (var i = 1, point; point = points[i]; i++) {
                var x1 = points[i][0]; var y1 = points[i][1];
                inner.DrawFigures.createLine(x0, y0, x1, y1, linewidth, linecolor);
                x0 = x1; y0 = y1;
            }
        };
        inner.ClearBackGround = function () {
            targetdiv.style.backgroundColor = '';
            inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
            inner._clearTips();
            for (var shapecontain in inner.shapes) {
                if (shapecontain && inner.shapes[shapecontain].length) {
                    inner.shapes[shapecontain].length = 0;
                }
            }
        };
        inner._createBackground = function () {
            var ops = inner.innerOptions.background;
            var canvas = inner.canvas;
            if (ops.fillstyle) {
                inner.DrawFigures.createRectangleFill(0, 0, canvas.width, canvas.height, ops.fillstyle);
            }
            else {
                inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
            }
            var borderwidth = ops.borderwidth || 0;
            if (borderwidth > 0) {
                inner.DrawFigures.createRectangleBorder(0, 0, canvas.width, canvas.height, borderwidth * 2, ops.bordercolor);
            }
            inner.coordinates.canvas = { width: canvas.width, height: canvas.height, borderwidth: borderwidth };
        };
        inner._createTip = function (content, left, top) {
            var tipBox = document.createElement('span');
            var tiptype = inner.innerOptions.tip.tiptype || DChart.Const.Defaults.TipType;
            tipBox.setAttribute('class', inner.randoms[tiptype]);
            tipBox.style.position = 'absolute';
            tipBox.style.left = targetdiv.offsetLeft + left + inner.calculatedBasic.offleft + 'px';
            tipBox.style.top = targetdiv.offsetTop + top + inner.calculatedBasic.offtop + 'px';
            tipBox.innerHTML = content;
            targetdiv.appendChild(tipBox);
            return tipBox;
        };
        inner._changeTip = function (tip, left, top) {
            if (left) {
                tip.style.left = targetdiv.offsetLeft + left + inner.calculatedBasic.offleft + 'px';
            }
            if (top) {
                tip.style.top = targetdiv.offsetTop + top + inner.calculatedBasic.offtop + 'px';
            }
        };
        inner._getDrawableCoordinate = function () {
            if (!inner.tempData.coordinate) {
                var ops = inner.innerOptions;
                var valids = inner._calculateOutersValid();
                var minX, minY, maxX, maxY;
                if (valids.AxisValid) {
                    var axisSize = inner.axisSize || inner._computeAxis(valids);
                    minX = axisSize.minX - 1;
                    minY = axisSize.minY - 1;
                    maxX = axisSize.maxX + 1;
                    maxY = axisSize.maxY + 1;
                }
                else {
                    var legendSize = valids.legendValid ? inner._computeLegend() : null;
                    minX = (legendSize ? legendSize.occupyLeft : 0);
                    maxX = inner.canvas.width - (legendSize ? legendSize.occupyRight : 0);
                    if (valids.titleValid) { minY = inner._computeTitle(valids).occupyTop; }
                    else { minY = 0; }
                    minY += (legendSize ? legendSize.occupyTop : 0);
                    maxY = inner.canvas.height - (legendSize ? legendSize.occupyBottom : 0);
                    var canvasBorderWidth = ops.background.borderwidth || 0;
                    minX += canvasBorderWidth; maxX -= canvasBorderWidth; minY += canvasBorderWidth; maxY -= canvasBorderWidth;
                }
                var centerX = (maxX + minX) / 2;
                var centerY = (maxY + minY) / 2;
                inner.tempData.coordinate = { minX: Math.ceil(minX), maxX: Math.ceil(maxX), minY: Math.ceil(minY), maxY: Math.ceil(maxY), centerX: centerX, centerY: centerY };
            }
            return inner.tempData.coordinate;
        };
        inner._clearDrawable = function (coordinate) {
            var ops = inner.innerOptions.background;
            coordinate = coordinate || inner._getDrawableCoordinate();
            inner.ctx.clearRect(coordinate.minX + 1, coordinate.minY + 1, coordinate.maxX - coordinate.minX - 2, coordinate.maxY - coordinate.minY - 2);
            if (ops.fillstyle) {
                inner.DrawFigures.createRectangleFill(coordinate.minX + 1, coordinate.minY + 1, coordinate.maxX - coordinate.minX - 2, coordinate.maxY - coordinate.minY - 2, ops.fillstyle);
            }
        };
        inner._computeTitle = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            var ops = inner.innerOptions.title;
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var referencedlength = Math.min(inner.canvas.height - canvasBorderWidth * 2, inner.canvas.width / 2 - canvasBorderWidth);
            var offtop = ops.offtop != null ? ops.offtop : 0;
            var height = ops.height != null ? ops.height : referencedlength / 15;
            var fontsize = ops.fontsize || referencedlength / 18;
            ops = inner.innerOptions.subTitle;
            var subheight = ops.height != null ? ops.height : referencedlength / 18;
            var subfontsize = ops.fontsize != null ? ops.fontsize : referencedlength / 21;
            var occupyTop = (valids.titleValid ? height + offtop : 0) + (valids.titleValid && valids.subTitleValid ? subheight : 0) + fontsize / 4;
            return { title: { height: height, offtop: offtop, fontsize: fontsize }, subTitle: { height: subheight, fontsize: subfontsize }, occupyTop: occupyTop };
        };
        inner._createTitle = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            var ops = inner.innerOptions.title;
            if (!valids.titleValid) { return; }
            var computed = inner._computeTitle(valids);
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var centerX = inner.canvas.width / 2;
            var bottom = canvasBorderWidth + computed.title.offtop + computed.title.height;
            var textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', (ops.fontweight || 'bold'), computed.title.fontsize, ops.fontfamily, ops.color);
            inner.coordinates.title = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - computed.title.fontsize, bottom: bottom, fontsize: computed.title.fontsize, length: textlength };
            ops = inner.innerOptions.subTitle;
            if (!valids.subTitleValid) { return; }
            bottom = canvasBorderWidth + computed.title.offtop + computed.title.height + computed.subTitle.height;
            textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', (ops.fontweight || 'bold'), computed.subTitle.fontsize, ops.fontfamily, ops.color);
            inner.coordinates.subTitle = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - computed.subTitle.fontsize, bottom: bottom, fontsize: computed.subTitle.fontsize, length: textlength };
        };
        inner._computeLegend = function (valids) {
            if (inner.tempData.legendSize) { return inner.tempData.legendSize; }
            var valids = valids || inner._calculateOutersValid();
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var fullWidth = inner.canvas.width - canvasBorderWidth * 2;
            var fullHeight = inner.canvas.height - canvasBorderWidth * 2;
            var ops = inner.innerOptions.legend;
            var data = inner.innerData;
            var legendWidth = 0;
            var legendHeight = 0;
            var type = ops.type != 'row' ? 'column' : ops.type;
            var placeX = ops.placeX != 'left' && ops.placeX != 'center' ? 'right' : ops.placeX;
            var placeY = ops.placeY != 'top' && ops.placeY != 'bottom' ? 'middle' : ops.placeY;
            if (placeY == 'middle' && placeX == 'center' || type == 'row' && placeY == 'middle') {
                throw new Error(DChart.Const.Language[inner.Language].WrongLegendSet);
            }
            var elementtype = ops.elementtype || DChart.Const.Defaults.LegendType;
            var sidelength = ops.sidelength || Math.max(fullWidth, fullHeight) / (valids.AxisValid ? DChart.Const.Defaults.LengthReferCutForAxis : DChart.Const.Defaults.LengthReferCutForPies);
            var sidedistance = sidelength / 2;
            var sideoffY = type == 'row' ? sidelength / 3 : sidelength;
            var sideoffX = sidelength / 2;
            var borderwidth = ops.borderwidth && ops.borderwidth > 0 ? ops.borderwidth : 0;
            var fontsize = ops.fontsize || sidelength * 1.2;
            var fontfamily = ops.fontfamily || inner.innerOptions.fontFamily || DChart.Const.Defaults.FontFamily;
            var maxTextLength = 0;
            var texts = [];
            for (var i = 0, item; item = data[i]; i++) {
                texts[i] = item.text || '';
                if (typeof item.text == 'string') {
                    var length = inner.DrawFigures.measureText(item.text, null, fontsize, fontfamily);
                    if (maxTextLength < length) { maxTextLength = length; }
                }
            }
            var offX = ops.offX == null ? fullWidth / (valids.AxisValid ? DChart.Const.Defaults.OffXCutForAxis : DChart.Const.Defaults.OffXCutForPies) : ops.offX;
            var offY = ops.offY == null ? sidelength / 2 : ops.offY;
            if (elementtype == 'l') { sidelength *= 2; }
            if (type == 'column') {
                legendWidth = sideoffX * 2 + sidelength + sidedistance + maxTextLength + borderwidth * 2;
                legendHeight = data.length * ((elementtype == 'l' ? sidelength / 2 : sidelength) + sidedistance) - sidedistance + sideoffY * 2 + borderwidth * 2;
            }
            else {
                legendWidth = data.length * (sidelength + sidedistance * 2 + maxTextLength) - sidedistance + sideoffX * 2 + borderwidth * 2;
                legendHeight = sideoffY * 2 + (elementtype == 'l' ? sidelength / 2 : sidelength) + borderwidth * 2;
            }

            var left = (placeX == 'left' ? offX : (placeX == 'center' ? fullWidth / 2 - legendWidth / 2 : fullWidth + canvasBorderWidth - offX - legendWidth)) + borderwidth;
            var titleHeight = valids.titleValid ? inner._computeTitle(valids).occupyTop : 0;
            var top = offY + canvasBorderWidth + titleHeight;
            var estimateYAxisHeight = (valids.AxisValid ? fullHeight / 7.5 : 0);
            if (placeY == 'bottom') { top = fullHeight + canvasBorderWidth - legendHeight - offY - (placeX == 'center' || type == 'row' ? 0 : estimateYAxisHeight); }
            else if (placeY == 'middle') { top = (fullHeight - titleHeight - legendHeight) / 2 + canvasBorderWidth + titleHeight - estimateYAxisHeight / 2; }

            var occupyTop = placeY == 'top' && (type == 'row' || type == 'column' && placeX == 'center') ? legendHeight + offY + canvasBorderWidth + sidelength / 3 : 0;
            var occupyBottom = placeY == 'bottom' && (type == 'row' || type == 'column' && placeX == 'center') ? legendHeight + offY + canvasBorderWidth + sidelength / 3 : 0;
            var occupyLeft = placeX == 'left' && type == 'column' ? legendWidth + offX : 0;
            var occupyRight = placeX == 'right' && type == 'column' ? legendWidth + offX : 0;

            inner.tempData.legendSize = {
                legendWidth: legendWidth, legendHeight: legendHeight, type: type, placeX: placeX, placeY: placeY, elementtype: elementtype,
                sidelength: sidelength, sidedistance: sidedistance, sideoffY: sideoffY, sideoffX: sideoffX,
                borderwidth: borderwidth, fontsize: fontsize, fontfamily: fontfamily,
                maxTextLength: maxTextLength, texts: texts,
                left: left, top: top,
                occupyTop: occupyTop, occupyBottom: occupyBottom, occupyLeft: occupyLeft, occupyRight: occupyRight
            };
            return inner.tempData.legendSize;
        };
        inner._createLegend = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.legendValid) { return; }
            var ops = inner.innerOptions.legend;
            var computed = inner._computeLegend();
            var colors = inner.tempData.legendColors || DChart.Const.Defaults.FillColors;
            var lineelement = computed.elementtype == 'l';
            for (var i = 0, item; item = inner.innerData[i]; i++) {
                var left = computed.left + computed.sideoffX + computed.borderwidth;
                if (computed.type == 'row') {
                    left += i * (computed.sidelength + computed.sidedistance * 2 + computed.maxTextLength);
                }
                var top = computed.top + computed.sideoffY + computed.borderwidth;
                if (computed.type == 'column') {
                    top += i * ((lineelement ? computed.sidelength / 2 : computed.sidelength) + computed.sidedistance);
                }
                var color = item.color || colors[i % colors.length];
                if (lineelement) {
                    inner.DrawFigures.createLine(left, top + computed.sidelength * 0.3, left + computed.sidelength, top + computed.sidelength * 0.3, 2, color);
                }
                else {
                    inner.DrawFigures.createPointElement(computed.elementtype, left, top, computed.sidelength, color, computed.elementtype != 'x', color, 1, computed.elementtype == 'x');
                }
                inner.DrawFigures.createText(computed.texts[i], left + computed.sidelength + (computed.elementtype == 'x' ? 5 : 3), top + computed.sidelength * (lineelement ? 0.45 : 0.9), null, null, computed.fontsize, computed.fontfamily, ops.fontcolor, null);
            }
            var borderwidth = computed.borderwidth;
            var legend = { borderwidth: borderwidth, left: computed.left + borderwidth / 2, top: computed.top + borderwidth / 2, width: computed.legendWidth - borderwidth, height: computed.legendHeight - borderwidth };
            inner.coordinates.legend = legend;
            if (borderwidth > 0) {
                inner.DrawFigures.createRectangleBorder(legend.left, legend.top, legend.width, legend.height, borderwidth, ops.bordercolor);
            }
        };
        inner._getFormatDiff = function (valueType, small, big) {
            if (small > big) { var tmp = small; small = big; big = tmp; }
            if (valueType == 'd') {
                return small.shortOf('d', big);
            }
            else if (valueType == 't') {
                return small.shortOf('n', big);
            }
            else {
                return big - small;
            }
        };
        inner._getComputed = function (vAxisVery, valueType, ops, minval, maxval, scaleCount) {
            var wrongMsgs = DChart.Const.Language[inner.Language];
            var minvalue = ops.minvalue;
            var maxvalue = ops.maxvalue;
            var getInterval = function (minval, maxval, valueType) {
                var interval = inner._getFormatDiff(valueType, minvalue != null && minvalue < minval ? minvalue : minval, maxvalue != null && maxvalue > maxval ? maxvalue : maxval) / scaleCount;
                var defaults = DChart.Const.Interval[valueType].__copy();
                var find = false;
                while (!find) {
                    if (interval < defaults[0]) { defaults.__multiply(0.1); }
                    if (interval > defaults[defaults.length - 1]) { defaults.__multiply(10); }
                    for (var i = 1; i < defaults.length; i++) {
                        if (defaults[i - 1] <= interval && defaults[i] >= interval) {
                            find = true;
                            interval = interval - defaults[i - 1] < defaults[i] - interval ? defaults[i - 1] : defaults[i];
                            break;
                        }
                    }
                }
                return interval;
            };
            var interval = ops.interval;
            if (!interval) {
                interval = getInterval(minval, maxval, valueType);
            }
            if (minvalue == null) {
                if (valueType == 'd' || valueType == 't') {
                    var cut = interval * 60000 * (valueType == "d" ? 1440 : 1);
                    minvalue = new Date(minval - cut * vAxisVery);
                    if (valueType == 'd') {
                        minvalue = new Date(Date.parse(minvalue.format('yyyy/MM/dd')));
                    }
                }
                else if (valueType == 'p') {
                    minvalue = 0;
                }
                else {
                    minvalue = (Math.floor(minval / interval) - vAxisVery) * interval;
                }
            }
            if (vAxisVery && minvalue < 0 && inner.tempData.notAllowValueNegative) { minvalue = 0; }

            if (maxvalue == null) {
                if (valueType == 'd' || valueType == 't') {
                    var cut = interval * 60000 * (valueType == "d" ? 1440 : 1);
                    maxvalue = new Date(minvalue.getTime() + (Math.ceil((maxval.getTime() - minvalue.getTime()) / cut) + vAxisVery) * cut);
                }
                else {
                    maxvalue = minvalue + (Math.ceil((maxval - minvalue) / interval) + vAxisVery) * interval;
                }
            }
            if (valueType == 'p' && maxvalue > 100) { maxvalue = 100; }


            var scalecount = 0;
            var tmpMinValue = DChart.Methods.CopyInnerValue(valueType, minvalue);
            var val = DChart.Methods.AddInnerValue(valueType, tmpMinValue, interval);
            while (val <= maxvalue || ((valueType == 'p' || valueType == 'n') && Math.abs(maxvalue - val) < 0.0001)) {
                val = DChart.Methods.AddInnerValue(valueType, val, interval);
                scalecount++;
            }
            maxvalue = DChart.Methods.AddInnerValue(valueType, val, -interval);

            maxvalue = DChart.Methods.FormatNumber(maxvalue);
            minvalue = DChart.Methods.FormatNumber(minvalue);
            interval = DChart.Methods.FormatNumber(interval);
            if (maxvalue < minvalue) {
                throw new Error(wrongMsgs.WrongParam + wrongMsgs.AxisMaxLessThanMin);
            }
            if (maxvalue < maxval) {
                throw new Error(wrongMsgs.WrongParam + wrongMsgs.AxisMaxLessThanActual);
            }
            if (minvalue > minval) {
                throw new Error(wrongMsgs.WrongParam + wrongMsgs.AxisMinMoreThanActual);
            }
            return { interval: interval, maxvalue: maxvalue, minvalue: minvalue, scalecount: scalecount };
        };
        inner._formatAxisData = function (heapCompute) {
            var options = inner.innerOptions;
            var innerData = inner.innerData;
            var wrongMsgs = DChart.Const.Language[inner.Language];
            var lValueType = options.labelAxis.valueType;
            var isRange = inner.tempData.valueAxiaDataIsRange;
            var multiple = (!isRange && !lValueType && innerData[0].value.length > 1) || (!isRange && lValueType && innerData[0].value.length && innerData[0].value[0].length == 2)
                  || (isRange && innerData[0].value.length > 1 && innerData[0].value[0].length == 2);
            var vValueType = options.valueType || DChart.Const.Defaults.ValueType;

            var heapCompute = heapCompute && multiple && !lValueType && (vValueType == 'p' || vValueType == 'n');

            var verticalcomputeP = (heapCompute || options.valueAxis.verticalcomputeP && multiple && !lValueType) && vValueType == 'p';


            var vMaxval = null;
            var vMinval = null;
            var lMaxval = null;
            var lMinval = null;

            var tuftCount = innerData.length;
            if (multiple) {
                tuftCount = innerData[0].value.length;
            }
            var demanCount = 1;
            if (multiple) {
                demanCount = innerData.length;
            }
            var valueSum = [];
            if (vValueType == 'p' || heapCompute) {
                if (multiple) {
                    if (verticalcomputeP || heapCompute) {
                        for (var i = 0; i < tuftCount; i++) {
                            var tmpSum = 0;
                            for (var j = 0, item; item = innerData[j]; j++) {
                                tmpSum += (lValueType ? item.value[i][1] : item.value[i]);
                            }
                            valueSum[i] = tmpSum;
                        }
                    }
                    else {
                        for (var i = 0, item; item = innerData[i]; i++) {
                            var tmpSum = 0;
                            for (var j = 0; j < item.value.length; j++) {
                                tmpSum += (lValueType ? item.value[j][1] : item.value[j]);
                            }
                            valueSum[i] = tmpSum;
                        }
                    }
                }
                else {
                    valueSum = 0;
                    for (var i = 0, item; item = innerData[i]; i++) {
                        valueSum += (lValueType ? item.value[1] : item.value);
                    }
                }
            }
            var formatValue = function (valueAxis, valueType, value, i, j, k) {
                if ((valueType == 'd' || valueType == 't') && !value.getDate) {
                    var parseDate = Date.parse(value.replace(/-/g, "/"));
                    if (isNaN(parseDate)) {
                        throw new Error(wrongMsgs.WrongData + "'" + value + "'" + wrongMsgs.NeedDateData);
                    }
                    else {
                        value = new Date(parseDate);
                        if (k == undefined) {
                            if (j == undefined) { innerData[i].value = value; }
                            else { innerData[i].value[j] = value; }
                        }
                        else {
                            if (isRange && valueAxis && lValueType) {
                                innerData[i].value[j][1][k] = value;
                            }
                            else if (isRange && !valueAxis) {
                                innerData[i].value[j][0] = value;
                            }
                            else {
                                innerData[i].value[j][k] = value;
                            }
                        }
                    }
                }
                else if (valueType == 'n' || valueType == 'p') {
                    if (typeof value != 'number') {
                        throw new Error(wrongMsgs.WrongData + "'" + value + "'" + wrongMsgs.NeedNumberData);
                    }
                    if (valueType == 'p') {
                        if (value < 0) {
                            throw new Error(wrongMsgs.WrongData + '\'' + value + '\'' + wrongMsgs.DataMustGreaterThanZero);
                        }
                        if (k == undefined) {
                            if (j == undefined) {
                                value = (value / valueSum) * 100;
                                innerData[i].percent = value;
                            }
                            else {
                                value = (value / (multiple ? (verticalcomputeP ? valueSum[j] : valueSum[i]) : valueSum)) * 100;
                                if (multiple && !innerData[i].percent) { innerData[i].percent = []; }
                                if (multiple) { innerData[i].percent[j] = value; }
                                else { innerData[i].percent = value; }
                            }
                        }
                        else {
                            value = (value / (verticalcomputeP ? valueSum[j] : valueSum[i])) * 100;
                            if (!innerData[i].percent) { innerData[i].percent = []; }
                            innerData[i].percent[j] = value;
                        }
                    }
                    else {
                        if (valueAxis && inner.tempData.notAllowValueNegative && value < 0) {
                            throw new Error(wrongMsgs.WrongData + '\'' + value + '\'' + wrongMsgs.DataMustGreaterThanZero);
                        }
                    }
                }
                return value;
            };
            var updateLabelExtreme = function (val) {
                if (lMaxval === null || val > lMaxval) { lMaxval = val; }
                if (lMinval === null || val < lMinval) { lMinval = val; }
            };
            var updateValueExtreme = function (val) {
                if (vMaxval === null || val > vMaxval) { vMaxval = val; }
                if (vMinval === null || val < vMinval) { vMinval = val; }
            };
            var computeSplitPoint = inner.tempData.computeSplitPoint;
            var splitExtremePoints = [];
            var updateSplitExtreme = function (val, row, newrow) {
                if (!computeSplitPoint) { return; }
                if (newrow) {
                    splitExtremePoints[row] = [null, null];
                }
                if (splitExtremePoints[row][0] == null || val < splitExtremePoints[row][0]) { splitExtremePoints[row][0] = val; }
                if (splitExtremePoints[row][1] == null || val > splitExtremePoints[row][1]) { splitExtremePoints[row][1] = val; }
            };
            if (multiple) {
                for (var i = 0, item; item = innerData[i]; i++) {
                    for (var j = 0; j < item.value.length; j++) {
                        var value = item.value[j];
                        var lValue = null; var vValue = value;
                        if (lValueType) {
                            if (value.length != 2) {
                                throw new Error(wrongMsgs.WrongData + "'" + value + "'" + wrongMsgs.AxisVauleShouldBeDArray);
                            }
                            lValue = value[0]; vValue = value[1];
                        }
                        if (lValue) {
                            lValue = formatValue(false, lValueType, lValue, i, j, 0);
                            updateLabelExtreme(lValue);
                        }
                        if (isRange) {
                            for (var k = 0; k <= 1; k++) {
                                var tmpVValue = vValue[k];
                                tmpVValue = formatValue(true, vValueType, tmpVValue, i, j, k);
                                updateValueExtreme(tmpVValue);
                            }
                        }
                        else {
                            vValue = formatValue(true, vValueType, vValue, i, j, lValueType ? 1 : undefined);
                            updateValueExtreme(vValue);
                            updateSplitExtreme(vValue, i, j == 0);
                        }
                    }
                }
                if (heapCompute) {
                    if (vValueType == 'n') {
                        for (var i = 0; i < tuftCount; i++) {
                            updateValueExtreme(valueSum[i]);
                        }
                    }
                    else {
                        vMaxval = 100;
                        vMinval = 0;
                    }
                }
            }
            else {
                for (var i = 0, item; item = innerData[i]; i++) {
                    var lValue = null; var vValue = item.value;
                    if (lValueType) {
                        if (item.value.length != 2) {
                            throw new Error(wrongMsgs.WrongData + "'" + item.value + "'" + wrongMsgs.AxisVauleShouldBeDArray);
                        }
                        lValue = item.value[0]; vValue = item.value[1];
                    }
                    if (lValue) {
                        lValue = formatValue(false, lValueType, lValue, i, 0);
                        updateLabelExtreme(lValue);
                    }
                    if (isRange) {
                        for (var j = 0; j <= 1; j++) {
                            var tmpVValue = vValue[j];
                            tmpVValue = formatValue(true, vValueType, tmpVValue, i, j);
                            updateValueExtreme(tmpVValue);
                        }
                    }
                    else {
                        var vValue = formatValue(true, vValueType, vValue, i, lValueType ? 1 : undefined);
                        updateValueExtreme(vValue);
                    }
                }
            }
            var splitpoint = null;
            if (computeSplitPoint) {
                var tmpMin = null; var tmpMax = null;
                for (var i = 0, point; point = splitExtremePoints[i]; i++) {
                    var min = point[0]; var max = point[1];
                    if (tmpMin == null) { tmpMin = max; tmpMax = min; }
                    if (max > tmpMax && (tmpMin > tmpMax || min < tmpMax)) { tmpMax = min; }
                    if (min < tmpMin && (tmpMin > tmpMax || max > tmpMin)) { tmpMin = max; }
                }
                if (vValueType == 'd' || vValueType == 't') {
                    splitpoint = new Date((tmpMin.getTime() + tmpMax.getTime()) / 2);
                    if (vValueType == 'd') { splitpoint = new Date(Date.parse(splitpoint.format('yyyy/MM/dd'))); }
                }
                else {
                    splitpoint = (tmpMin + tmpMax) / 2;
                }
            }
            if (lValueType && options.labelAxis.sort) {
                var asc = function (x, y) {
                    if (y.value) {
                        if (y.value[0] > x.value[0]) { return -1; }
                        else { return 1; }
                    }
                    else {
                        if (y[0] > x[0]) { return -1; }
                        else { return 1; }
                    }
                };
                if (multiple) {
                    for (var i = 0, item; item = innerData[i]; i++) {
                        item.value.sort(asc);
                    }
                }
                else {
                    innerData.sort(asc);
                }
            }
            var tmpCompute = inner._getComputed(1, vValueType, options.valueAxis, vMinval, vMaxval, 6);
            var axisData = { vValueType: vValueType, lValueType: lValueType, heapCompute: heapCompute, multiple: multiple, vMaxval: vMaxval, vMinval: vMinval, vInterval: tmpCompute.interval, vMaxValue: tmpCompute.maxvalue, vMinValue: tmpCompute.minvalue, vScalecount: tmpCompute.scalecount, tuftCount: tuftCount, demanCount: demanCount, splitpoint: splitpoint };
            if (lValueType) {
                tmpCompute = inner._getComputed(0, lValueType, options.labelAxis, lMinval, lMaxval, 6);
                axisData.lValueType = lValueType;
                axisData.lInterval = tmpCompute.interval;
                axisData.lMaxval = lMaxval;
                axisData.lMinval = lMinval;
                axisData.lMaxValue = tmpCompute.maxvalue;
                axisData.lMinValue = tmpCompute.minvalue;
                axisData.lScalecount = tmpCompute.scalecount;
            }
            var _collectValueLabels = function () {
                var labels = [];
                var valueAxisContent = options.valueAxis.content;
                var tmpMinValue = DChart.Methods.CopyInnerValue(axisData.vValueType, axisData.vMinValue);
                for (var i = 0; i <= axisData.vScalecount; i++) {
                    labels[i] = valueAxisContent.call(options, DChart.Methods.AddInnerValue(axisData.vValueType, tmpMinValue, axisData.vInterval * i));
                    tmpMinValue = DChart.Methods.CopyInnerValue(axisData.vValueType, axisData.vMinValue);
                }
                return labels;
            };
            var _collectTextLabels = function () {
                var textlabels = [];
                if (axisData.lValueType) {
                    var labels = [];
                    var content = options.labelAxis.content;
                    if (typeof content == 'function') {
                        var tmpMinValue = DChart.Methods.CopyInnerValue(axisData.lValueType, axisData.lMinValue);
                        for (var i = 0; i <= axisData.lScalecount; i++) {
                            labels[i] = content.call(options.labelAxis, DChart.Methods.AddInnerValue(axisData.lValueType, tmpMinValue, axisData.lInterval * i));
                            tmpMinValue = DChart.Methods.CopyInnerValue(axisData.lValueType, axisData.lMinValue);
                        }
                    }
                    textlabels = labels;
                }
                else {
                    if (axisData.multiple) {
                        textlabels = options.labelAxis.labels || [];
                    }
                    else {
                        for (var i = 0, data; data = inner.innerData[i]; i++) {
                            textlabels[i] = data.text || ' ';
                        }
                        if (textlabels.__only(' ') && options.labelAxis.labels && options.labelAxis.labels.length) {
                            textlabels = options.labelAxis.labels;
                        }
                    }
                }
                return textlabels;
            };
            axisData.vLabels = _collectValueLabels();
            axisData.vScalecount = axisData.vLabels.length - 1;
            axisData.lLabels = _collectTextLabels();
            axisData.lScalecount = axisData.lLabels.length - 1;
            inner.tempData.axisData = axisData;
            return axisData;
        };
        inner._computeAxis = function (valids) {
            if (!valids.AxisValid) { return null; }
            var options = inner.innerOptions;
            var axisData = inner.tempData.axisData;
            var upturnAxis = inner.tempData.upturnAxis;
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var valids = valids || inner._calculateOutersValid();
            var legendSize = valids.legendValid ? inner._computeLegend() : null;
            var titleHeight = inner.canvas.height / 35;
            if (valids.titleValid) { titleHeight = inner._computeTitle(valids).occupyTop; }

            var availableWidth = inner.canvas.width - canvasBorderWidth * 2 - (legendSize ? legendSize.occupyLeft : 0) - (legendSize ? legendSize.occupyRight : 0);
            var availableHeight = inner.canvas.height - canvasBorderWidth * 2 - titleHeight - (legendSize ? legendSize.occupyTop : 0) - (legendSize ? legendSize.occupyBottom : 0);

            var tmpAxisWidth = availableWidth / (upturnAxis ? 8 : DChart.Const.Defaults.AxisYDrawableCut[axisData.vValueType]);
            var tmpAxisHeight = availableHeight / DChart.Const.Defaults.AxisXDrawableCut;
            var labelAxisLength = options.labelAxis.length || (upturnAxis ? tmpAxisWidth : tmpAxisHeight);
            var valueAxisLength = options.valueAxis.length || (upturnAxis ? tmpAxisHeight : tmpAxisWidth);
            var yAxisWidth = upturnAxis ? labelAxisLength : valueAxisLength;
            var xAxisHeight = upturnAxis ? valueAxisLength : labelAxisLength;
            var captionLength = upturnAxis ? yAxisWidth / 8 : (valids.titleValid || legendSize && legendSize.occupyTop > 0 ? xAxisHeight / 8 : titleHeight * 2.5);
            var margin = (valids.legendValid && legendSize.placeY == 'middle' ? captionLength / 2 : yAxisWidth / 3);
            var scaleLineWidth = options.scale.linewidth == null ? 1 : options.scale.linewidth;
            var closeLineWidth = options.close.linewidth || scaleLineWidth || 1;
            var labelAxisLineWidth = options.labelAxis.linewidth == null ? 1 : options.labelAxis.linewidth;
            var valueAxisLineWidth = options.valueAxis.linewidth == null ? 1 : options.valueAxis.linewidth;
            var xAxisLineWidth = upturnAxis ? valueAxisLineWidth : labelAxisLineWidth;
            var yAxisLineWidth = upturnAxis ? labelAxisLineWidth : valueAxisLineWidth;
            var axisValueCut = (upturnAxis ? availableWidth - margin - yAxisWidth - captionLength : availableHeight - xAxisHeight - captionLength) / axisData.vScalecount;
            var crossLength = options.cross.length || valueAxisLength / 15;

            var maxX = inner.canvas.width - canvasBorderWidth - margin - (legendSize ? legendSize.occupyRight : 0) - (upturnAxis ? captionLength : 0);
            var maxY = inner.canvas.height - xAxisHeight - canvasBorderWidth - (legendSize ? legendSize.occupyBottom : 0);
            var minX = upturnAxis ? (maxX - axisData.vScalecount * axisValueCut) : (canvasBorderWidth + yAxisWidth + (legendSize ? legendSize.occupyLeft : 0));
            var minY = upturnAxis ? (canvasBorderWidth + titleHeight + (legendSize && legendSize.occupyTop > 0 ? legendSize.occupyTop : xAxisHeight / 10)) : (maxY - axisData.vScalecount * axisValueCut);

            var multiple = axisData.multiple;
            var labelCount = axisData.lLabels.length || (multiple ? inner.innerData[0].value.length : inner.innerData.length);
            var fromFirstLeft = DChart.Const.AxisFromFirstLeft.__contains(inner.GraphType);
            var startlength = 0;
            var endlength = 0;
            var lMaxLength = upturnAxis ? maxY - minY : maxX - minX;
            var vMaxLength = upturnAxis ? maxX - minX : maxY - minY;
            if (!fromFirstLeft) {
                startlength = options.labelAxis.startlength;
                endlength = options.labelAxis.endlength;
                if (startlength == null && endlength == null) {
                    startlength = lMaxLength / (labelCount + 1 / 3) * 2 / 3;
                    endlength = startlength;
                }
                else if (startlength == null && endlength != null) { startlength = endlength; }
                else if (endlength == null && startlength != null) { endlength = startlength; }
                if (startlength < 0 || endlength < 0 || startlength + endlength > lMaxLength) {
                    var wrongMsgs = DChart.Const.Language[inner.Language];
                    throw new Error(wrongMsgs.WrongParam + wrongMsgs.LabelDistanceExceedMax);
                }
            }
            var startPos = (upturnAxis ? minY : minX) + startlength;
            var labelDistance = (lMaxLength - startlength - endlength) / (labelCount - 1);
            var splitLinePos = null;
            if (DChart.Const.DrawSplitLine.__contains(inner.GraphType)) {
                splitLinePos = (upturnAxis ? minX : minY) + vMaxLength * inner._getFormatDiff(axisData.vValueType, (upturnAxis ? axisData.vMinValue : axisData.vMaxValue), axisData.splitpoint) / inner._getFormatDiff(axisData.vValueType, axisData.vMinValue, axisData.vMaxValue);
            }

            inner.axisSize = {
                labelAxisLength: labelAxisLength, valueAxisLength: valueAxisLength, yAxisWidth: yAxisWidth, xAxisHeight: xAxisHeight,
                minX: Math.ceil(minX), maxX: Math.ceil(maxX), minY: Math.ceil(minY), maxY: Math.ceil(maxY),
                axisValueCut: axisValueCut, crossLength: crossLength,
                scaleLineWidth: scaleLineWidth, closeLineWidth: closeLineWidth, labelAxisLineWidth: labelAxisLineWidth, valueAxisLineWidth: valueAxisLineWidth, xAxisLineWidth: xAxisLineWidth, yAxisLineWidth: yAxisLineWidth,
                startPos: startPos, labelDistance: labelDistance, splitLinePos: splitLinePos
            };
            return inner.axisSize;
        };
        inner._createAxis = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.AxisValid) { return; }
            inner.coordinates.axis = {};
            var options = inner.innerOptions;
            var canvasBorderWidth = options.background.borderwidth || 0;
            if (typeof options.valueAxis.content != 'function') { return; }
            var axisData = inner.tempData.axisData;
            var axisSize = inner.axisSize || inner._computeAxis(valids);
            var upturnAxis = inner.tempData.upturnAxis;
            var vTimeType = axisData.vValueType == 'd' || axisData.vValueType == 't';
            var lTimeType = axisData.lValueType == 'd' || axisData.lValueType == 't';

            var vfontsize = options.valueAxis.fontsize || (upturnAxis ? 1.3 : 1) * (axisSize.valueAxisLength - axisSize.valueAxisLineWidth) / (vTimeType ? 7 : 5);
            var vfontweight = options.valueAxis.fontweight || 'normal';
            var vfontfamily = options.valueAxis.fontfamily || options.fontFamily || DChart.Const.Defaults.FontFamily;
            var vLabelFontColor = options.valueAxis.fontcolor;
            var vLineColor = options.valueAxis.linecolor || DChart.Const.Defaults.AxisLineColor;
            var vLabelStartX = (options.cross.show ? axisSize.crossLength : 3) + axisSize.valueAxisLineWidth + 3;

            var formatRotate = function (rotate, inYAxis, labels, fontweight, fontsize, fontfamily) {
                if (rotate == null) {
                    rotate = 0;
                    var overlap = true;
                    while (overlap) {
                        var tmpOverlap = false;
                        var cosx = Math.cos(rotate * Math.PI);
                        var sinx = Math.abs(rotate * Math.PI);
                        for (var i = 0; i <= labels.length - 1; i++) {
                            var length1 = inner.DrawFigures.measureText(labels[i], fontweight, fontsize, fontfamily);
                            if (inYAxis) {
                                if (length1 * cosx > axisSize.yAxisWidth - vLabelStartX) {
                                    tmpOverlap = true; break;
                                }
                            }
                            else {
                                var length0 = i == 0 ? 0 : inner.DrawFigures.measureText(labels[i - 1], fontweight, fontsize, fontfamily);
                                var distance = upturnAxis ? axisSize.valueAxisLength : axisSize.labelDistance;
                                if (i > 0 && distance * sinx < fontsize && (length1 + length0 > 2 * distance / cosx)) {
                                    tmpOverlap = true; break;
                                }
                            }
                        }
                        overlap = tmpOverlap;
                        if (tmpOverlap) {
                            rotate -= 0.01;
                        }
                    }
                }
                return rotate;
            };
            var drawValueAxisLabels = function (words, x, y, first) {
                var labels = axisData.vLabels;
                var contentX = axisSize.minX - vLabelStartX;
                var contentY = axisSize.maxY + (options.cross.show ? axisSize.crossLength : 3) + axisSize.valueAxisLineWidth + 3 + vfontsize;
                var rotate = formatRotate(options.valueAxis.fontrotate, !upturnAxis, labels, vfontweight, vfontsize, vfontfamily);
                inner.coordinates.axis.vlabels = [];
                for (var i = 0; i <= axisData.vScalecount; i++) {
                    if (upturnAxis) {
                        var centerX = axisSize.minX + i * axisSize.axisValueCut;
                        var textLength = inner.DrawFigures.createText(labels[i], centerX, contentY, 'center', vfontweight, vfontsize, vfontfamily, vLabelFontColor, rotate, 'right');
                        inner.coordinates.axis.vlabels[i] = { index: i, left: centerX - textLength / 2, right: centerX + textLength / 2, top: contentY - vfontsize, bottom: contentY, fontsize: vfontsize, length: textLength };
                    }
                    else {
                        var bottom = axisSize.maxY - i * axisSize.axisValueCut + axisSize.scaleLineWidth / 2 + vfontsize / 3;
                        var textLength = inner.DrawFigures.createText(labels[i], contentX, bottom, 'right', vfontweight, vfontsize, vfontfamily, vLabelFontColor, rotate);
                        inner.coordinates.axis.vlabels[i] = { index: i, left: contentX - textLength, right: contentX, top: bottom - vfontsize, bottom: bottom, fontsize: vfontsize, length: textLength };
                    }
                }
            };
            var drawValueAxisCrosses = function () {
                if (!options.cross.show) { return; }
                var drawscalebackcolor = options.scale.backcolors && options.scale.backcolors.length > 1;
                var linewidth = options.cross.linewidth;
                var linecolor = options.cross.linecolor || vLineColor;
                var crossLength = axisSize.crossLength;
                if (upturnAxis) {
                    var startY = axisSize.maxY + axisSize.valueAxisLineWidth;
                    var endY = axisSize.maxY + axisSize.valueAxisLineWidth + axisSize.crossLength;
                    var linecut = Math.floor((axisSize.scaleLineWidth + 0.1) / 2);
                    for (var i = 1; i <= axisData.vScalecount; i++) {
                        var x = axisSize.maxX - i * axisSize.axisValueCut;
                        if (i == axisData.vScalecount && x < axisSize.minX) { x = axisSize.minX; }
                        if (drawscalebackcolor && i < axisData.vScalecount) { x -= linecut; }
                        inner.DrawFigures.createLine(x + axisSize.axisValueCut, startY, x + axisSize.axisValueCut, endY, options.cross.linewidth, linecolor);
                    }
                    inner.DrawFigures.createLine(axisSize.minX - 1, startY, axisSize.minX - 1, endY, options.cross.linewidth, linecolor);
                }
                else {
                    var endX = axisSize.minX - axisSize.valueAxisLineWidth;
                    var startX = endX - axisSize.crossLength;
                    for (var i = 1; i <= axisData.vScalecount; i++) {
                        var y = axisSize.maxY - i * axisSize.axisValueCut;
                        if (drawscalebackcolor) { y += axisSize.scaleLineWidth / 2; }
                        inner.DrawFigures.createLine(startX, y, endX, y, linewidth, linecolor);
                    }
                    inner.DrawFigures.createLine(startX, axisSize.maxY + 1, endX, axisSize.maxY + 1, linewidth, linecolor);
                }
            }; if (axisSize.valueAxisLineWidth && axisSize.valueAxisLineWidth > 0) {
                if (upturnAxis) {
                    var y = axisSize.maxY + axisSize.valueAxisLineWidth / 2;
                    inner.DrawFigures.createLine(axisSize.minX - axisSize.labelAxisLineWidth, y, axisSize.maxX + axisSize.valueAxisLength / 20, y, axisSize.valueAxisLineWidth, vLineColor);
                }
                else {
                    var x = axisSize.minX - axisSize.valueAxisLineWidth / 2;
                    inner.DrawFigures.createLine(x, axisSize.maxY + axisSize.labelAxisLineWidth + 1, x, axisSize.minY - axisSize.valueAxisLength / 20, axisSize.valueAxisLineWidth, vLineColor);
                }
            }
            var drawLabelAxisLabels = function () {
                var labels = axisData.lLabels;
                var fontsize = options.labelAxis.fontsize || (lTimeType ? axisSize.xAxisHeight / 6 : axisSize.xAxisHeight / 4.5);
                var fontweight = options.labelAxis.fontweight || vfontweight;
                var fontfamily = options.labelAxis.fontfamily || vfontfamily;
                var fontcolor = options.labelAxis.fontcolor || vLabelFontColor;
                var rotate = formatRotate(options.labelAxis.fontrotate, upturnAxis, labels, fontweight, fontsize, fontfamily);
                inner.coordinates.axis.llabels = [];
                for (var i = 0, label; label = labels[i]; i++) {
                    if (upturnAxis) {
                        var right = axisSize.minX - axisSize.valueAxisLineWidth - fontsize * (rotate < 0 ? 1 : 0.5);
                        var bottom = axisSize.startPos + (axisSize.labelDistance) * i + fontsize / 2;
                        var textLength = inner.DrawFigures.createText(label, right, bottom, 'right', fontweight, fontsize, fontfamily, fontcolor, rotate);
                        inner.coordinates.axis.llabels[i] = { index: i, left: right - textLength, right: right, top: bottom - fontsize, bottom: bottom, fontsize: fontsize, length: textLength };
                    }
                    else {
                        var centerX = axisSize.startPos + (axisSize.labelDistance) * i;
                        var bottom = axisSize.maxY + axisSize.labelAxisLineWidth + fontsize * 1.2;
                        var textLength = inner.DrawFigures.createText(label, centerX, bottom, 'center', fontweight, fontsize, fontfamily, fontcolor, rotate, 'right');
                        inner.coordinates.axis.llabels[i] = { index: i, left: centerX - textLength / 2, right: centerX + textLength / 2, top: bottom - fontsize, bottom: bottom, fontsize: fontsize, length: textLength };
                    }
                }
            };
            if (axisSize.labelAxisLineWidth && axisSize.labelAxisLineWidth > 0) {
                if (upturnAxis) {
                    var x = axisSize.minX - axisSize.labelAxisLineWidth / 2;
                    inner.DrawFigures.createLine(x, axisSize.minY - (options.close.show ? axisSize.closeLineWidth : 0), x, axisSize.maxY, axisSize.labelAxisLineWidth, options.labelAxis.linecolor || DChart.Const.Defaults.AxisLineColor);
                }
                else {
                    var y = axisSize.maxY + axisSize.labelAxisLineWidth / 2 + 1;
                    inner.DrawFigures.createLine(axisSize.minX - 1, y, axisSize.maxX + (options.close.show ? axisSize.closeLineWidth : 0), y, axisSize.labelAxisLineWidth, options.labelAxis.linecolor || DChart.Const.Defaults.AxisLineColor);
                }
            }
            var drawCaption = function () {
                if (typeof options.caption.content != 'string') { return; }
                var size = options.caption.fontsize || (vfontsize + (vTimeType ? 2 : -1));
                if (upturnAxis) {
                    var centerX = Math.min(axisSize.maxX + size * 1.5, inner.canvas.width - canvasBorderWidth - size);
                    var centerY = axisSize.maxY + axisSize.xAxisLineWidth / 2;
                    var textlength = inner.DrawFigures.createText(options.caption.content, centerX, centerY, 'center', options.caption.fontweight, size, options.caption.fontfamily, options.caption.fontcolor || vLabelFontColor, 0.5);
                    inner.coordinates.axis.caption = { left: centerX, right: centerX + size, top: centerY - textlength / 2, bottom: centerY + textlength / 2, fontsize: size, length: textlength };
                }
                else {
                    var centerX = axisSize.minX - axisSize.valueAxisLineWidth / 2;
                    var bottom = axisSize.minY - size;
                    var textlength = inner.DrawFigures.createText(options.caption.content, centerX, bottom, 'center', options.caption.fontweight, size, options.caption.fontfamily, options.caption.fontcolor || vLabelFontColor);
                    inner.coordinates.axis.caption = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - size, bottom: bottom, fontsize: size, length: textlength };
                }
            };
            var drawCloseLine = function () {
                if (!(options.close.show && axisSize.closeLineWidth && axisSize.closeLineWidth > 0)) { return; }
                var linecolor = options.close.linecolor || options.scale.linecolor || DChart.Const.Defaults.ScaleLineColor;
                if (upturnAxis) {
                    var closeY = axisSize.minY - axisSize.closeLineWidth / 2;
                    inner.DrawFigures.createLine(axisSize.minX, closeY, axisSize.maxX, closeY, axisSize.closeLineWidth, linecolor);
                }
                else {
                    var closeX = axisSize.maxX + axisSize.closeLineWidth / 2;
                    inner.DrawFigures.createLine(closeX, axisSize.maxY + 1, closeX, axisSize.minY, axisSize.closeLineWidth, linecolor);
                }
            };
            var drawYAxisTitle = function () {
                var ops = options.yAxisTitle;
                if (!ops.content) { return; }
                var fontsize = ops.fontsize || axisSize.yAxisWidth / 5;
                var fontweight = ops.fontweight || 'bold';
                var centerY = (axisSize.minY + axisSize.maxY) / 2;
                var right = axisSize.minX - axisSize.yAxisLineWidth - (axisSize.yAxisWidth - axisSize.yAxisLineWidth) * (ops.titlelocation || (upturnAxis ? 0.75 : DChart.Const.Defaults.AxisYTitleLocation[axisData.vValueType]));
                var textlength = inner.DrawFigures.createText(ops.content, right, centerY, 'center', fontweight, fontsize, ops.fontfamily, ops.fontcolor, -0.5);
                inner.coordinates.axis.yAxisTitle = { top: centerY - textlength / 2, bottom: centerY + textlength / 2, left: right - fontsize, right: right, fontsize: fontsize, length: textlength };
            };
            var drawXAxisTitle = function () {
                var ops = options.xAxisTitle;
                if (!ops.content) { return; }
                var fontsize = ops.fontsize || axisSize.xAxisHeight / 5;
                var fontweight = ops.fontweight || 'bold';
                var centerX = inner.canvas.width / 2;
                var bottom = axisSize.maxY + axisSize.xAxisLineWidth + (axisSize.xAxisHeight - axisSize.xAxisLineWidth) * (ops.titlelocation || (upturnAxis ? 0.75 : DChart.Const.Defaults.AxisXTitleLocation[axisData.vValueType]));
                var textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', fontweight, fontsize, ops.fontfamily, ops.fontcolor);
                inner.coordinates.axis.xAxisTitle = { top: bottom - fontsize, bottom: bottom, left: centerX - textlength / 2, right: centerX + textlength / 2, fontsize: fontsize, length: textlength };
            };
            drawCaption();
            drawYAxisTitle();
            drawXAxisTitle();
            drawValueAxisLabels();
            drawLabelAxisLabels();
            drawValueAxisCrosses();
            drawCloseLine();
            inner.coordinates.axis.yAxis = { width: axisSize.yAxisWidth };
            inner.coordinates.axis.xAxis = { height: axisSize.xAxisHeight };
        };
        inner._createFooter = function () {
            var ops = inner.innerOptions.footer;
            if (!ops.content) { return; }
            var canvasSize = inner.coordinates.canvas;
            var fontsize = ops.fontsize || Math.min(canvasSize.height / 25, canvasSize.width / 50);
            var bottom = canvasSize.height * (1 - (ops.bottomdistance || DChart.Const.Defaults.FooterBottomDistance)) - canvasSize.borderwidth - fontsize / 2;
            var right = canvasSize.width * (1 - (ops.rightdistance || DChart.Const.Defaults.FooterRightDistance)) - canvasSize.borderwidth;
            var fontcolor = ops.fontcolor || DChart.Const.Defaults.FooterFontColor;
            var textlength = inner.DrawFigures.createText(ops.content, right, bottom, 'right', ops.fontweight, fontsize, ops.fontfamily, fontcolor);
            inner.coordinates.footer = { top: bottom - fontsize, bottom: bottom, right: right, left: right - textlength, fontsize: fontsize, length: textlength };
        };
        inner._createScales = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.AxisValid) { return; }
            var options = inner.innerOptions;
            var axisSize = inner.axisSize || inner._computeAxis(valids);
            var axisData = inner.tempData.axisData;
            var scaleLineWidth = axisSize.scaleLineWidth;
            var linecut = Math.floor((scaleLineWidth + 0.1) / 2);
            var scaleLineColor = options.scale.linecolor || DChart.Const.Defaults.ScaleLineColor;
            var scaleBackColors = options.scale.backcolors;
            var upturnAxis = inner.tempData.upturnAxis;
            if (scaleBackColors && scaleBackColors.length == 1) {
                inner.DrawFigures.createRectangleFill(axisSize.minX, axisSize.minY, axisSize.maxX - axisSize.minX, axisSize.maxY - axisSize.minY, scaleBackColors[0]);
            }
            for (var i = 1; i <= axisData.vScalecount; i++) {
                if (upturnAxis) {
                    var x = axisSize.maxX - i * axisSize.axisValueCut;
                    if (i == axisData.vScalecount && x < axisSize.minX) { x = axisSize.minX; }
                    if (scaleBackColors && scaleBackColors.length > 1) {
                        var color = scaleBackColors.length ? scaleBackColors[(i - 1) % scaleBackColors.length] : null;
                        if (i < axisData.vScalecount) { x -= linecut; }
                        inner.DrawFigures.createRectangleFill(x, axisSize.minY, axisSize.axisValueCut - linecut, axisSize.maxY - axisSize.minY, color);
                    }
                    if (scaleLineWidth > 0) {
                        inner.DrawFigures.createLine(x + axisSize.axisValueCut, axisSize.minY, x + axisSize.axisValueCut, axisSize.maxY, scaleLineWidth, scaleLineColor);
                    }
                }
                else {
                    var y = axisSize.maxY - i * axisSize.axisValueCut;
                    if (scaleBackColors && scaleBackColors.length > 1) {
                        var color = scaleBackColors.length ? scaleBackColors[(i - 1) % scaleBackColors.length] : null;
                        y += scaleLineWidth / 2;
                        var height = axisSize.axisValueCut - scaleLineWidth / 2;
                        if (i == 1) { height += 1; }
                        inner.DrawFigures.createRectangleFill(axisSize.minX, y, axisSize.maxX - axisSize.minX, height, color);
                    }
                    if (scaleLineWidth > 0) {
                        inner.DrawFigures.createLine(axisSize.minX, y, axisSize.maxX, y, scaleLineWidth, scaleLineColor);
                    }
                }
            }
            if (options.scale.drawvertical) {
                var drawCloseLine = options.close.show && axisSize.closeLineWidth && axisSize.closeLineWidth > 0;
                for (var i = 1; i < axisData.lScalecount + (drawCloseLine ? 0 : 1) ; i++) {
                    var pos = axisSize.startPos + i * axisSize.labelDistance;
                    if (upturnAxis) {
                        if (scaleLineWidth > 0) {
                            inner.DrawFigures.createLine(axisSize.minX, pos, axisSize.maxX, pos, scaleLineWidth, scaleLineColor);
                        }
                    }
                    else {
                        if (scaleLineWidth > 0) {
                            inner.DrawFigures.createLine(pos, axisSize.minY, pos, axisSize.maxY + 1, scaleLineWidth, scaleLineColor);
                        }
                    }
                }
            }
            if (DChart.Const.DrawSplitLine.__contains(inner.GraphType) && options.splitLine.show) {
                var linecolor = options.splitLine.linecolor;
                var linewidth = options.splitLine.linewidth;
                if (upturnAxis) {
                    inner.DrawFigures.createLine(axisSize.splitLinePos, axisSize.minY, axisSize.splitLinePos, axisSize.maxY, linewidth || 1, linecolor);
                }
                else {
                    inner.DrawFigures.createLine(axisSize.minX, axisSize.splitLinePos, axisSize.maxX, axisSize.splitLinePos, linewidth || 1, linecolor);
                }
            }
        };
        inner._calculateOutersValid = function () {
            var ops = inner.innerOptions;
            var legendValid = ops.legend.show;
            if (inner.tempData.axisData && !inner.tempData.axisData.multiple || inner.tempData.legendInvalid) {
                legendValid = false;
            }
            var titleValid = ops.title && ops.title.show && ops.title.content;
            var subTitleValid = titleValid && ops.subTitle && ops.subTitle.show && ops.subTitle.content;
            var AxisValid = DChart.Const.DrawAxis.__contains(inner.GraphType);
            return { legendValid: legendValid, titleValid: titleValid, subTitleValid: subTitleValid, AxisValid: AxisValid };
        };
        inner._createAssists = function (valids) {
            inner._createBackground();
            inner._createTitle(valids);
            inner._createLegend();
            inner._createAxis(valids);
            inner._createFooter();
        };
        inner._startDrawAndAnimation = function (drawData, mouseEvents) {
            var options = inner.innerOptions;
            var animFrameAmount = (options.animation) ? 1 / DChart.Methods.CapValue(options.animationSteps, 100, 1) : 1;
            var easingFunction = DChart.Const.AnimationAlgorithms[options.animationEasing];
            var percentAnimComplete = (options.animation) ? 0 : 1;
            var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
function (callback) {
    window.setTimeout(callback, 1000 / 60);
};
            var valids = inner._calculateOutersValid();
            inner.ClearBackGround();
            if (!inner.tempData.recreateAssists) { inner._createAssists(valids); }
            var coordinate = inner._getDrawableCoordinate();
            if (inner.onBeforeAnimation) { inner.onBeforeAnimation(); }
            var animLoop = function () {
                percentAnimComplete += animFrameAmount;
                if (inner.onAnimation) { inner.onAnimation(percentAnimComplete); }
                var easeAdjustedAnimationPercent = (options.animation) ? DChart.Methods.CapValue(easingFunction(percentAnimComplete), null, 0) : 1;
                inner._clearDrawable(coordinate);
                if (!valids.AxisValid || inner.tempData.recreateAssists) { inner._createAssists(valids); }
                if (options.scaleOverlay) {
                    drawData(easeAdjustedAnimationPercent, percentAnimComplete);
                    inner._createScales(valids);
                }
                else {
                    inner._createScales(valids);
                    drawData(easeAdjustedAnimationPercent, percentAnimComplete);
                }
                if (percentAnimComplete < 1) {
                    requestAnimationFrame(animLoop);
                }
                else {
                    if (options.supportMouseEvents && typeof mouseEvents == 'function') {
                        mouseEvents();
                    }
                    if (typeof options.onAnimationComplete == 'function') { options.onAnimationComplete(); }
                    if (inner.onFinish) { inner.onFinish(); }
                }
            };
            requestAnimationFrame(animLoop);
        };
        inner._computeRadiusForPies = function (options) {
            var coordinate = inner._getDrawableCoordinate();
            var offX = DChart.Methods.IsNumber(options.offX) ? options.offX : 0;
            var offY = DChart.Methods.IsNumber(options.offY) ? options.offY : 0;
            var halfXLength = (coordinate.maxX - coordinate.minX) / 2;
            var halfYLength = (coordinate.maxY - coordinate.minY) / 2;
            var minAvailableLength = Math.min(halfXLength, halfYLength);
            var margin = options.margin == null && (options.labels || options.outerLabel.show) ? minAvailableLength / 6 : 1;
            if (DChart.Methods.IsNumber(options.margin) && options.margin > 0) {
                margin = options.margin;
            }
            if (offX < 0 && halfXLength < -offX) { offX = -halfXLength / 2; }
            if (offX > 0 && halfXLength < offX) { offX = halfXLength / 2; }
            if (offY < 0 && halfYLength < -offY) { offY = -halfYLength / 2; }
            if (offY > 0 && halfYLength < offY) { offY = halfYLength / 2; }
            var maxRadius = Math.min(halfXLength - Math.abs(offX), halfYLength - Math.abs(offY)) - margin;
            return { coordinate: coordinate, maxRadius: maxRadius, centerX: coordinate.centerX + offX, centerY: coordinate.centerY + offY };
        };
        inner._getMouseLoction = function (e) {
            if (e.offsetX != null) {
                return { X: e.offsetX, Y: e.offsetY };
            }
            else {
                var getPageCoord = function (element) {
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
        inner._computeSegmentTotal = function () {
            var minval = null;
            var maxval = null;
            var segmentTotal = 0;
            var segmentTotals = [];
            var dimensionCount = inner.innerData[0].value.length;
            var multiple = dimensionCount != undefined;
            var checkNumber = function (tmpVal) {
                if (typeof tmpVal != 'number') {
                    throw new Error(inner._messages.WrongData + '\'' + tmpVal + '\'' + inner._messages.NeedNumberData);
                }
                else if (tmpVal < 0) {
                    throw new Error(inner._messages.WrongData + '\'' + tmpVal + '\'' + inner._messages.DataMustGreaterThanZero);
                }
                else {
                    if (maxval == null) { minval = maxval = tmpVal; }
                    else {
                        if (tmpVal > maxval) { maxval = tmpVal; }
                        else if (tmpVal < minval) { minval = tmpVal; }
                    }
                    return tmpVal;
                }
            };
            for (var k = 0; k < (multiple ? dimensionCount : 1) ; k++) {
                var tmpTotal = 0;
                for (var i = 0, item; item = inner.innerData[i]; i++) {
                    var tmpVal = checkNumber(multiple ? item.value[k] : item.value);
                    segmentTotal += tmpVal;
                    tmpTotal += tmpVal;
                }
                segmentTotals[k] = tmpTotal;
            }
            return { multiple: multiple, segmentTotal: segmentTotal, segmentTotals: segmentTotals, minval: minval, maxval: maxval };
        };
        inner.Initial();
    };
    return core;
};