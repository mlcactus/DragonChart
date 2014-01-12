/*
  本js文件用于延迟加载包括Pie、Ring、Bar等dragonchart支持的27种图表类型，用户在使用每种图表类型时，该js文件会自动访问服务器中相应所需的js文件。
  因此，在用户不确定具体会使用哪几种图表类型时(如使用组合图功能时)，只需引用core.js+all.delay.js即可。
  This js is used for delay loading needed js of 27 types of graphics that dragonchart supports. When user call single type of graphic, this js will automaticly load the needed js in the server.
  Therefore, when user can't make sure which types of graphics will be needed(take plugins as example), he can just quote core.js+all.delay.js.
*/

(function () {
    function loadScript(url) {
        var xmlhttp;
        if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); }
        else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }

        var allScript = document.getElementsByTagName("script");
        for (var i = 0, _script; _script = allScript[i]; i++) {
            if (_script.src.indexOf('dragonchart.all.delay.') >= 0) {
                allScript = _script; break;
            }
        }
        try {
            var url = allScript.src.replace('dragonchart.all.delay.', url);
            xmlhttp.open("Get", url, false);
            xmlhttp.send();
            eval(xmlhttp.responseText)
        }
        catch (ex) {
            throw new Error('请确保文件：' + url + ' 在服务器中存在！\n' + 'Please make sure that：' + url + '  exists in the server!');
        }
    }
    DChart.Pie = function (_targetdiv, _language) {
        loadScript('dragonchart.pie.');
        return new DChart.Pie(_targetdiv, _language);
    };
    DChart.Ring = function (_targetdiv, _language) {
        loadScript('dragonchart.ring.');
        return new DChart.Ring(_targetdiv, _language);
    };
    DChart.MultiRing = function (_targetdiv, _language) {
        loadScript('dragonchart.multiring.');
        return new DChart.MultiRing(_targetdiv, _language);
    };
    DChart.Polar = function (_targetdiv, _language) {
        loadScript('dragonchart.polar.');
        return new DChart.Polar(_targetdiv, _language);
    };
    DChart.Bar = function (_targetdiv, _language) {
        loadScript('dragonchart.bar.');
        return new DChart.Bar(_targetdiv, _language);
    };
    DChart.Histogram = function (_targetdiv, _language) {
        loadScript('dragonchart.histogram.');
        return new DChart.Histogram(_targetdiv, _language);
    };
    DChart.HeapBar = function (_targetdiv, _language) {
        loadScript('dragonchart.heapbar.');
        return new DChart.HeapBar(_targetdiv, _language);
    };
    DChart.HeapHistogram = function (_targetdiv, _language) {
        loadScript('dragonchart.heaphistogram.');
        return new DChart.HeapHistogram(_targetdiv, _language);
    };
    DChart.Line = function (_targetdiv, _language) {
        loadScript('dragonchart.line.');
        return new DChart.Line(_targetdiv, _language);
    };
    DChart.Points = function (_targetdiv, _language) {
        loadScript('dragonchart.points.');
        return new DChart.Points(_targetdiv, _language);
    };
    DChart.Area = function (_targetdiv, _language) {
        loadScript('dragonchart.area.');
        return new DChart.Area(_targetdiv, _language);
    };
    DChart.Radar = function (_targetdiv, _language) {
        loadScript('dragonchart.radar.');
        return new DChart.Radar(_targetdiv, _language);
    };
    DChart.RangeBar = function (_targetdiv, _language) {
        loadScript('dragonchart.rangebar.');
        return new DChart.RangeBar(_targetdiv, _language);
    };
    DChart.RangeHistogram = function (_targetdiv, _language) {
        loadScript('dragonchart.rangehistogram.');
        return new DChart.RangeHistogram(_targetdiv, _language);
    };
    DChart.NestedPie = function (_targetdiv, _language) {
        loadScript('dragonchart.nestedpie.');
        return new DChart.NestedPie(_targetdiv, _language);
    };
    DChart.RangeArea = function (_targetdiv, _language) {
        loadScript('dragonchart.rangearea.');
        return new DChart.RangeArea(_targetdiv, _language);
    };
    DChart.QueueBar = function (_targetdiv, _language) {
        loadScript('dragonchart.queuebar.');
        return new DChart.QueueBar(_targetdiv, _language);
    };
    DChart.QueueHistogram = function (_targetdiv, _language) {
        loadScript('dragonchart.queuehistogram.');
        return new DChart.QueueHistogram(_targetdiv, _language);
    };
})();