console.log(lop)
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
            week > 0 ? $('#weekNum').text("Week: " + String(week)) : $('#weekNum').text("Week: Out of semester ");

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

        var duration = [], startTime = [], room = [], subject = [];
        for (var i = 0; i < lop[gd].length; i++) {
            var clas = lop[gd][i];
            duration.push((clas[6] - clas[5]) * 60 - 10);
            startTime.push(clas[5] * 60);
            var roomName ='P.' + clas[1];
            room.push(roomName.length > 8 ? roomName.substr(0,8) + '...' : roomName);
            subject.push(clas[4] + '<br>' + String(clas[5]) + ':00-' + String(clas[6] - 1) + ':50');
        }

        traces.push({
            x: duration,
            base: startTime,
            y: room,
            name: giangduong[gd],
            text: subject,
            type: 'bar',
            orientation: 'h',
            marker: //{color: 'MediumAquamarine'},
            {color: 'SeaGreen'},
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
            args: [{'visible': visibleGD(gd)}],
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
        font: {color: '#5072a8'}
    }];

    var tickval = [];
    var ticktext = [];
    for (var i = 420; i <= 1260; i += 60) {
        tickval.push(i);
        var text = i/60 < 10 ? '0' + String(i/60) + ':00' : String(i/60) + ':00';
        ticktext.push(text);
    }

    layout = {
      title: 'Timeline',
      updatemenus: updatemenus,
      width: 1000,
      xaxis: {
          range: [390, 1260],
          showgrid: true,
          tickvals: tickval,
          ticktext: ticktext
      },
      yaxis: {
        title: 'Room'
      },
      height: 600,
      hovermode: 'closest',
      showlegend: false,
    };

    Plotly.newPlot('plotly-div', setupData(), layout, {displayModeBar: false});
}