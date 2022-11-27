if ($('#chooseDate').val() === "")
    document.getElementById('chooseDate').valueAsDate = new Date();

$('#chooseDate').change(() => {
    var data = {
        "date": $('#chooseDate').val()
    };

    fetch(`/chart/findSchedule`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(function (response) {
            return response.json();
        }).then(function (response) {
            lop = response[0];
            giangduong = response[1];
            week = response[2];
            week > 0 ? $('#weekNum').text("Week " + String(week)) : $('#weekNum').text("Out of semester ");

            drawChart();
        });
});

drawChart();


function setupData() {
    var traces = [];
    for (var gd = 0; gd < lop.length; gd++) {
        var visibility = false;
        if (gd == 0)
            visibility = true;

        var duration = [], startTime = [], room = [], subject = [], opacity = [];
        var giangvien = [], classID = [], svCnt = [], classType = [];
        for (var i = 0; i < lop[gd].length; i++) {
            var clas = lop[gd][i];
            duration.push((clas[6] - clas[5]) * 60 - 10);
            startTime.push(clas[5] * 60);
            var roomName ='P.' + clas[1];
            room.push(roomName.length > 8 ? roomName.substr(0,8) + '...' : roomName);
            subject.push(clas[4] + '<br>' + String(clas[5]) + ':00-' + String(clas[6] - 1) + ':50');
            opacity.push(0.4);
            giangvien.push(clas[8]);
            classID.push(clas[7]);
            svCnt.push(clas[2]);
            classType.push(clas[3]);
        }

        traces.push({
            x: duration,
            base: startTime,
            y: room,
            name: giangduong[gd],
            text: subject,
            giangvien: giangvien,
            classID: classID,
            svCnt: svCnt,
            classType: classType,
            type: 'bar',
            orientation: 'h',
            marker: {color: 'DarkRed', opacity: opacity},
            hovertemplate: '<b>%{text}</b>',
            textposition: 'none',
            visible: visibility
        });
    }

    return traces;
}

function visibleGD(id) {
    var res = [];
    for (var i = 0; i < giangduong.length; i++)
        res.push(false);
    res[id] = true;
    return res;
}

function setupBtnList() {
    var list = [];
    for (var gd = 0; gd < giangduong.length; gd++) {
        list.push({
            args: [{'visible': visibleGD(gd)}, {'annotations[0]': 'remove'}],
            label: giangduong[gd],
            method: 'update'
        });
    }
    return list;
}

function drawChart() {
    var updatemenus = [
    {
        buttons: setupBtnList(),
        direction: 'down',
        pad: {'r': 10, 't': 10},
        showactive: true,
        type: 'dropdown',
        x: 0,
        xanchor: 'left',
        y: 1.2,
        yanchor: 'top',
        maxHeight: 50,
        font: {color: '#5072a8'}
    }];

    var tickval = [];
    var ticktext = [];
    for (var i = 420; i <= 1260; i += 60) {
        tickval.push(i);
        var text = i/60 < 10 ? '0' + String(i/60) + ':00' : String(i/60) + ':00';
        ticktext.push(text);
    }
    var today = new Date();
    var cur = today.getHours() * 60 + today.getMinutes();

    layout = {
      title: {
        text: 'Class Timeline',
        font: {
          family: 'Courier New, monospace',
          size: 35
          },
      },
      width: 1200,
      xanchor: 'left',
      x: 0,
      y: 1.2,
      updatemenus: updatemenus,
      xaxis: {
          range: [390, 1260],
          showgrid: true,
          tickvals: tickval,
          ticktext: ticktext,
          fixedrange: true
      },
      yaxis: {
        title: {
          text: 'Room',
          font: {
            size: 18,
            color: '#7f7f7f'
          }
        },
        automargin: true,
        fixedrange: true
      },
      shapes: [{
        type: 'line',
        xref: 'x',
        yref: 'paper',
        x0: cur,
        x1: cur,
        y0: 0,
        y1: 1,
        line: {
            color: 'red',
            width: 3
        }
      }],
      height: 650,
      hovermode: 'closest',
      showlegend: false
    };

    Plotly.newPlot('plotly-div', setupData(), layout, {
        displayModeBar: false
    });

    myPlot = document.getElementById('plotly-div');
    myPlot.on('plotly_click', info => {
        var point = info.points[0];
        var pn = point.pointNumber;
        var newAnnotation = {
            x: point.xaxis.d2l(point.x) - 12,
            y: point.yaxis.d2l(point.y),
            arrowhead: 6,
            ax: 0,
            ay: -70,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            arrowcolor: point.fullData.marker.color,
            font: {size:12},
            bordercolor: point.fullData.marker.color,
            borderwidth: 3,
            borderpad: 4,
            text: '<b>Giảng viên</b>    '+ point.data.giangvien[pn] + '<br>' +
                  '<i>' + point.data.classID[pn] + '  -  ' + point.data.classType[pn] + '</i><br>' +
                  '<b>' + point.data.svCnt[pn] + '</b> <i>Sinh viên</i><br>' +
                  '<b>Phòng</b>   '+(point.y)
        };

        if((myPlot.layout.annotations || []).length) {
           var foundCopy = false;
           myPlot.layout.annotations.forEach((ann, sameIndex) => {
             if(ann.x === newAnnotation.x && ann.y === newAnnotation.y)
               foundCopy = true;
             Plotly.relayout('plotly-div', 'annotations[0]', 'remove');
           });
           if(foundCopy) return;
         }

         Plotly.relayout('plotly-div', 'annotations[0]', newAnnotation);
    });

    myPlot.on('plotly_hover', function(data){
        var point = data.points[0];
        var pn = point.pointNumber;
        var tn = point.curveNumber;
        var opacity = point.data.marker.opacity;
        opacity[pn] = 1;

        Plotly.restyle('plotly-div', {'marker[tn].opacity': opacity});
    });

    myPlot.on('plotly_unhover', function(data){
        var point = data.points[0];
        var pn = point.pointNumber;
        var tn = point.curveNumber;
        var opacity = point.data.marker.opacity;
        opacity[pn] = 0.4;

        Plotly.restyle('plotly-div', {'marker[tn].opacity': opacity});
    });

    var xaxis = myPlot._fullLayout.xaxis;
    var yaxis = myPlot._fullLayout.yaxis;
    var l = myPlot._fullLayout.margin.l;
    var t = myPlot._fullLayout.margin.t;
    var marginLeft = parseInt($(".user-select-none").css("margin-left").split("p")[0]);

    myPlot.addEventListener('contextmenu', e => {
        if (e.y <= 150 || e.x <= 100 || e.x >= 1200)
            return;
        e.preventDefault();
        var x = xaxis.p2c(e.x - marginLeft - l);
        var y = yaxis.p2c(e.y - marginLeft - t);
        Plotly.relayout('plotly-div', {'shapes[0].x0': x, 'shapes[0].x1': x});
    });
}