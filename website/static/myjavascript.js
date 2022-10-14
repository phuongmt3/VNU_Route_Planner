$(document).ready(function() {
    $('#myCanvas').height($('#myCanvas').width() / 1.45);
    $(window).resize(function() {
        $('#myCanvas').height($('#myCanvas').width() / 1.45);
    });

    $('#myCanvas').click(function(e) {
        ctx.clearRect(0, 0, 200, 200);
        var offset = $(this).offset();
        var X = (e.pageX - offset.left) / $(this).width();
        var Y = (e.pageY - offset.top) / $(this).height();
        $('#coord').text('X: ' + X + ', Y: ' + Y + ', w' + $(this).width() + ', h' + $(this).height());
    });
    var map = document.getElementById('myCanvas');
    var ctx = map.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    ctx.moveTo(50, 50);
    ctx.lineTo(100, 100);
    ctx.lineTo(150, 50);
    ctx.stroke();
});