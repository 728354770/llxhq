var maxtheard
var testurl
var lsat_date = 0
var all_down_sum = 0
var run = false
var checkIP = true
var visibl = true
var thread_down = []
var lsat_all_down = 0
var refresh_lay = 5000


var now_speed = 0
var now_local_ping = 0
var now_global_ping = 0

async function start_thread(index) {
    try {
        const response = await fetch(testurl, { cache: "no-store", mode: 'cors', referrerPolicy: 'no-referrer' })
        const reader = response.body.getReader();
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.cancel()
                start_thread(index);
                break;
            }
            if (!run) {
                reader.cancel()
                break
            }
            thread_down[index] += value.length
        }
    } catch (err) {
        console.log(err)
        if (run) start_thread(index);
    }
}
async function cale() {
    var all_down_a = sum(thread_down)
    now_speed = (all_down_a - lsat_all_down) / (new Date().getTime() - lsat_date) * 1000 / 1024 / 1024;
    if (visibl) document.getElementById("speed").innerText = show((all_down_a - lsat_all_down) / (new Date().getTime() - lsat_date) * 1000, ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'], [0, 0, 1, 2, 2, 2]);
    if (visibl) document.getElementById("mbps").innerText = show((all_down_a - lsat_all_down) / (new Date().getTime() - lsat_date) * 8000, ['Bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'], [0, 0, 0, 2, 2, 2]);
    if (!visibl) document.title = show((all_down_sum + all_down_a), ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], [0, 0, 0, 2, 2, 2]) + ' ' + show((all_down_a - lsat_all_down) / (new Date().getTime() - lsat_date) * 1000, ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'], [0, 0, 0, 2, 2, 2]);
    lsat_all_down = all_down_a
    lsat_date = new Date().getTime();
    if (run) setTimeout(cale, 1000)
    else {
        var avg_speed = 1000 * (all_down_a) / (new Date().getTime() - start_time)

        document.title = '流量消耗器'
        now_speed = 0
        document.getElementById("speed").innerText = show((avg_speed), ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'], [0, 0, 1, 2, 2, 2]);
        document.getElementById("mbps").innerText = show((avg_speed) * 8, ['Bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'], [0, 0, 0, 2, 2, 2]);
        lsat_all_down = 0
        document.getElementById('describe').innerText = '平均速度';
    }
}

async function total() {
    var all_down = sum(thread_down)
    if (visibl) document.getElementById("total").innerText = show((all_down_sum + all_down), ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], [0, 0, 1, 2, 2, 2]);
    if ((all_down_sum + all_down) >= Maximum && Maximum != 0) stop()
    if (run) setTimeout(total, 16)
    else {
        all_down_sum += all_down;
        document.getElementById("total").innerText = show((all_down_sum), ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], [0, 0, 1, 2, 2, 2]);
    }
}

async function start() {
    if (all_down_sum >= Maximum && Maximum != 0) {
        all_down_sum = 0
    }
    maxtheard = document.getElementById("thread").value;
    testurl = document.getElementById("link").value;
    if (testurl.length < 10) {
        alert("链接不合法")
        return;
    }
    testurl = testurl.substring(0, 5).toLowerCase() + testurl.substring(5, testurl.length);
    if (!checkURL(testurl)) {
        alert("链接不合法")
        return;
    }
    if (testurl.startsWith("http://")) {
        alert("由于浏览器安全限制，不支持http协议，请使用https协议")
        return;
    }
    if (!testurl.startsWith("https://")) {
        alert("链接不合法")
        return;
    }
    document.getElementById('do').innerText = '正在检验链接...';
    document.getElementById('do').disabled = true;

    try {
        const response = await fetch(testurl, { cache: "no-store", mode: 'cors', referrerPolicy: 'no-referrer' })
        const reader = response.body.getReader();
        const { value, done } = await reader.read();
        if (value.length <= 0) throw "资源响应异常";
        reader.cancel()
    } catch (err) {
        console.warn(err)
        document.getElementById('do').innerText = '开始';
        document.getElementById('do').disabled = false;
        alert("该链接不可用，如果你能够正常访问该链接，那么很有可能是浏览器的跨域限制")
        return
    }
    document.getElementById('describe').innerText = '实时速度';
    document.getElementById('do').innerText = '停止';
    document.getElementById('do').disabled = false;
    var num = maxtheard
    lsat_all_down = 0
    start_time = new Date().getTime()
    run = true
    thread_down = []
    while (num--) {
        thread_down[num] = 0
        start_thread(num)
    }
    cale()
    total()
}

function stop() {
    run = false
    document.getElementById('do').innerText = '开始';
}

function sum(arr) {
    var s = 0;
    for (var i = 0; i < arr.length; i++) {
        s += arr[i];
    }
    return s;
}

function botton_clicked() {
    if (run) {
        stop();
    } else {
        start();
    }
}

function checkURL(URL) {
    var str = URL;
    var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    var objExp = new RegExp(Expression);
    if (objExp.test(str) == true) {
        return true;
    } else {
        return false;
    }
}

function laycn() {
    if (visibl) {
        var start_ti = new Date().getTime();
        fetch("https://www.baidu.com/", { method: "HEAD", cache: "no-store", mode: 'no-cors', referrerPolicy: 'no-referrer' })
            .then(function() {
                var lay = new Date().getTime() - start_ti;
                now_local_ping = lay
                document.getElementById("laycn").innerText = lay + 'ms';
            })
            .catch(error => document.getElementById("laycn").innerText = '-ms');
    }
    setTimeout(laycn, 2000)
}

function laygb() {
    if (visibl) {
        var start_ti = new Date().getTime();
        fetch("	https://cp.cloudflare.com/", { method: "HEAD", cache: "no-store", mode: 'no-cors', referrerPolicy: 'no-referrer' })
            .then(function() {
                var lay = new Date().getTime() - start_ti;
                now_global_ping = lay
                document.getElementById("laygb").innerText = lay + 'ms';
            })
            .catch(error => document.getElementById("laygb").innerText = '-ms');
    }
    setTimeout(laygb, 2000)
}

function laygithub() {
    if (visibl) {
        var start_ti = new Date().getTime();
        fetch("	https://github.com/", { method: "HEAD", cache: "no-store", mode: 'no-cors', referrerPolicy: 'no-referrer' })
            .then(function() {
                var lay = new Date().getTime() - start_ti;
                document.getElementById("github").innerText = lay + 'ms';
            })
            .catch(error => document.getElementById("github").innerText = '-ms');
    }
    setTimeout(laygithub, 2000)
}

function layyoutube() {
    if (visibl) {
        var start_ti = new Date().getTime();
        fetch("	https://www.youtube.com/", { method: "HEAD", cache: "no-store", mode: 'no-cors', referrerPolicy: 'no-referrer' })
            .then(function() {
                var lay = new Date().getTime() - start_ti;
                document.getElementById("youtube").innerText = lay + 'ms';
            })
            .catch(error => document.getElementById("youtube").innerText = '-ms');
    }
    setTimeout(layyoutube, 2000)
}


laycn()
laygb()
laygithub()
layyoutube()

document.addEventListener("visibilitychange", function() {
    var string = document.visibilityState
    if (string === 'hidden') {
        visibl = false
        if (run && !document.getElementById("customSwitch2").checked) botton_clicked();
    }
    if (string === 'visible') {
        visibl = true
        document.title = "流量消耗器"
    }
});



var chartDom = document.getElementById('dv');
var myChart = echarts.init(chartDom);
var option;

option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        }
    },
    legend: {
        data: ['速率', '百度', 'Cloudflare']
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [{
        type: 'time',
        name: "时间",
        boundaryGap: false,
        axisLabel: { show: false }
    }],
    yAxis: [
        {
            type: 'value',
            name: "延迟 (ms)",
            splitLine: { show: false }
        },
        {
            type: 'value',
            name: "速率 (MB/s)",
            splitLine: { show: false }
        }
    ],
    series: [
        {
            name: '速率',
            type: 'line',
            yAxisIndex: 1,
            areaStyle: {},
            emphasis: { focus: 'series' },
            data: []
        },
        {
            name: '百度',
            type: 'line',
            data: []
        },
        {
            name: 'Cloudflare',
            type: 'line',
            data: []
        }
    ]
};

option && myChart.setOption(option);

function dv() {
    if (visibl) {
        let now = new Date();

        option.series[0].data.push({
            name: now.toString(),
            value: [now.getTime(), parseFloat(now_speed).toFixed(1)]
        });
        option.series[1].data.push({
            name: now.toString(),
            value: [now.getTime(), now_local_ping]
        });
        option.series[2].data.push({
            name: now.toString(),
            value: [now.getTime(), now_global_ping]
        });

        myChart.setOption({
            series: option.series
        });
    }
    setTimeout(dv, 1000);
}

dv();
