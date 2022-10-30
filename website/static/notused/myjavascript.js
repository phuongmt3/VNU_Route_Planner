// $(document).ready(function() {
//     $('#myCanvas').height($('#myCanvas').width() / 1.45);
//     $(window).resize(function() {
//         $('#myCanvas').height($('#myCanvas').width() / 1.45);
//     });

//     $('#myCanvas').click(function(e) {
//         var offset = $(this).offset();
//         var X = (e.pageX - offset.left) / $(this).width();
//         var Y = (e.pageY - offset.top) / $(this).height();
//         $('#coord').text('X: ' + X + ', Y: ' + Y + ', w' + $(this).width() + ', h' + $(this).height());
//     });

//     if (clicked) {
//         //ctx.clearRect(0, 0, 200, 200);
//         var map = document.getElementById('myCanvas');
//         var ctx = map.getContext("2d");
//         var w = map.width;
//         var h = map.height;
//         ctx.beginPath();
//         ctx.lineWidth = 1;
//         ctx.strokeStyle = "blue";
//         ctx.moveTo(posx[0] * w, posy[0] * h);
//         for (var i = 1; i < posx.length; i++) {
//             ctx.lineTo(posx[i] * w, posy[i] * h);
//         }
//         ctx.stroke();
//         ctx.closePath();
//     }

// });
