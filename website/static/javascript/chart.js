console.log(lop)
function setupData() {
    var data = [];
    for (var gd = 0; gd < lop.length; gd++) {
        //data.push([]);
        for (var r = 0; r < lop[gd].length; r++)
            for (var i = 0; i < lop[gd][r].length; i++){
                var clas = lop[gd][r][i];
                var start = '2000-01-01 ' + (clas[5] < 10 ? '0' + String(clas[5]) + ':00:00' : String(clas[5]) + ':00:00');
                var end = '2000-01-01 ' + (clas[6] - 1 < 10 ? '0' + String(clas[6]-1) + ':50:00' : String(clas[6]-1) + ':50:00');
                //data[gd].push({
                if (gd == 6)
                    data.push({
                        name: clas[4],
                        x: [start, end],
                        y: [r, r],
                        marker: {color: 'green'},
                        //hoverinfo: 'none',
                        //visible: false
                    });
            }
    }
    return data;
}

data = setupData();console.log(data);
shapes = [];
for (var i = 0; i < data.length; i++)
    shapes.push({x0: data[i].x[0],
                  x1: data[i].x[1],
                  y0: data[i].y[0] - 0.4,
                  y1: data[i].y[0] + 0.4,
                  line: {width: 0},
                  type: 'rect',
                  xref: 'x',
                  yref: 'y',
                  opacity: 1,
                  fillcolor: 'rgb(0, 50, 100)'});

layout = {
  title: 'Gantt Chart', 
  width: 900,
  xaxis: {
    type: 'date',
    showgrid: true,
    zeroline: false,
    range: ['2000-01-01 6:30:00', '2000-01-01 21:30:00'],
    tickformat: '%H:%M'
  },
  yaxis: {
    range: [-1, 12],
    showgrid: true, 
    ticktext: room[6],
    tickvals: Array.from(Array(room[6].length).keys()),
    zeroline: false,
    autorange: false
  },
  height: 600, 
  shapes: shapes,
  hovermode: 'closest',
  showlegend: false,
};
Plotly.plot('plotly-div', {
  data: data,
  layout: layout,
  displayModeBar: false
});
