//以原型继承方式继承方法
Function.prototype.__extends = function (objs) {
    for (var obj in objs) {
        this.prototype[obj] = objs[obj];
    }
    return this;
};
//格式化日期
Date.prototype.format = function (fmt) {
    var o =
    {
        "M+": this.getMonth() + 1,                   //月份 
        "d+": this.getDate(),                        //日 
        "h+": this.getHours(),                       //小时 
        "m+": this.getMinutes(),                     //分 
        "s+": this.getSeconds(),                     //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()                  //毫秒 
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
//计算时差
Date.prototype.shortOf = function (interval, endTime) {
    switch (interval) {
        //秒差                                                                                                                                       
        case "s":
            return parseInt((endTime - this) / 1000);
            //分差
        case "n":
            return parseInt((endTime - this) / 60000);
        case "h":
            return parseInt((endTime - this) / 3600000);
        case "d":
            return parseInt((endTime - this) / 86400000);
            //周差  
        case "w":
            return parseInt((endTime - this) / (86400000 * 7));
            //月差            
        case "m":
            return (endTime.getMonth() + 1) + ((endTime.getFullYear() - this.getFullYear()) * 12) - (this.getMonth() + 1);
        case "y":
            return endTime.getFullYear() - this.getFullYear();
        default:
            return undefined;
    }
};
//拷贝数组（只有数组元素都为值类型才算深拷贝）
Array.prototype.__copy = function () {
    var newArray = [];
    for (var i = 0; i < this.length; i++) {
        newArray.push(this[i]);
    }
    return newArray;
};
//给数组的每个元素都乘以某个数值（注意：！！要求数组的每个元素都必须为Number类型）
Array.prototype.__multiply = function (param) {
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i] * param;
    }
};
//判断数组中是否存在某个值
Array.prototype.__contains = function (val) {
    var contain = false;
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) { contain = true; break; }
    }
    return contain;
};
//判断数组是否只包含一个相同的值
Array.prototype.__only = function (val) {
    var judge = true;
    for (var i = 0; i < this.length; i++) {
        if (this[i] !== val) { judge = false; break; }
    }
    return judge;
};


//创建一个window对象下的核心对象DChart
window.DChart = {};
//公共方法
DChart.Methods = {
    //判断一个变量是否为普通的Object对象（非null、undefined、Array）
    JudgeNormalObject: function (obj) {
        return obj && typeof obj == 'object' && !DChart.Methods.IsArray(obj);
    },
    //深度拷贝（对象内的子对象全级拷贝，而不仅是一级拷贝）
    DeepCopy: function (oldops) {
        var result = {};
        var deepDig = function (res, obj, path) {
            backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                //当子对象为普通对象且不再特殊配置时(不为null)，进行递归“挖掘”
                if (DChart.Methods.JudgeNormalObject(obj[attrname]) && !DChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                    res[attrname] = {};
                    deepDig(res[attrname], obj[attrname], path);
                }
                    //若为number、string、null等等，则直接赋值
                else {
                    if (obj.hasOwnProperty(attrname)) {
                        res[attrname] = obj[attrname];
                    }
                }
                //还原为之前的path
                path = backupPath;
            }
        };
        deepDig(result, oldops, '');
        return result;
    },
    //扩展并覆盖对象属性
    //深度复制defaults对象，深度遍历overrides对象属性，若某属性在defaults中不存在，则忽略该属性；若已存在，则在复制对象中覆盖该属性。
    Override: function (defaults, overrides) {
        var result = DChart.Methods.DeepCopy(defaults);
        var deepDig = function (res, obj, path) {
            //path：记录递归后的子对象的相对于overrides的相对地址
            var backupPath = path;
            for (var attrname in obj) {
                path += attrname + '.';
                //首要条件是：原对象必须有相同名称的子对象，且该属性为对象属性(非原型属性)；
                if (res[attrname] !== undefined && obj.hasOwnProperty(attrname)) {
                    //继续递归条件：覆盖对象鱼被覆盖对象都必须为object类型的对象，并且未在“例外”中注册
                    if (DChart.Methods.JudgeNormalObject(obj[attrname]) && DChart.Methods.JudgeNormalObject(res[attrname]) && !DChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                        deepDig(res[attrname], obj[attrname], path);
                    }
                    else {
                        res[attrname] = obj[attrname];
                    }
                }
                //还原为之前的path
                path = backupPath;
            }
        };
        deepDig(result, overrides, '');
        return result;
    },
    //扩展并覆盖对象属性
    //深度复制defaults对象，深度遍历extendes对象属性，若某属性在defaults中不存在，则添加至复制对象；若已存在，则在复制对象中覆盖该属性。
    Extend: function (defaults, extendes) {
        var result = DChart.Methods.DeepCopy(defaults);
        var deepDig = function (res, obj, path) {
            var backupPath = path;
            for (var attrname in obj) {
                //判断条件：该属性为对象属性(非原型属性)；
                if (obj.hasOwnProperty(attrname)) {
                    if (DChart.Methods.JudgeNormalObject(obj[attrname]) && !DChart.Const.Exceps.__contains(path.substring(0, path.length - 1))) {
                        //如果该属性不为Object类型，则将该属性设置为空对象{}，并继续递归
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
    //获取特定范围内的数字，如果该数字大于规定最大值，则返回该最大值；如果小于最小值则返回最小值；否则返回本身
    CapValue: function (valueToCap, maxValue, minValue) {
        if (DChart.Methods.IsNumber(maxValue) && valueToCap > maxValue) { return maxValue; }
        if (DChart.Methods.IsNumber(minValue) && valueToCap < minValue) { return minValue; }
        return valueToCap;
    },
    //生成随机字符串
    GetRandomString: function () {
        return Math.random().toString().substring(2);
    },
    //计算某点相对于另一点的角度，范围转化为-PI到PI
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
    //判断某角度是否在某角度区间上（去除+/-2PI的因素）
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
    //根据值类别，复制一个值（因为当值类型为日期时，直接使用minvalue会使该发生变化，影响后续使用）
    //d：日期格式、t：时间（同样是日期格式）、n：普通数字、p：百分数（内部使用还是转化为普通数字）
    CopyInnerValue: function (valueType, value) {
        if (valueType == 'd' || valueType == 't') {
            return new Date(value.getTime());
        }
        return value;
    },
    //根据当前的值类别，为某个值增加一个数
    //d：日期格式、t：时间（同样是日期格式）、n：普通数字、p：百分数（内部使用还是转化为普通数字）
    AddInnerValue: function (valueType, value, add) {
        if (valueType == 'd') {
            //日期，则增加天数
            value = value.addDays(add);
        }
        else if (valueType == 't') {
            //时间，则增加分钟数
            value = value.addMinutes(add);
        }
        else {
            value += add;
        }
        return value;
    },
    //根据线宽来微调整x、y的大小，以真正绘制出所需要的线宽（不会把linewidth=1绘制成2）
    //如果绘制直线，则y为undefined；如果绘制方形边框，则x与y值都不为空
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
    //判断两个对象是否含有相同的值
    //fields:由待比较的字段名组成的数组
    ObjectHaveSameValues: function (obj1, obj2, fields) {
        var same = true;
        for (var i = 0, field; field = fields[i]; i++) {
            if (obj1[field] !== obj2[field]) { same = false; break; }
        }
        return same;
    },
    //判断对象是否为数组
    IsArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    //判断是否为有效数字
    IsNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    //判断字符串是否为正确的颜色表达式
    IsColor: function (color) {
        return DChart.Const.RegExps.HexColor.test(color) || DChart.Const.RegExps.RGBColor.test(color) || DChart.Const.RegExps.RGBAColor.test(color);
    }
};

DChart.Const = {
    //语言设置
    Language: {
        CN: {
            WrongParam: '参数错误！',
            WrongData: '数据错误！',
            WrongSet: '设置错误！',
            NeedDiv: '需传入一个div节点元素或其id。',
            DataMustBeArray: '数据不能为空且必须为数组格式。',
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
            ValueTypeMustBeNumberOrPercent: '值轴的数据类型必须为n或p。',
            AxisVauleShouldBeDArray: '数据必须为二维数组（第一个元素为文本轴值，第二个元素为值轴值）。',
            DataMustGreaterThanZero: '数据必须为不小于零的数字。',
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
            WrongLegendSet: '错误的图例位置设置，不允许X和Y方向上都居中或者当type为\"row\"时Y方向居中。'
        },
        EN: {
            WrongParam: 'Wrong parameter!',
            WrongData: 'Wrong data!',
            WrongSet: 'Wrong set！',
            NeedDiv: 'A div DOM element or its id is needed.',
            DataMustBeArray: 'data must not be empty and be an array.',
            HexColorMalformed: 'Hex color expression is wrong.',
            RGBColorMalformed: 'Rgb color expression is wrong.',
            RGBAChangeTransparencyWrongParam: 'RGBA expression is wrong，or transparency number is unqualified, it must be >=0 and <=1.',
            NeedDateData: 'Data must be a date format.',
            NeedNumberData: 'Data must be a number format.',
            OuterRadiusShouldBigger: 'Ring graphic outer radius should be larger than the internal radius',
            AxisMaxLessThanMin: 'The maximum value set of axis should be greater than the minimum value.',
            AxisMaxLessThanActual: 'The maximum value set of axis should be greater than the actual maximum value.',
            AxisMinMoreThanActual: 'The minimum value set of axis should be less than the actual minimum value.',
            LabelAxisValueTypeCannotBePercent: 'The valueType of text-axis cannot be percent。',
            ValueTypeMustBeNumberOrPercent: 'The valueType of value-axis must be n or p.',
            AxisVauleShouldBeDArray: 'Data must be double-array（first value for label axis，second for value axis）',
            DataMustGreaterThanZero: 'Data must not be less than zero.',
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
            WrongLegendSet: 'Wrong legend position sets, direction X and direction Y cannot be center(middle) at the same time, and when type is \"row\" direction Y cannot be middle.'
        }
    },
    //自定义css样式(以class的形式)
    CustomCss: {
        tip_blue: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(13, 142, 207); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(13, 142, 207); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_red: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(176, 23,  31); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(176, 23,  31); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_dark: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(79 , 79, 79  ); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(79 , 79, 79  ); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_purple: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(138,43,226); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(138,43,226); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_yellow: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid rgb(255,128,0); border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(255,128,0); opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}',
        tip_bisque: '{box-shadow: 0px 0px 4px rgb(102, 102, 102); border: 2px solid #BEBEBE; border-radius: 5px 5px 5px 5px; position: absolute; z-index: 999; text-align: left; padding: 4px 5px; cursor: default; background-color: rgba(239, 239, 239, 0.85); font-size: 12px; color: rgb(190,190,190);; opacity: 1; transition: opacity 0.3s ease-out 0s, top 0.1s ease-out 0s, left 0.1s ease-out 0s; top: 245.66px; left: 308.333px; visibility: visible;}'
    },
    //动画函数
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
    //正则表达式
    RegExps: {
        //匹配代表“空白”含义的字符，包括空格、换行等等
        BlankCharacter: /\s/g,
        //匹配十六进制颜色表达式，如'#12ab54'
        HexColor: /^#[a-fA-F0-9]{5}[a-fA-F0-9]$/,
        //匹配rgb颜色表达式，如'rgba(255,255,255)'
        RGBColor: /^(rgb)\([0-9]{0,3},[0-9]{0,3},[0-9]{0,3}\)/,
        //匹配rgba颜色表达式，如'rgba(255,255,255,0.5)'
        RGBAColor: /^(rgba)\([0-9]{0,3},[0-9]{0,3},[0-9]{0,3},(0.)?[0-9]+\)/,
        //有返回值的function
        ReturnFunction: /function *\(.*\) *\{.*return.*\}$/,
        //不要求有返回值的function
        NormalFunction: /function *\(.*\) *\{.*\}$/
    },
    //在Core中使用或所有组件共有的默认值，约定：
    //1，方法(function)不做为默认值
    //2，各个组件拥有自己的Default值
    Defaults: {
        //默认纯色填充颜色
        FillColors: [
            'rgba(47,79,79,1)',
            'rgba(0,128,128,1)',
            'rgba(0,206,209,1)',
            'rgba(112,128,144,1)',
            'rgba(30,144,255,1)',
            'rgba(39,64,139,1)',
            'rgba(93,71,139,1)',
            'rgba(188,143,143,1)',
            'rgba(178,34,34,1)',
            'rgba(255,140,0,1)',
            'rgba(139,134,130,1)',
            'rgba(70,130,180,1)',
            'rgba(65,105,225,1)',
            'rgba(220,220,220,1)',
            'rgba(100,149,23,1)',
            'rgba(72,209,204,1)',
            'rgba(0,191,255,1)',
            'rgba(176,196,222,1)',
            'rgba(255,182,193,1)',
            'rgba(30,144,255,1)'
        ],
        //默认透明填充颜色
        TransparentColors: [
            'rgba(39,64,139,0.3)',
            'rgba(220,220,220,0.3)',
            'rgba(151,187,205,0.3)',
            'rgba(0,206,209,0.3)',
            'rgba(100,149,23,0.3)',
            'rgba(112,128,144,0.3)',
            'rgba(30,144,255,0.3)',
            'rgba(93,71,139,0.3)',
            'rgba(188,143,143,0.3)',
            'rgba(178,34,34,0.3)',
            'rgba(255,140,0,0.3)',
            'rgba(139,134,130,0.3)',
            'rgba(70,130,180,0.3)',
            'rgba(65,105,225,0.3)',
            'rgba(220,220,220,0.3)',
            'rgba(72,209,204,0.3)',
            'rgba(0,191,255,0.3)',
            'rgba(176,196,222,0.3)',
            'rgba(255,182,193,0.3)',
            'rgba(30,144,255,0.3)'
        ],
        //默认语言
        Language: 'CN',
        //保存图片的默认文件名(不包括扩展名)
        SavedPicName: 'exportCanvas_' + (new Date()).getTime(),
        //默认线条颜色
        LineColor: '#BEBEBE',
        //默认文本颜色为黑色
        FontColor: '#000000',
        //默认字体大小
        FontSize: 13,
        //默认文本字体
        FontFamily: 'Arial',
        //默认线宽
        LineWidth: 1,
        //默认图例元素图形类型
        LegendType: 's',
        //默认提示框样式
        TipType: 'tip_blue',
        //默认显示在已绘元素内部Label的颜色为纯白色
        InnerLabelColor: '#ffffff',
        //默认显示在已绘元素外部Label的颜色为纯黑色
        OuterLabelColor: '#000000',
        //默认数据类型为普通数字，而非日期、百分数等
        ValueType: 'n',
        //比例尺的线颜色
        ScaleLineColor: '#BEBEBE',
        //默认柱子的统一字体
        AxisFontFamily: 'Arial',
        AxisLineColor: '#000000',
        //默认页脚的文本颜色
        FooterFontColor: '#8B8386',
        //默认对齐线颜色
        AlignLineColor: '#21251e',
        //页脚距离下侧的距离与canvas高度的比值
        FooterBottomDistance: 0.01,
        //页脚距离右侧的距离与canvas宽度的比值
        FooterRightDistance: 0.03,
        //(对于类饼状图等无坐标轴图)canvas的可用宽度与可用高度的最大值/图例小图标边长的的比值
        LengthReferCutForPies: 60,
        //(对于有坐标轴图)canvas的可用宽度与可用高度的最大值/图例小图标边长的的比值
        LengthReferCutForAxis: 90,
        //(对于类饼状图等无坐标轴图)canvas的可用宽度/图例的X轴方向的距离canvas边界的位移
        OffXCutForPies: 20,
        //(对于有坐标轴图)canvas的可用宽度/图例的X轴方向的距离canvas边界的位移
        OffXCutForAxis: 70,
        //绘制坐标轴时指示默认纵向可用总距离（除去title、subTitle）与X轴高度的比值
        AxisXDrawableCut: 6,
        //绘制坐标轴时指示默认横向可用总距离（除去图例所占用的宽度）与Y轴宽度的比值
        AxisYDrawableCut: { n: 9, p: 9, d: 7, t: 7 },
        //绘制坐标轴时指示默认Y轴的Title与minX的距离与Y轴宽度的比值
        AxisYTitleLocation: { n: 0.7, p: 0.7, d: 0.75, t: 0.75 },
        //绘制坐标轴时指示默认X轴的Title与maxY的距离与X轴高度的比值
        AxisXTitleLocation: { n: 0.8, p: 0.8, d: 0.8, t: 0.8 }
    },
    //当深度覆盖或扩展对象时的例外情况，即出现以下子对象时不展开而直接将子对象地址进行赋值。常见作用在于：某些子对象是Object类型，但它是一体的，不“看重”其中的子对象，不能进行展开操作。
    Exceps: ['background.fillstyle'],
    //记录绘制坐标轴的图形类型
    DrawAxis: ['Bar', 'HeapBar', 'Histogram', 'HeapHistogram', 'Line', 'Points', 'Area'],
    //绘制坐标轴时，指示X轴的Label是否从最左端开始（折线图等图形一般都是从最左端开始标注，而柱状图则不是）
    AxisFromFirstLeft: ['Line', 'Area', 'Points'],
    //皮肤设定，通过对培新选项的重新设定来实现皮肤功能，相当于帮用户设置一些选项以实现不同的表现效果。有以下规则：
    //1，lineColor、fontFamily、fontColor等与皮肤有关的设置必须保证该Defaults的优先级小于options的对应值，如：ops.bordercolor || ops.lineColor || DChart.Const.Defaults.LineColor;
    //2，皮肤只跟背景、颜色、字体（不包括字体大小）、线的宽度等设置相关，其他设置不参与皮肤的设置
    //3，FontFamily只设置一次即可，即整个系统统一使用一种字体
    //LineColor与FontFamily类似，整个系统统一
    //4，BorderWidth与BorderColor可同时作为皮肤的设置选项（例如Canvas背景的设置），但二者独立时不应作为皮肤选项，BorderColor只需跟随LineColor即可，BorderWidth根据需要而定
    Skins: {
        //全部都设为null    
        BlackAndWhite: {
            //canvas背景设置
            BackGround: {
                //边框宽度
                BorderWidth: 1,
                //边框颜色
                BorderColor: null,
                //背景颜色(如果该值与LinearGradient同时不为null时，优先使用BackColor)
                BackColor: '#ffffff',
                //线性渐变设置
                LinearGradient: null,
                //放射性渐变设置
                RadialGradient: null
            },
            //提示框样式类型
            TipType: null,
            //默认文本颜色
            FontColor: null,
            //默认线条颜色
            LineColor: null,
            //默认文本字体
            FontFamily: null,
            //主标题颜色
            TitleColor: null,
            //副标题颜色
            SubTitleColor: null,
            //图例文本颜色
            LegendFontColor: null,
            //图例文本颜色
            LegendBorderColor: null,
            //比例尺线条颜色
            ScaleLineColor: null,
            //比例尺线与线间区域的背景色(通过颜色数组设置，可通过设置数组只有一个值来设置单一颜色)
            ScaleBackColors: ['rgba(150,150,150,0.3)', 'rgba(210,210,210,0.3)'],
            LabelAxisLineColor: null,
            LabelAxisFontColor: null,
            ValueAxisLineColor: null,
            ValueAxisFontColor: null,
            CrossLineColor: null,
            CloseLineColor: null,
            CaptionFontColor: null,
            XAxisTitleFontColor: null,
            YAxisTitleFontColor: null,
            FooterFontColor: 'rgba(110,110,110,0.8)',
            ShadowColor: '#000000'
        }
    },
    //比例尺线值差的默认可选值，即Y轴每条线之间代表的值的差。当用户未设置Interval时，自动计算的Interval将就近选择该数组中的值
    Interval: {
        //当超过1000时，以2、5、10的倍数递增，直到最终找到合适的值为止
        n: [1, 2, 3, 4, 5, 8, 10, 20, 30, 40, 50, 80, 100, 200, 300, 500, 800, 1000],
        p: [1, 2, 3, 4, 5, 8, 10, 20, 25, 50],
        d: [1, 2, 3, 5, 7, 10, 14, 20, 21, 30, 60, 90, 365],
        t: [1, 2, 5, 10, 20, 30, 60, 120, 180, 240, 300, 480, 720, 1440]
    }
};
DChart.getCore = function () {
    var core = function (_targetdiv, _language) {
        var inner = this;
        //设置系统语言
        inner.Language = DChart.Const.Language[_language] != undefined ? _language : 'CN';
        //设置内置事件
        inner.onStart = null;
        inner.onBeforeAnimation = null;
        inner.onAnimation = null;
        inner.onFinish = null;
        //设定Div母节点
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
            //防止出现div高度或宽度为0的现象
            if (targetdiv.clientWidth == 0) {
                targetdiv.style.width = "800px";
            }
            if (targetdiv.clientHeight == 0) {
                targetdiv.style.height = (targetdiv.clientWidth / 2).toString() + "px";
            }
            //去除原先的padding，以方便准确对canvas进行定位
            targetdiv.style.padding = '';
        }
        //获取非负数数字（如果小于0，则返回0）
        var getPosNum = function (num) {
            if (num != null) { return num < 0 ? 0 : num; }
            else { return null; }
        };
        //默认基本设置
        var _basicOptions = {
            Off: 0,
            OffLeft: null,
            OffRight: null,
            OffTop: null,
            OffBottom: null,
            Width: null,
            Height: null
        };
        //获取计算后的基本设置数据
        inner._computeBasic = function (_ops) {
            var ops = _ops || _basicOptions;
            var Off = getPosNum(ops.Off);
            var offleft = getPosNum(ops.OffLeft) || Off || 0;
            var offright = getPosNum(ops.offright) || Off || 0;
            var offtop = getPosNum(ops.offtop) || Off || 0;
            var offbottom = getPosNum(ops.offbottom) || Off || 0;
            //默认计算出的canvas的Width
            var defaultWidth = getPosNum(targetdiv.clientWidth - offleft - offright);
            //默认计算出的canvas的Height
            var defaultHeight = getPosNum(targetdiv.clientHeight - offtop - offbottom);
            var width = DChart.Methods.CapValue(ops.Width || defaultWidth, targetdiv.clientWidth, 0);
            var height = DChart.Methods.CapValue(ops.Height || defaultHeight, targetdiv.clientHeight, 0);
            var result = { offleft: offleft, offright: offright, offtop: offtop, offbottom: offbottom, width: width, height: height };
            //如果Initial方法调用，则将计算结果保存
            if (!_ops) { inner.calculatedBasic = result; }
            return result;
        };
        //将共有的配置选项参数重新设为默认值
        inner._resetSharedOpions = function () {
            //所有图形共有的默认选项值
            inner.originalDefaultOptions = {
                //值轴的值类型，"n"表示数字(Number)，"d"表示日期(date，只到日，不到小时)，"t"表示时间(time，到小时和分钟)，"p"表示百分比
                valueType: null,
                //开启动画开关
                animation: true,
                //完成动画分步数
                animationSteps: 100,
                //动画进度计算方法名称
                animationEasing: 'easeInOutQuart',
                //绘制比例尺是否位于图形上方（如果是，则图形部分将被比例尺遮盖；否则比例尺被图形遮盖）
                scaleOverlay: false,
                //默认线的颜色
                lineColor: null,
                //默认文本字体(这里设置成null是为了方面用户统一使用某种字体)
                fontFamily: null,
                //默认字体颜色(这里设置成null是为了方面用户绘制文本时统一使用某种颜色，例如当使用黑色背景时，只要将所有添加文字的颜色都设为null(默认就是null)，然后将该值设置为“白色”即可统一整个绘图区域的文本色调)
                //因为在程序中都已经控制生成文本的规则是"ops.color || inner.innerOptions.fontColor || '#000000';" ，ops.color是特定文本颜色设置， '#000000'为特定文本默认颜色
                fontColor: null,
                //与canvas整个绘图区域相关的设置
                background: {
                    //canvas边框颜色
                    bordercolor: null,
                    //canvas边框宽度
                    borderwidth: null,
                    //填充canvas样式(可为纯色或渐变色)
                    fillstyle: null
                },
                //标题相关选项
                title: {
                    //是否绘制
                    show: true,
                    //文本内容
                    content: null,
                    //文本颜色
                    color: null,
                    //字体
                    fontfamily: null,
                    //文本字体大小
                    fontsize: null,
                    //字体粗细
                    fontweight: null,
                    //与canvas上边的距离
                    offtop: null,
                    //为标题空出高度，为空则自动计算
                    height: null
                },
                //副标题相关选项
                subTitle: {
                    //是否绘制
                    show: true,
                    //文本内容
                    content: null,
                    //文本颜色
                    color: null,
                    //字体
                    fontfamily: null,
                    //文本字体大小
                    fontsize: null,
                    //字体粗细
                    fontweight: null,
                    //为标题空出高度，为空则自动计算
                    height: null
                },
                //图例相关选项
                legend: {
                    show: true,
                    //图例类型：column(纵向排列，默认)、row（横向排列）
                    type: null,
                    //颜色指示小图形类型：s(quare)-正方形（默认），c(ycle)-圆形，t(riangle)-三角形，l(line)-线，x(cross)-交叉型
                    elementtype: null,
                    //图例在X轴上的的位置：right(默认)、left、center
                    placeX: null,
                    //图例在Y轴上的的位置：top、bottom、middle(默认)
                    placeY: null,
                    //图例小图形的边长
                    sidelength: null,
                    //图例与左右侧的距离
                    offX: null,
                    //图例下方与可绘图区域的距离
                    offY: null,
                    //边框颜色
                    bordercolor: null,
                    //边框宽度
                    borderwidth: 1,
                    //字体颜色
                    fontcolor: null,
                    //字体大小
                    fontsize: null,
                    //字体
                    fontfamily: null
                },
                //比例尺相关设置
                scale: {
                    //比例线的宽度
                    linewidth: 1,
                    //绘制比例尺背景线的颜色
                    linecolor: null,
                    //线与线之间空白处的背景色，可用通过数组形式实现颜色的交替
                    backcolors: null
                },
                //文本轴相关设置      
                labelAxis: {
                    //文本轴显示的Label
                    labels: null,
                    //文本轴所占用的厚度
                    length: null,
                    //文本轴线宽
                    linewidth: 1,
                    linecolor: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    //文本旋转角度(-0.5到0.5，单位是Math.PI)
                    fontrotate: null
                },
                //值轴相关设置
                valueAxis: {
                    //值轴所占用的厚度
                    length: null,
                    //自定义显示内容
                    //val：系统传入的参数，当valueType为数字，则传入数字；百分比-(20%)；日期-(1900-01-01)；时间-(1900-01-01 23:15)
                    //当为日期格式时，用户可通过自定义手段更改默认显示格式，如去掉1900，只剩下01-01等等
                    //val：系统传入的参数，当valueType为数字或百分比时，传入数字；当为日期或时间时，传入Date日期格式
                    content: function (val) {
                        if (this.valueType == 'd') { return val.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { return val.format('MM-dd hh:mm'); }
                        else if (this.valueType == 'p') { return val.toFixed(0).toString() + '%'; }
                        else { return val.toString(); }
                    },
                    //值轴参考最小值
                    minvalue: null,
                    //值轴参考最大值
                    maxvalue: null,
                    //比例尺，即值轴每条线之间代表的值的差。
                    //数字和百分比则传入数字，日期则传入天数，时间则传入分钟数
                    interval: null,
                    //当options.valueType为p时，是否纵向计算百分数（求P的总值不是某行的总值，而是某列不同行的总值）
                    verticalcomputeP: false,
                    //值轴线宽
                    linewidth: null,
                    linecolor: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    //文本旋转角度
                    fontrotate: null
                },
                //是否绘制小交叉线，以显著地标注坐标点
                cross: {
                    show: true,
                    length: null,
                    linewidth: null,
                    linecolor: null
                },
                //是否关闭绘图右侧
                close: {
                    show: true,
                    linewidth: null,
                    linecolor: null
                },
                //位于值轴的顶部(翻转时为右部)的说明文字，如"单位(万元)"
                caption: {
                    //说明文字的内容
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null
                },
                //横轴内部的文本（横向放置）
                xAxisTitle: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    //横轴文本距离横轴基本线的距离与横轴高度的比值
                    titlelocation: null
                },
                //纵轴内部的文本（纵向放置）
                yAxisTitle: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    //纵轴文本距离纵轴基本线的距离与纵轴宽度的比值
                    titlelocation: null
                },
                //页脚文本（位于图形右下角处）
                footer: {
                    content: null,
                    fontcolor: null,
                    fontsize: null,
                    fontfamily: null,
                    fontweight: null,
                    //页脚距离右侧的距离与canvas宽度的比值
                    rightdistance: null,
                    //页脚距离下侧的距离与canvas高度的比值
                    bottomdistance: null
                },
                //使用阴影
                shadow: {
                    show: true,
                    //阴影的颜色
                    color: null,
                    //阴影的模糊级别
                    blur: null,
                    //阴影距形状的水平距离
                    offsetX: null,
                    //阴影距形状的垂直距离
                    offsetY: null
                },
                //是否支持鼠标事件（包括click、mouseover、tip，如关闭，将大大节省计算资源）
                supportMouseEvents: true,
                //提示框相关选项
                tip: {
                    //指示当鼠标指向时，是否显示提示内容
                    show: true,
                    //鼠标指向时的提示内容(调用该方法需保证传入的data至少包含text及value属性，若未传入则需以text、value、color(可省略)的顺序以数组的形式传入)
                    content: function (data) {
                        var val = data.value.toString();
                        if (this.valueType == 'd') { val = data.value.format('yyyy-MM-dd'); }
                        else if (this.valueType == 't') { val = data.value.format('MM-dd hh:mm'); }
                        return '<div>&nbsp;' + data.text + '：' + val + '&nbsp;</div>';
                    },
                    //提示框外表风格，在DChart.Const.CustomCss中配置
                    tiptype: null
                },
                //通用click事件，function(data,e){}，data为目标图形子元素所携带的数据及系统计算项，如百分比等等，e为浏览器提供的标准事件参数
                click: null,
                //通用mouseover事件，function(data,e){}，data为目标图形子元素所携带的数据，如百分比等等，e为浏览器提供的标准事件参数
                mouseover: null,
                mouseleave: null,
                //当鼠标指向时在元素上方添加的颜色为'rgba(255,255,255)'(即纯白色)透明层的透明度
                mouseoverTransparency: 0.3,
                //当鼠标指向时是否将鼠标的cursor更改为'pointer'
                mouseoverChangeCursor: true,
                //动画完成后执行的方法
                onAnimationComplete: null
            };
        };
        //更改基本设置
        inner.SetBasicOptions = function (ops) {
            //计算新的基本设置
            var _computedNew = inner._computeBasic(ops);
            //如果新的设置效果与旧的相同，则直接返回
            if (inner.calculatedBasic && DChart.Methods.ObjectHaveSameValues(inner.calculatedBasic, _computedNew, ['offleft', 'offright', 'offtop', 'offbottom', 'height', 'width'])) { return; }
            _basicOptions = DChart.Methods.Override(_basicOptions, ops);
            //更改基本设置将导致Canvas重新初始化
            inner.Initial();
            return inner;
        };
        //设置数据，data必须为数组格式，且每个数组元素都必须有字符串类型的text属性
        //数据三大元素：text、value、color
        inner.SetData = function (data) {
            if ((!data || !DChart.Methods.IsArray(data)) && (!inner.innerData || !DChart.Methods.IsArray(inner.innerData))) {
                throw new Error(DChart.Const.Language[inner.Language].WrongParam + DChart.Const.Language[inner.Language].DataMustBeArray);
            }
            //保存数据
            if (data) {
                //如果未指定text、value等属性，而是以数组的形式存在，如['test',1]，则依次为text、value、color、click、mouseover、mouseleave赋值
                if (DChart.Methods.IsArray(data[0]) && data[0].length > 0) {
                    var tranData = [];
                    for (var i = 0, item; item = data[i]; i++) {
                        var newitem = {};
                        if (item[0]) { newitem.text = item[0]; }
                        if (item[1]) { newitem.value = item[1]; }
                        if (item[2]) { newitem.color = item[2]; }
                        if (typeof item[3] == 'function') { newitem.click = item[3]; }
                        if (typeof item[4] == 'function') { newitem.mouseover = item[4]; }
                        if (typeof item[5] == 'function') { newitem.mouseleave = item[5]; }
                        tranData.push(newitem);
                    }
                    data = tranData;
                }
                inner.innerData = data;
            }
            return inner;
        };
        //设置配置
        inner.SetOptions = function (ops) {
            //配置参数
            if (!inner.innerOptions) {
                inner.SetDefaultOptions();
            }
            if (ops) {
                //保存配置
                inner.innerOptions = DChart.Methods.Override(inner.innerOptions, ops);
            }
            return inner;
        };
        //在各个绘图类型的Draw方法中调用，用于初始化或重新加载某些属性等等的“基础性工作”
        inner._onStart = function () {
            //记录所有系统实时绘制的要素的大小、位置信息
            inner.coordinates = {};
            //记录临时使用而不向用户公开的数据
            inner.tempData = {};
            inner.canvas.onclick = null;
            inner.canvas.onmousemove = null;
            if (inner.onStart) { inner.onStart(); }
        };
        //验证所有选项输入是否正确
        inner._checkOptions = function () {
            //验证单个选项输入是否正确
            var _checkOption = function (name, val, type) {
                var throwErr = function (errName) {
                    var wrongMsgs = DChart.Const.Language[inner.Language];
                    throw new Error(wrongMsgs.WrongParam + name + wrongMsgs[errName]);
                };
                if (val === null) { return; }
                    //可以为null，但是不能为undefined
                else if (val === undefined) { throwErr('OptionShouldNotBeUndefined'); }
                //返回值默认为null；当不为null时，为innerOptions重新赋值。
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
                        //默认为数字
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
                labelAxis: [['labels', 'sa'], ['length', 'n'], ['linewidth', 'n'], ['linecolor', 'c'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['fontrotate', 'n']],
                valueAxis: [['length', 'n'], ['content', 'f'], ['minvalue', 'n'], ['maxvalue', 'n'], ['interval', 'n'], ['verticalcomputeP', 'b'], ['linewidth', 'n'], ['linecolor', 'c'], ['fontcolor', 'c'], ['fontsize', 'n'], ['fontfamily', 's'], ['fontweight', 's'], ['fontrotate', 'n']],
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

        //获取坐标信息
        //location：坐标指示表达式，以"."表示子集，如"canvas.height"；如果包含数组元素，则直接以“.1”的形式获取，如以“pie.outerlabels.3.left”获取第四个半圆的OuterLabel的left数据
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
        //设置皮肤(skin为皮肤的英文单词编号)
        inner.SetSkin = function (skinID) {
            //如果SkinID未注册，则使用BlackAndWhite
            if (!DChart.Const.Skins[skinID]) { skinID = 'BlackAndWhite'; }
            var skin = DChart.Const.Skins[skinID];
            var newOps = {};
            //一级样式
            newOps.fontColor = skin.FontColor || null;
            newOps.lineColor = skin.LineColor || null;
            newOps.fontFamily = skin.FontFamily || null;
            //背景样式
            newOps.background = {};
            newOps.background.fillstyle = null;
            if (skin.BackGround) {
                newOps.background.bordercolor = skin.BackGround.BorderColor || null;
                newOps.background.borderwidth = skin.BackGround.BorderWidth || null;
                //优先使用纯色        
                if (skin.BackGround.BackColor) {
                    newOps.background.fillstyle = skin.BackGround.BackColor;
                }
                else {
                    //创建渐变（优先线性渐变，次放射性渐变）
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
                        //创建放射性渐变
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
            //设置特定单个图形类型的特有的皮肤
            inner._spreadSkin(skinID, newOps);
            //保存配置
            inner.innerOptions = DChart.Methods.Override(inner.innerOptions, newOps);
            return inner;
        };
        //用于记录使用过的随机字符串
        inner.randoms = {};
        //记录所有的图形
        inner.shapes = {};
        //重新初始化Canvas节点
        inner.Initial = function () {

            //删除旧的Canvas节点
            var children = targetdiv.children;
            for (var i = 0, child; child = children[i]; i++) {
                if (child.nodeName.toLowerCase() == 'canvas') {
                    targetdiv.removeChild(child);
                    break;
                }
            }

            //删除旧的DChart样式
            var head = document.getElementsByTagName('head')[0];
            var dchartStyle = head.getElementsByTagName('style');
            for (var i = 0, style; style = dchartStyle[i]; i++) {
                if (style.id.indexOf('DChart') == 0) {
                    head.removeChild(style);
                }
            }
            //添加框架自定义的css样式
            var style = document.createElement('style');
            var styleID = 'DChart' + DChart.Methods.GetRandomString();
            style.id = styleID;
            inner.randoms.styleID = styleID;
            head.appendChild(style);
            var classes = DChart.Const.CustomCss;
            for (var className in classes) {
                //确保不把“扩展”属性给遍历了
                if (classes.hasOwnProperty(className)) {
                    //为class后添加随机字符串，以确保新class不会与用户的使用出现“撞车”现象
                    var newClassName = className + DChart.Methods.GetRandomString();
                    //记录随机生成的新的class名称
                    inner.randoms[className] = newClassName;
                    var css = '.' + newClassName + classes[className] + '\n';
                    if (style.styleSheet) {
                        //兼容IE
                        style.styleSheet.cssText += css;
                    }
                    else {
                        style.appendChild(document.createTextNode(css));
                    }
                }
            }
            //计算canvas的高度、宽度等基本信息
            inner._computeBasic();
            //添加canvas节点
            var canvas = document.createElement('canvas');
            //设置一个随机字符串作为ID
            var canvasID = 'DChart' + DChart.Methods.GetRandomString();
            inner.ID = canvasID;
            canvas.setAttribute('id', canvasID);
            inner.randoms.canvasID = canvasID;
            canvas.width = inner.calculatedBasic.width;
            canvas.height = inner.calculatedBasic.height;
            //设置canvas节点的margin
            style = 'margin:' + inner.calculatedBasic.offtop + 'px ' + inner.calculatedBasic.offright + 'px ' + inner.calculatedBasic.offbottom + 'px ' + inner.calculatedBasic.offleft + 'px;';
            canvas.innerHTML = '<p>您的浏览器不支持HTML5</p>';
            canvas.setAttribute('style', style);
            targetdiv.appendChild(canvas);
            inner.canvas = canvas;
            //获取canvas画板对象
            inner.ctx = canvas.getContext('2d');
            //初始化数据
            inner.innerData = [];
            //初始化配置信息
            inner.SetDefaultOptions();
            inner.ClearBackGround();
        };
        //保存图片（目前似乎只支持FireFox）
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
        //清空提示框（在目标Div内，除canvas外的其他节点都被删除）
        inner._clearTips = function () {
            //清空辅助显示内容，如提示框等
            var children = targetdiv.children;
            for (var i = 0, child; child = children[i]; i++) {
                if (child.nodeName && child.nodeName.toLowerCase() != 'canvas') {
                    targetdiv.removeChild(child);
                    i--;
                }
            }
        };
        //该对象内的方法用于绘制特定类型的元素，如文本、圆形、条状图、曲线等等
        //可用于系统复用，也可用于用户自定义添加元素
        inner.DrawFigures = {};
        //绘制小图形，包括圆形、正方形、三角形等等
        //type：图形类型，c(ycle)-圆形，s(quare)-正方形，t(riangle)-三角形。默认为s
        //fill：默认为true
        //stroke:默认为false
        //middle：是否居中绘制（默认为false，及居上居左绘制）
        inner.DrawFigures.createPointElement = function (type, X, Y, length, fillcolor, fill, strokecolor, linewidth, stroke, middle) {
            if (arguments.length < 5) { return; }
            if (fill == null) { fill = true; }
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            switch (type) {
                //圆形                                                                                                                                                                                                                                                                                        
                case 'c':
                    if (middle) { ctx.arc(X, Y, length / 2, 0, Math.PI * 2); }
                    else { ctx.arc(X + length / 2, Y + length / 2, length / 2, 0, Math.PI * 2); }
                    break;
                    //三角形                                                                                                                                                                      
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
                    //交叉线                                                                                                                                                                            
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
                    //正方形                                                                                                                                                                        
                default:
                    if (middle) { ctx.rect(X - length / 2, Y - length / 2, length, length); }
                    else { ctx.rect(X, Y, length, length); }
                    break;
            }
            ctx.closePath();
            if (stroke && (linewidth > 0 || type == 'x')) {
                //如果是交叉线，则用填充色替代外围线的颜色
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
        //绘制一个弧形图
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
        //测量文本所占用的宽度
        inner.DrawFigures.measureText = function (content, fontweight, fontsize, fontfamily) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.font = (fontweight || 'normal') + ' ' + (fontsize || DChart.Const.Defaults.FontSize) + 'px ' + (fontfamily || inner.innerOptions.fontFamily || DChart.Const.Defaults.FontFamily);
            var textWidth = ctx.measureText(content).width;
            ctx.restore();
            return textWidth;
        };
        //绘制文本
        //fontrotate：选项角度
        //reference：旋转参考点（right、left等等），为null表示与textAlign相同
        inner.DrawFigures.createText = function (content, x, y, textAlign, fontweight, fontsize, fontfamily, color, fontrotate, reference) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.textAlign = textAlign || 'left';
            ctx.font = (fontweight || 'normal') + ' ' + (fontsize || DChart.Const.Defaults.FontSize) + 'px ' + (fontfamily || inner.innerOptions.fontFamily || DChart.Const.Defaults.FontFamily);
            var textWidth = ctx.measureText(content).width;
            ctx.fillStyle = color || inner.innerOptions.fontColor || DChart.Const.Defaults.FontColor;
            //旋转文字
            if (fontrotate) {
                if (textAlign == 'center' && reference == 'right') {
                    //x -= Math.cos(fontrotate * Math.PI) * textWidth / 2;
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
        //绘制一个方形的背景色
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
        //绘制一个方形的边框
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
        //绘制一条线
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
        //绘制二次贝塞尔曲线
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
        //绘制一个闭合的图形
        inner.DrawFigures.createCloseFigure = function (points, fillcolor, linewidth, linecolor) {
            var ctx = inner.ctx;
            ctx.save();
            ctx.beginPath();
            for (var i = 0, point; point = points[i]; i++) {
                if (i == 0) {
                    ctx.moveTo(point[0], point[1]);
                }
                else {
                    ctx.lineTo(point[0], point[1]);
                }
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
        //根据点的集合绘制线（不闭合）
        inner.DrawFigures.createPointsLine = function (points, linewidth, linecolor) {
            if (points.length < 2) { return; }
            var x0 = points[0][0]; var y0 = points[0][1];
            for (var i = 1, point; point = points[i]; i++) {
                var x1 = points[i][0]; var y1 = points[i][1];
                inner.DrawFigures.createLine(x0, y0, x1, y1, linewidth, linecolor);
                x0 = x1; y0 = y1;
            }
        };
        //清空整个Canvas，包括canvas画板、为支持tip的span，保存的shapes对象
        inner.ClearBackGround = function () {
            //清空Div的背景    
            targetdiv.style.backgroundColor = '';
            //清空画板
            inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
            inner._clearTips();
            //清空已有图形
            for (var shapecontain in inner.shapes) {
                if (shapecontain && inner.shapes[shapecontain].length) {
                    inner.shapes[shapecontain].length = 0;
                }
            }
        };
        //设置背景样式
        inner._createBackground = function () {
            var ops = inner.innerOptions.background;
            var canvas = inner.canvas;
            //绘制背景
            if (ops.fillstyle) {
                inner.DrawFigures.createRectangleFill(0, 0, canvas.width, canvas.height, ops.fillstyle);
            }
            else {
                //否则清空画板
                inner.ctx.clearRect(0, 0, inner.canvas.width, inner.canvas.height);
            }
            var borderwidth = ops.borderwidth || 0;
            //绘制边框
            if (borderwidth > 0) {
                inner.DrawFigures.createRectangleBorder(0, 0, canvas.width, canvas.height, borderwidth * 2, ops.bordercolor);
            }
            //记录canvas的基本绘图信息
            inner.coordinates.canvas = { width: canvas.width, height: canvas.height, borderwidth: borderwidth };
        };
        //创建提示框(left及top是相当于canvas的左边距与上边距)
        inner._createTip = function (content, left, top) {
            var tipBox = document.createElement('span');
            //根据配置情况，使用之前随机产生的tip的class名称
            var tiptype = inner.innerOptions.tip.tiptype || DChart.Const.Defaults.TipType;
            tipBox.setAttribute('class', inner.randoms[tiptype]);
            tipBox.style.position = 'absolute';
            //在canvas的left+canvas与Div的offlef
            tipBox.style.left = targetdiv.offsetLeft + left + inner.calculatedBasic.offleft + 'px';
            //计算方式与上面的left类似
            tipBox.style.top = targetdiv.offsetTop + top + inner.calculatedBasic.offtop + 'px';
            tipBox.innerHTML = content;
            targetdiv.appendChild(tipBox);
            return tipBox;
        };
        //更改tip的位置
        inner._changeTip = function (tip, left, top) {
            if (left) {
                tip.style.left = targetdiv.offsetLeft + left + inner.calculatedBasic.offleft + 'px';
            }
            if (top) {
                tip.style.top = targetdiv.offsetTop + top + inner.calculatedBasic.offtop + 'px';
            }
        };
        //获取除去标题及图例外的“可自由绘图”区域的坐标信息
        inner._getDrawableCoordinate = function () {
            if (!inner.tempData.coordinate) {
                var ops = inner.innerOptions;
                var valids = inner._calculateOutersValid();
                var minX, minY, maxX, maxY;
                //当绘制坐标轴时，重新计算可会区域
                if (valids.AxisValid) {
                    var axisSize = inner.axisSize || inner._computeAxis(valids);
                    minX = axisSize.minX - 1;
                    minY = axisSize.minY - 1;
                    maxX = axisSize.maxX + 1;
                    maxY = axisSize.maxY + 1;
                }
                else {
                    //图例总占宽度
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
        //清空在Canvas中除标题、图例等等外的可绘图区域
        inner._clearDrawable = function (coordinate) {
            var ops = inner.innerOptions.background;
            coordinate = coordinate || inner._getDrawableCoordinate();
            //如果设置了背景样式，则使用该背景样式
            inner.ctx.clearRect(coordinate.minX + 1, coordinate.minY + 1, coordinate.maxX - coordinate.minX - 2, coordinate.maxY - coordinate.minY - 2);
            if (ops.fillstyle) {
                inner.DrawFigures.createRectangleFill(coordinate.minX + 1, coordinate.minY + 1, coordinate.maxX - coordinate.minX - 2, coordinate.maxY - coordinate.minY - 2, ops.fillstyle);
            }
        };
        //计算标题的尺寸(若用户设置了标题的尺寸则使用，否则自动按照比较计算出来)
        inner._computeTitle = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            var ops = inner.innerOptions.title;
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            //自动计算时的参考长度
            var referencedlength = Math.min(inner.canvas.height - canvasBorderWidth * 2, inner.canvas.width / 2 - canvasBorderWidth);
            var offtop = ops.offtop != null ? ops.offtop : 0;
            var height = ops.height != null ? ops.height : referencedlength / 15;
            var fontsize = ops.fontsize || referencedlength / 18;
            ops = inner.innerOptions.subTitle;
            var subheight = ops.height != null ? ops.height : referencedlength / 18;
            var subfontsize = ops.fontsize != null ? ops.fontsize : referencedlength / 21;
            //计算所占用的高度
            var occupyTop = (valids.titleValid ? height + offtop : 0) + (valids.titleValid && valids.subTitleValid ? subheight : 0) + fontsize / 4;
            return { title: { height: height, offtop: offtop, fontsize: fontsize }, subTitle: { height: subheight, fontsize: subfontsize }, occupyTop: occupyTop };
        };
        //绘制标题及副标题(如果未设置主标题，则副标题设置无效)
        inner._createTitle = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            var ops = inner.innerOptions.title;
            if (!valids.titleValid) { return; }
            var computed = inner._computeTitle(valids);
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            //绘制主标题
            var centerX = inner.canvas.width / 2;
            var bottom = canvasBorderWidth + computed.title.offtop + computed.title.height;
            var textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', (ops.fontweight || 'bold'), computed.title.fontsize, ops.fontfamily, ops.color);
            inner.coordinates.title = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - computed.title.fontsize, bottom: bottom, fontsize: computed.title.fontsize, length: textlength };
            //绘制副标题 
            ops = inner.innerOptions.subTitle;
            if (!valids.subTitleValid) { return; }
            bottom = canvasBorderWidth + computed.title.offtop + computed.title.height + computed.subTitle.height;
            textlength = inner.DrawFigures.createText(ops.content, centerX, bottom, 'center', (ops.fontweight || 'bold'), computed.subTitle.fontsize, ops.fontfamily, ops.color);
            inner.coordinates.subTitle = { left: centerX - textlength / 2, right: centerX + textlength / 2, top: bottom - computed.subTitle.fontsize, bottom: bottom, fontsize: computed.subTitle.fontsize, length: textlength };
        };
        //计算图例的尺寸(若用户设置了图例的尺寸则使用，否则自动按照比较计算出来)
        inner._computeLegend = function (valids) {
            //如果已经记录图例信息，则直接返回
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
            //检查图例的位置设置是否合规
            if (placeY == 'middle' && placeX == 'center' || type == 'row' && placeY == 'middle') {
                throw new Error(DChart.Const.Language[inner.Language].WrongLegendSet);
            }
            var elementtype = ops.elementtype || DChart.Const.Defaults.LegendType;
            //小方块的边长
            var sidelength = ops.sidelength || Math.max(fullWidth, fullHeight) / (valids.AxisValid ? DChart.Const.Defaults.LengthReferCutForAxis : DChart.Const.Defaults.LengthReferCutForPies);
            //小方块与文本的距离，或上下小方块之间的距离
            var sidedistance = sidelength / 2;
            //小方块与图例上下边的距离(不包括边框)
            var sideoffY = type == 'row' ? sidelength / 3 : sidelength;
            //小方块与图例左右边界的距离(不包括边框)
            var sideoffX = sidelength / 2;
            //图例外围边框宽度
            var borderwidth = ops.borderwidth && ops.borderwidth > 0 ? ops.borderwidth : 0;
            var fontsize = ops.fontsize || sidelength * 1.2;
            var fontfamily = ops.fontfamily || inner.innerOptions.fontFamily || DChart.Const.Defaults.FontFamily;
            //文本的最大长度
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
                //当elementtype为l，计算图例占用的高度时还原被乘以2的sidelength
                legendHeight = data.length * ((elementtype == 'l' ? sidelength / 2 : sidelength) + sidedistance) - sidedistance + sideoffY * 2 + borderwidth * 2;
            }
            else {
                legendWidth = data.length * (sidelength + sidedistance * 2 + maxTextLength) - sidedistance + sideoffX * 2 + borderwidth * 2;
                legendHeight = sideoffY * 2 + (elementtype == 'l' ? sidelength / 2 : sidelength) + borderwidth * 2;
            }

            var left = (placeX == 'left' ? offX : (placeX == 'center' ? fullWidth / 2 - legendWidth / 2 : fullWidth + canvasBorderWidth - offX - legendWidth)) + borderwidth;
            var titleHeight = valids.titleValid ? inner._computeTitle(valids).occupyTop : 0;
            //默认placeY为top
            var top = offY + canvasBorderWidth + titleHeight;
            //如果绘制坐标轴，则只能用fullHeight / 15来大致估计纵轴高度的一半了。
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
        //绘制图例
        inner._createLegend = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.legendValid) { return; }
            var ops = inner.innerOptions.legend;
            var computed = inner._computeLegend();
            //各个图形可能指定特定的图例颜色，保持在inner.tempData.legendColors中
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
            //判断是否绘制边框(不会默认给一个值导致无论什么情况都会绘制边框，实际上lineWidth=0的效果与lineWidth=1一致，可以看做canvas本身的默认设定)
            if (borderwidth > 0) {
                inner.DrawFigures.createRectangleBorder(legend.left, legend.top, legend.width, legend.height, borderwidth, ops.bordercolor);
            }
        };
        //根据系统内的数据类型，获取两个数值之间的差值
        inner._getFormatDiff = function (valueType, small, big) {
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
        //获取线值差、最大最小值、线条数目
        //vAxisVery:计算值轴传入1；计算文本轴传入0
        //scaleCount：自动计算interval时参考的ScaleCount
        inner._getComputed = function (vAxisVery, valueType, ops, minval, maxval, scaleCount) {
            var wrongMsgs = DChart.Const.Language[inner.Language];
            //根据最大最小值获取“适当的”值差
            var getInterval = function (minval, maxval, valueType) {
                var interval = inner._getFormatDiff(valueType, minval, maxval) / scaleCount;
                //在core中配置好的线值差的可选值         
                var defaults = DChart.Const.Interval[valueType].__copy();
                var find = false;
                while (!find) {
                    //如果小于可选值的最小值，则将可选值全部/10后重新比较
                    if (interval < defaults[0]) { defaults.__multiply(0.1); }
                    //如果大于可选值的最大值，则将可选值全部*10后重新比较
                    if (interval > defaults[defaults.length - 1]) { defaults.__multiply(10); }
                    for (var i = 1; i < defaults.length; i++) {
                        //当出现在两个值之间时，确定目标值
                        if (defaults[i - 1] <= interval && defaults[i] >= interval) {
                            find = true;
                            //选取最近的值
                            interval = interval - defaults[i - 1] < defaults[i] - interval ? defaults[i - 1] : defaults[i];
                            break;
                        }
                    }
                }
                return interval;
            };
            //线值差
            var interval = ops.interval;
            //如果未设定线值差，则自动计算
            if (!interval) {
                interval = getInterval(minval, maxval, valueType);
            }
            //先确定坐标的最小值
            var minvalue = ops.minvalue;
            if (minvalue == null) {
                if (valueType == 'd' || valueType == 't') {
                    var cut = interval * 60000 * (valueType == "d" ? 1440 : 1);
                    minvalue = new Date(minval - cut * vAxisVery);
                    if (valueType == 'd') {
                        minvalue = new Date(Date.parse(minvalue.format('yyyy/MM/dd')));
                    }
                }
                else if (valueType == 'p') {
                    //百分比类型数据坐标最小值取0
                    minvalue = 0;
                }
                else {
                    minvalue = (Math.floor(minval / interval) - vAxisVery) * interval;
                }
            }
            if (vAxisVery && minvalue < 0 && inner.tempData.notAllowValueNegative) { minvalue = 0; }

            //再确定坐标的最大值
            var maxvalue = ops.maxvalue;
            if (maxvalue == null) {
                if (valueType == 'd' || valueType == 't') {
                    var cut = interval * 60000 * (valueType == "d" ? 1440 : 1);
                    //这里vAxisVery(实际会传入1或0)，当做 额外添加的interval的倍数，使得最大值大于实际最大值，从而留出空白处而显得美观
                    maxvalue = new Date(minvalue.getTime() + (Math.ceil((maxval.getTime() - minvalue.getTime()) / cut) + vAxisVery) * cut);
                }
                else {
                    maxvalue = minvalue + (Math.ceil((maxval - minvalue) / interval) + vAxisVery) * interval;
                }
            }
            //如果值类型为p，则限定最大值为100
            if (valueType == 'p' && maxvalue > 100) { maxvalue = 100; }


            //计算比例尺背景的线条数目
            var scalecount = 0;
            var tmpMinValue = DChart.Methods.CopyInnerValue(valueType, minvalue);
            var val = DChart.Methods.AddInnerValue(valueType, tmpMinValue, interval);
            while (val <= maxvalue || ((valueType == 'p' || valueType == 'n') && Math.abs(maxvalue - val) < 0.0001)) {
                val = DChart.Methods.AddInnerValue(valueType, val, interval);
                scalecount++;
            }
            //防止设定的最大值与计算的最大值不一致
            maxvalue = val - interval;


            //判断值轴设定的最大值是否大于最小值
            if (maxvalue <= minvalue) {
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
        //格式化传入的数据，以方便后续绘图
        inner._formatAxisData = function (heapCompute) {
            var options = inner.innerOptions;
            var innerData = inner.innerData;
            var wrongMsgs = DChart.Const.Language[inner.Language];
            var lValueType = options.labelAxis.valueType;
            var multiple = (!lValueType && innerData[0].value.length > 1) || (lValueType && innerData[0].value.length && innerData[0].value[0].length == 2);
            var vValueType = options.valueType || DChart.Const.Defaults.ValueType;

            //判断是否堆积计算值坐标（必须为数组、文本轴不设定数据类型、值轴数据类型必须为p或n）
            var heapCompute = heapCompute && multiple && !lValueType && (vValueType == 'p' || vValueType == 'n');

            //判断是否纵向计算p(默认为横向计算)
            //如果堆积计算值坐标，则计算p时，必须纵向计算
            var verticalcomputeP = (heapCompute || options.valueAxis.verticalcomputeP && multiple && !lValueType) && vValueType == 'p';

            var vMaxval = null;
            var vMinval = null;
            var lMaxval = null;
            var lMinval = null;

            //计算柱状图的“簇”数（单个维数，则为柱子数；多维，则为其中一个维数的组织数）
            var tuftCount = innerData.length;
            if (multiple) {
                tuftCount = innerData[0].value.length;
            }
            //计算维数
            var demanCount = 1;
            if (multiple) {
                demanCount = innerData.length;
            }
            //当值轴数据类型为p或堆积计算值轴时，计算数据总数（堆积计算则纵向求和，否则横向求和）
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
                    //当为一维数组时，将valueSum变量类型改为普通数字
                    valueSum = 0;
                    for (var i = 0, item; item = innerData[i]; i++) {
                        valueSum += (lValueType ? item.value[1] : item.value);
                    }
                }
            }
            //检测和格式化单个数据
            //valueAxis:是否为值轴数据
            var formatValue = function (valueAxis, valueType, value, i, j, k) {
                //如果是日期和时间格式则需要格式化
                if ((valueType == 'd' || valueType == 't') && !value.getDate) {
                    var parseDate = Date.parse(value.toString().replace(/-/g, "/"));
                    if (isNaN(parseDate)) {
                        //不能转换为日期格式
                        throw new Error(wrongMsgs.WrongData + "'" + value + "'" + wrongMsgs.NeedDateData);
                    }
                    else {
                        value = new Date(parseDate);
                        if (k == undefined) {
                            //格式化后重新赋值
                            if (j == undefined) { innerData[i].value = value; }
                            else { innerData[i].value[j] = value; }
                        }
                        else {
                            innerData[i].value[j][k] = value;
                        }
                    }
                }
                    //必须为数字格式
                else if (valueType == 'n' || valueType == 'p') {
                    if (typeof value != 'number') {
                        throw new Error(wrongMsgs.WrongData + "'" + value + "'" + wrongMsgs.NeedNumberData);
                    }
                    //如果数据类型为p，则保存百分比值
                    if (valueType == 'p') {
                        //p类型数据不允许为负数
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
                        //检测值轴数据是否允许为负数
                        if (valueAxis && inner.tempData.notAllowValueNegative && value < 0) {
                            throw new Error(wrongMsgs.WrongData + '\'' + value + '\'' + wrongMsgs.DataMustGreaterThanZero);
                        }
                    }
                }
                return value;
            };
            //更新文本轴的最大最小极值
            var updateLabelExtreme = function (val) {
                if (lMaxval === null || val > lMaxval) { lMaxval = val; }
                if (lMinval === null || val < lMinval) { lMinval = val; }
            };
            //更新值轴的最大最小极值
            var updateValueExtreme = function (val) {
                if (vMaxval === null || val > vMaxval) { vMaxval = val; }
                if (vMinval === null || val < vMinval) { vMinval = val; }
            };
            if (multiple) {
                for (var i = 0, item; item = innerData[i]; i++) {
                    for (var j = 0; j < item.value.length; j++) {
                        var value = item.value[j];
                        var lValue = null; var vValue = value;
                        if (lValueType) {
                            //判断每个数值是否为二维数组
                            if (value.length != 2) {
                                throw new Error(wrongMsgs.WrongData + "'" + value + "'" + wrongMsgs.AxisVauleShouldBeDArray);
                            }
                            lValue = value[0]; vValue = value[1];
                        }
                        if (lValue) {
                            lValue = formatValue(false, lValueType, lValue, i, j, 0);
                            updateLabelExtreme(lValue);
                        }
                        vValue = formatValue(true, vValueType, vValue, i, j, lValueType ? 1 : undefined);
                        updateValueExtreme(vValue);
                    }
                }
                //堆积计算时，重新设定值坐标极值
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
                    var vValue = formatValue(true, vValueType, vValue, i, lValueType ? 1 : undefined);
                    updateValueExtreme(vValue);
                }
            }
            //根据文本轴的数据排序
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
            var axisData = { vValueType: vValueType, lValueType: lValueType, heapCompute: heapCompute, multiple: multiple, vInterval: tmpCompute.interval, vMaxValue: tmpCompute.maxvalue, vMinValue: tmpCompute.minvalue, vScalecount: tmpCompute.scalecount, tuftCount: tuftCount, demanCount: demanCount };
            if (lValueType) {
                tmpCompute = inner._getComputed(0, lValueType, options.labelAxis, lMinval, lMaxval, 6);
                axisData.lValueType = lValueType;
                axisData.lInterval = tmpCompute.interval;
                axisData.lMaxValue = tmpCompute.maxvalue;
                axisData.lMinValue = tmpCompute.minvalue;
                axisData.lScalecount = tmpCompute.scalecount;
            }
            //收集值轴的Label列表
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
            //用于收集文本轴的Label（在如曲线图等图形中，文本轴可能不是由字符串数组直接设定，而需要像值轴那样通过计算得来）
            var _collectTextLabels = function () {
                var textlabels = [];
                //文本轴需要通过计算
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
                        //优先取在单个数据中通过text属性设定的Label
                        for (var i = 0, data; data = inner.innerData[i]; i++) {
                            textlabels[i] = data.text || ' ';
                        }
                        //一维数组时，如果未在单个数据中设置任何Label，则尝试取labelAxis.labels
                        if (textlabels.__only(' ') && options.labelAxis.labels && options.labelAxis.labels.length) {
                            textlabels = options.labelAxis.labels;
                        }
                    }
                }
                return textlabels;
            };
            //收集值轴和文本轴的Label
            axisData.vLabels = _collectValueLabels();
            axisData.vScalecount = axisData.vLabels.length - 1;
            axisData.lLabels = _collectTextLabels();
            axisData.lScalecount = axisData.lLabels.length - 1;
            inner.tempData.axisData = axisData;
            return axisData;
        };
        //计算坐标轴的基本参数
        inner._computeAxis = function (valids) {
            if (!valids.AxisValid) { return null; }
            var options = inner.innerOptions;
            var axisData = inner.tempData.axisData;
            //在具体图形类别中赋值inner.tempData.upturnAxis=true，表指示坐标轴进行翻转，
            var upturnAxis = inner.tempData.upturnAxis;
            var canvasBorderWidth = inner.innerOptions.background.borderwidth || 0;
            var valids = valids || inner._calculateOutersValid();
            //图例占用的区域
            var legendSize = valids.legendValid ? inner._computeLegend() : null;
            //主标题和副标题共占用的高度（当主标题与副标题都不绘制时，留出空白高度，以免绘制的图形不美观）
            var titleHeight = inner.canvas.height / 35;
            if (valids.titleValid) { titleHeight = inner._computeTitle(valids).occupyTop; }

            var availableWidth = inner.canvas.width - canvasBorderWidth * 2 - (legendSize ? legendSize.occupyLeft : 0) - (legendSize ? legendSize.occupyRight : 0);
            var availableHeight = inner.canvas.height - canvasBorderWidth * 2 - titleHeight - (legendSize ? legendSize.occupyTop : 0) - (legendSize ? legendSize.occupyBottom : 0);

            //默认纵轴的宽度
            var tmpAxisWidth = availableWidth / (upturnAxis ? 8 : DChart.Const.Defaults.AxisYDrawableCut[axisData.vValueType]);
            //默认横轴的高度
            var tmpAxisHeight = availableHeight / DChart.Const.Defaults.AxisXDrawableCut;
            //文本轴占用的厚度
            var labelAxisLength = options.labelAxis.length || (upturnAxis ? tmpAxisWidth : tmpAxisHeight);
            //值轴占用的厚度
            var valueAxisLength = options.valueAxis.length || (upturnAxis ? tmpAxisHeight : tmpAxisWidth);
            //纵轴所占用的宽度（无论是否翻转）
            var yAxisWidth = upturnAxis ? labelAxisLength : valueAxisLength;
            //横轴所占用的高度（无论是否翻转）
            var xAxisHeight = upturnAxis ? valueAxisLength : labelAxisLength;
            //位于值轴顶部说明文字所占用的高度（当无说明文字时，也留出这样的高度以提高美观度）
            var captionLength = upturnAxis ? yAxisWidth / 8 : (valids.titleValid || legendSize && legendSize.occupyTop > 0 ? xAxisHeight / 8 : titleHeight * 2.5);
            //绘图区域距离右侧的距离（如果有图例，则距离图例的距离；如果无图例，则距离canvas右边界的距离）
            var margin = (valids.legendValid && legendSize.placeY == 'middle' ? captionLength / 2 : yAxisWidth / 3);
            //比例尺线宽
            var scaleLineWidth = options.scale.linewidth == null ? 1 : options.scale.linewidth;
            //关闭线的线宽
            var closeLineWidth = options.close.linewidth || scaleLineWidth || 1;
            //文本轴的线宽(未设置则默认为1)
            var labelAxisLineWidth = options.labelAxis.linewidth == null ? 1 : options.labelAxis.linewidth;
            //值轴的线宽(未设置则默认为0)
            var valueAxisLineWidth = options.valueAxis.linewidth == null ? 1 : options.valueAxis.linewidth;
            //横轴基本线宽度（无论是否翻转）
            var xAxisLineWidth = upturnAxis ? valueAxisLineWidth : labelAxisLineWidth;
            //纵轴基本线宽度（无论是否翻转）
            var yAxisLineWidth = upturnAxis ? labelAxisLineWidth : valueAxisLineWidth;
            //值轴线与线之间的距离
            var axisValueCut = (upturnAxis ? availableWidth - margin - yAxisWidth - captionLength : availableHeight - xAxisHeight - captionLength) / axisData.vScalecount;
            //交叉线的宽度
            var crossLength = options.cross.length || valueAxisLength / 15;

            var maxX = inner.canvas.width - canvasBorderWidth - margin - (legendSize ? legendSize.occupyRight : 0) - (upturnAxis ? captionLength : 0);
            var maxY = inner.canvas.height - xAxisHeight - canvasBorderWidth - (legendSize ? legendSize.occupyBottom : 0);
            var minX = upturnAxis ? (maxX - axisData.vScalecount * axisValueCut) : (canvasBorderWidth + yAxisWidth + (legendSize ? legendSize.occupyLeft : 0));
            var minY = upturnAxis ? (canvasBorderWidth + titleHeight + (legendSize && legendSize.occupyTop > 0 ? legendSize.occupyTop : xAxisHeight / 10)) : (maxY - axisData.vScalecount * axisValueCut);

            var multiple = axisData.multiple;
            //指示文本轴标志点的数目（如果没有正确传入labels，则根据数据大小确定labels数）
            var labelCount = axisData.lLabels.length || (multiple ? inner.innerData[0].value.length : inner.innerData.length);
            //指示文本轴的Label是否从最左端开始（折线图等图形一般都是从最左端开始标注，而柱状图则不是）
            var fromFirstLeft = DChart.Const.AxisFromFirstLeft.__contains(inner.GraphType);
            //文本轴Label之间的距离
            var labelDistance = (upturnAxis ? maxY - minY : maxX - minX) / (labelCount + (fromFirstLeft ? -1 : (multiple ? 1 / (inner.innerData.length + 1) : 1 / 3)));
            //文本轴Label的起始位置（相对于minX）
            var startPos = (upturnAxis ? minY : minX) + (fromFirstLeft ? 0 : labelDistance * (multiple ? (inner.innerData.length / 2 + 1) / (inner.innerData.length + 1) : 2 / 3));

            inner.axisSize = {
                labelAxisLength: labelAxisLength, valueAxisLength: valueAxisLength, yAxisWidth: yAxisWidth, xAxisHeight: xAxisHeight,
                minX: Math.ceil(minX), maxX: Math.ceil(maxX), minY: Math.ceil(minY), maxY: Math.ceil(maxY),
                axisValueCut: axisValueCut, crossLength: crossLength,
                scaleLineWidth: scaleLineWidth, closeLineWidth: closeLineWidth, labelAxisLineWidth: labelAxisLineWidth, valueAxisLineWidth: valueAxisLineWidth, xAxisLineWidth: xAxisLineWidth, yAxisLineWidth: yAxisLineWidth,
                startPos: startPos, labelDistance: labelDistance
            };
            return inner.axisSize;
        };
        //绘制坐标轴
        inner._createAxis = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.AxisValid) { return; }
            //用以记录文本轴及值轴的信息
            inner.coordinates.axis = {};
            var options = inner.innerOptions;
            var canvasBorderWidth = options.background.borderwidth || 0;
            if (typeof options.valueAxis.content != 'function') { return; }
            var axisData = inner.tempData.axisData;
            var axisSize = inner.axisSize || inner._computeAxis(valids);
            //坐标轴是否翻转
            var upturnAxis = inner.tempData.upturnAxis;
            //判断数据是否为时间格式
            var vTimeType = axisData.vValueType == 'd' || axisData.vValueType == 't';
            var lTimeType = axisData.lValueType == 'd' || axisData.lValueType == 't';

            var vfontsize = options.valueAxis.fontsize || (upturnAxis ? 1.3 : 1) * (axisSize.valueAxisLength - axisSize.valueAxisLineWidth) / (vTimeType ? 9 : 6);
            var vfontweight = (options.valueAxis.fontweight || 'normal');
            var vfontfamily = (options.valueAxis.fontfamily || options.fontFamily || DChart.Const.Defaults.AxisFontFamily);
            var vLabelFontColor = options.valueAxis.fontcolor;
            var vLineColor = options.valueAxis.linecolor || DChart.Const.Defaults.AxisLineColor;
            //当upturnAxis为false时，值轴(即Y轴)内Label的起始位置
            var vLabelStartX = (options.cross.show ? axisSize.crossLength : 3) + axisSize.valueAxisLineWidth + 3;

            //根据文本大小自动调整文本的旋转度
            //inYAxis：指示文本是否位于纵轴
            var formatRotate = function (rotate, inYAxis, labels, fontweight, fontsize, fontfamily) {
                //如果未设置文字旋转，则根据文字大小长度自动进行旋转
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
                                //指示文本是否超出横轴可用宽度
                                if (length1 * cosx > axisSize.yAxisWidth - vLabelStartX) {
                                    tmpOverlap = true; break;
                                }
                            }
                            else {
                                var length0 = i == 0 ? 0 : inner.DrawFigures.measureText(labels[i - 1], fontweight, fontsize, fontfamily);
                                var distance = upturnAxis ? axisSize.valueAxisLength : axisSize.labelDistance;
                                //指示文本之间是否相互遮蔽
                                if (i > 0 && distance * sinx < fontsize && (length1 + length0 > 2 * distance / cosx)) {
                                    tmpOverlap = true; break;
                                }
                            }
                        }
                        overlap = tmpOverlap;
                        //逆时针旋转
                        if (tmpOverlap) {
                            rotate -= 0.01;
                        }
                    }
                }
                return rotate;
            };
            //绘制一个值轴的Label(包括交叉线)
            var drawValueAxisLabels = function (words, x, y, first) {
                //收集要列出的文本
                var labels = axisData.vLabels;
                var contentX = axisSize.minX - vLabelStartX;
                var contentY = axisSize.maxY + (options.cross.show ? axisSize.crossLength : 3) + axisSize.valueAxisLineWidth + 3 + vfontsize;
                var rotate = formatRotate(options.valueAxis.fontrotate, !upturnAxis, labels, vfontweight, vfontsize, vfontfamily);
                //记录值轴的各个Label
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
            //为了与背景比例尺线条保持一致，因此独立(本来可以集成到drawValueAxisLabels方法中)绘制cross
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
            };    ////////////////////
            //绘制值轴基线
            if (axisSize.valueAxisLineWidth && axisSize.valueAxisLineWidth > 0) {
                if (upturnAxis) {
                    var y = axisSize.maxY + axisSize.valueAxisLineWidth / 2;
                    inner.DrawFigures.createLine(axisSize.minX - axisSize.labelAxisLineWidth, y, axisSize.maxX + axisSize.valueAxisLength / 20, y, axisSize.valueAxisLineWidth, vLineColor);
                }
                else {
                    var x = axisSize.minX - axisSize.valueAxisLineWidth / 2;
                    inner.DrawFigures.createLine(x, axisSize.maxY + axisSize.labelAxisLineWidth + 1, x, axisSize.minY - axisSize.valueAxisLength / 20, axisSize.valueAxisLineWidth, vLineColor);
                }
            }
            //绘制文本轴的Label
            var drawLabelAxisLabels = function () {
                var labels = axisData.lLabels;
                var fontsize = options.labelAxis.fontsize || (lTimeType ? axisSize.xAxisHeight / 6 : axisSize.xAxisHeight / 4.5);
                var fontweight = options.labelAxis.fontweight || vfontweight;
                var fontfamily = options.labelAxis.fontfamily || vfontfamily;
                var fontcolor = options.labelAxis.fontcolor || vLabelFontColor;
                var rotate = formatRotate(options.labelAxis.fontrotate, upturnAxis, labels, fontweight, fontsize, fontfamily);
                //记录文本轴的各个Label
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
            //绘制文本轴基线
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
            //绘制纵轴标题
            var drawYAxisTitle = function () {
                var ops = options.yAxisTitle;
                if (!ops.content) { return; }
                var fontsize = ops.fontsize || axisSize.yAxisWidth / 5;
                var fontcolor = ops.fontcolor || vLabelFontColor;
                var fontweight = ops.fontweight || 'bold';
                var fontfamily = ops.fontfamily || vfontfamily;
                var centerY = (axisSize.minY + axisSize.maxY) / 2;
                var right = axisSize.minX - axisSize.yAxisLineWidth - (axisSize.yAxisWidth - axisSize.yAxisLineWidth) * (ops.titlelocation || (upturnAxis ? 0.75 : DChart.Const.Defaults.AxisYTitleLocation[axisData.vValueType]));
                var textlength = inner.DrawFigures.createText(ops.content, right, centerY, 'center', fontweight, fontsize, fontfamily, fontcolor, -0.5);
                inner.coordinates.axis.yAxisTitle = { top: centerY - textlength / 2, bottom: centerY + textlength / 2, left: right - fontsize, right: right, fontsize: fontsize, length: textlength };
            };
            //绘制横轴标题
            var drawXAxisTitle = function () {
                if (!options.xAxisTitle.content) { return; }
                var fontsize = options.xAxisTitle.fontsize || axisSize.xAxisHeight / 5;
                var fontcolor = options.xAxisTitle.fontcolor || vLabelFontColor;
                var fontweight = options.xAxisTitle.fontweight || 'bold';
                var fontfamily = options.xAxisTitle.fontfamily || vfontfamily;
                var centerX = inner.canvas.width / 2;
                var bottom = axisSize.maxY + axisSize.xAxisLineWidth + (axisSize.xAxisHeight - axisSize.xAxisLineWidth) * (options.xAxisTitle.titlelocation || (upturnAxis ? 0.75 : DChart.Const.Defaults.AxisXTitleLocation[axisData.vValueType]));
                var textlength = inner.DrawFigures.createText(options.xAxisTitle.content, centerX, bottom, 'center', fontweight, fontsize, fontfamily, fontcolor);
                inner.coordinates.axis.xAxisTitle = { top: bottom - fontsize, bottom: bottom, left: centerX - textlength / 2, right: centerX + textlength / 2, fontsize: fontsize, length: textlength };
            };
            //绘制顶部的说明文字，如单位
            var drawCaption = function () {
                //如果未设置文字内容，则直接返回
                if (typeof options.caption.content != 'string') { return; }
                //字体大小
                var size = options.caption.fontsize || (vfontsize + (vTimeType ? 2 : -1));
                if (upturnAxis) {
                    var centerX = Math.min(axisSize.maxX + size * 2, inner.canvas.width - canvasBorderWidth - size);
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
            //绘制闭合线
            var drawCloseLine = function () {
                if (!(options.close.show && axisSize.closeLineWidth && axisSize.closeLineWidth > 0)) { return; }
                //当未设置闭合线的颜色时，默认与比例尺线的颜色一致
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
            //绘制页脚文本
            var drawFooter = function () {
                var ops = options.footer;
                if (!ops.content) { return; }
                var canvasSize = inner.coordinates.canvas;
                var fontsize = ops.fontsize || Math.min(canvasSize.height / 25, canvasSize.width / 50);
                var bottom = canvasSize.height * (1 - (ops.bottomdistance || DChart.Const.Defaults.FooterBottomDistance)) - canvasSize.borderwidth - fontsize / 2;
                var right = canvasSize.width * (1 - (ops.rightdistance || DChart.Const.Defaults.FooterRightDistance)) - canvasSize.borderwidth;
                var fontcolor = ops.fontcolor || DChart.Const.Defaults.FooterFontColor;
                var textlength = inner.DrawFigures.createText(ops.content, right, bottom, 'right', ops.fontweight, fontsize, ops.fontfamily, fontcolor);
                inner.coordinates.footer = { top: bottom - fontsize, bottom: bottom, right: right, left: right - textlength, fontsize: fontsize, length: textlength };
            };
            drawCaption();
            drawYAxisTitle();
            drawXAxisTitle();
            drawValueAxisLabels();
            drawLabelAxisLabels();
            drawValueAxisCrosses();
            drawCloseLine();
            drawFooter();
            //记录纵轴的宽度
            inner.coordinates.axis.yAxis = { width: axisSize.yAxisWidth };
            //记录横轴的高度
            inner.coordinates.axis.xAxis = { height: axisSize.xAxisHeight };
        };
        //绘制比例尺线
        inner._createScales = function (valids) {
            var valids = valids || inner._calculateOutersValid();
            if (!valids.AxisValid) { return; }
            var options = inner.innerOptions;
            //比例尺线宽
            var axisSize = inner.axisSize || inner._computeAxis(valids);
            var axisData = inner.tempData.axisData;
            var scaleLineWidth = axisSize.scaleLineWidth;
            var linecut = Math.floor((scaleLineWidth + 0.1) / 2);
            //比例尺线的颜色
            var scaleLineColor = options.scale.linecolor || DChart.Const.Defaults.ScaleLineColor;
            var scaleBackColors = options.scale.backcolors;
            var upturnAxis = inner.tempData.upturnAxis;
            if (scaleBackColors && scaleBackColors.length == 1) {
                inner.DrawFigures.createRectangleFill(axisSize.minX, axisSize.minY, axisSize.maxX - axisSize.minX, axisSize.maxY - axisSize.minY, scaleBackColors[0]);
            }
            //绘制值轴比例尺线
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
                //指示是否绘制关闭线
                var drawCloseLine = options.close.show && axisSize.closeLineWidth && axisSize.closeLineWidth > 0;
                //绘制文本轴比例尺线
                for (var i = 1; i < axisData.lScalecount + (drawCloseLine ? 0 : 1) ; i++) {
                    if (upturnAxis) {
                        //暂时没有考虑到翻转时的情况。不排除今后可能出现该需要
                    }
                    else {
                        var x = axisSize.startPos + i * axisSize.labelDistance;
                        if (scaleLineWidth > 0) {
                            inner.DrawFigures.createLine(x, axisSize.minY, x, axisSize.maxY + 1, scaleLineWidth, scaleLineColor);
                        }
                    }
                }
            }
        };
        //收集外围要素（标题、图例、坐标等）是否绘制信息
        inner._calculateOutersValid = function () {
            var ops = inner.innerOptions;
            var legendValid = ops.legend.show;
            //当需要绘制坐标且数据不为多维数组，则不绘制图例
            if (inner.tempData.axisData && !inner.tempData.axisData.multiple || inner.tempData.legendInvalid) {
                legendValid = false;
            }
            //判断是否绘制标题
            var titleValid = ops.title && ops.title.show && ops.title.content;
            //判断是否绘制副标题
            var subTitleValid = titleValid && ops.subTitle && ops.subTitle.show && ops.subTitle.content;
            var AxisValid = DChart.Const.DrawAxis.__contains(inner.GraphType);
            return { legendValid: legendValid, titleValid: titleValid, subTitleValid: subTitleValid, AxisValid: AxisValid };
        };
        //绘制出比例尺及正式图形元素外的“外围”图形
        inner._createAssists = function (valids) {
            inner._createBackground();
            inner._createTitle(valids);
            inner._createLegend();
            inner._createAxis(valids);
        };
        //开始绘图(包含标题、图例、及使用动画绘图)
        //mouseEvents：各个组件注册的自定义的鼠标事件
        inner._startDrawAndAnimation = function (drawData, mouseEvents) {
            var options = inner.innerOptions;
            //每次动画增加的完成度
            var animFrameAmount = (options.animation) ? 1 / DChart.Methods.CapValue(options.animationSteps, 100, 1) : 1;
            //动画帧计算方法
            var easingFunction = DChart.Const.AnimationAlgorithms[options.animationEasing];
            //完成度（%）
            var percentAnimComplete = (options.animation) ? 0 : 1;
            //浏览器支持专用于动画的方法
            var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
            var valids = inner._calculateOutersValid();
            inner.ClearBackGround();
            if (!inner.tempData.recreateAssists) { inner._createAssists(valids); }
            //获取可绘制图层信息
            var coordinate = inner._getDrawableCoordinate();
            if (inner.onBeforeAnimation) { inner.onBeforeAnimation(); }
            //通过递归的方式产生动画
            var animLoop = function () {
                //总完成度
                percentAnimComplete += animFrameAmount;
                if (inner.onAnimation) { inner.onAnimation(percentAnimComplete); }
                //单个动画元素的完成度（因动画需要可能临时>1，不过最终会变成1）
                var easeAdjustedAnimationPercent = (options.animation) ? DChart.Methods.CapValue(easingFunction(percentAnimComplete), null, 0) : 1;
                inner._clearDrawable(coordinate);
                if (options.scaleOverlay) {
                    if (inner.tempData.recreateAssists) { inner._createAssists(valids); }
                    drawData(easeAdjustedAnimationPercent, percentAnimComplete);
                    inner._createScales(valids);
                }
                else {
                    if (inner.tempData.recreateAssists) { inner._createAssists(valids); }
                    inner._createScales(valids);
                    drawData(easeAdjustedAnimationPercent, percentAnimComplete);
                }
                if (percentAnimComplete < 1) {
                    //动画未完成，则继续递归
                    requestAnimationFrame(animLoop);
                }
                else {
                    //执行鼠标事件
                    if (options.supportMouseEvents && typeof mouseEvents == 'function') {
                        //传入参数的目的在于，某些图形类型需要这些参数进行重绘（不传入也可以，但是传入的话能够通过省略计算这些参数待带来的效率损耗）
                        mouseEvents();
                    }
                    //执行动画完成后的事件（通过配置）
                    if (typeof options.onAnimationComplete == 'function') { options.onAnimationComplete(); }
                    if (inner.onFinish) { inner.onFinish(); }
                }
            };
            requestAnimationFrame(animLoop);
        };
        //获取鼠标相对于Canvas的位置（为了确保该计算方法准确，要求外层Div的border上下左右的width相同）。
        inner._getMouseLoction = function (e) {
            //判断浏览器是否直接支持Offset
            if (e.offsetX != null) {
                return { X: e.offsetX, Y: e.offsetY };
            }
            else {
                //兼容火狐
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
        inner.Initial();
    };
    return core;
};