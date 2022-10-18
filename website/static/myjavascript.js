$(document).ready(function() {
    $('#myCanvas').height($('#myCanvas').width() / 1.45);
    $(window).resize(function() {
        $('#myCanvas').height($('#myCanvas').width() / 1.45);
    });

    $('#myCanvas').click(function(e) {
        //ctx.clearRect(0, 0, 200, 200);
        var path = [0.0795156968135179, 0.5319700584495670,
                    0.112242725151082, 0.530507230253896,
                    0.110922324700033, 0.369681043155602,
                    0.175621946801424, 0.210769453522765,
                    0.194107553116107, 0.224171635780956,
                    0.3233421400823890, 0.2254964814443370
                    ];
        var map = document.getElementById('myCanvas');
        var ctx = map.getContext("2d");
        var w = map.width;
        var h = map.height;
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "blue";
        ctx.moveTo(path[0] * w, path[1] * h);
        for (var i = 2; i < path.length; i += 2) {
            ctx.lineTo(path[i] * w, path[i + 1] * h);
        }
        ctx.stroke();
        var offset = $(this).offset();
        var X = (e.pageX - offset.left) / $(this).width();
        var Y = (e.pageY - offset.top) / $(this).height();
        $('#coord').text('X: ' + X + ', Y: ' + Y + ', w' + $(this).width() + ', h' + $(this).height());
    });
    /*var path = [0.1122427251510825, 0.5305072302538962,
                0.11092232470003371, 0.36968104315560274,
                0.17562194680142462, 0.2107694535227651,
                0.19410755311610772, 0.22417163578095622,
                0.3221863968678408, 0.22800083071186797];
    var map = document.getElementById('myCanvas');
    var ctx = map.getContext("2d");
    var w = map.width;
    var h = map.height;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    ctx.moveTo(path[0] * w, path[1] * h);
    for (var i = 2; i < path.length; i += 2) {
        ctx.lineTo(path[i] * w, path[i + 1] * h);
    }
    ctx.stroke();*/
});

//error line wrong place at the beginning when not at full size