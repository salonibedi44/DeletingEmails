document.getElementById('body').addEventListener('mousemove', e => {
    let x = e.offsetX / window.innerWidth * 100; //offsetX relative to container, pageX relative to document (referring to mouse)
    let y = e.offsetY/ window.innerHeight * 100;
    //let y = e.pageY - e.offsetY;
    //let xy = x + y;
    document.body.style.background = `radial-gradient(circle at ${x}% ${y}%, #4ac1ff, #795bb0)`;
});

/*
function changeGradient(e) {
    x = 
}


var originalBg = body.css("background");


body.mousemove(function (e) 
{
    x = e.pageX - this.offsetLeft;
    y = e.pageY - this.offsetTop;
    xy = x + y;
    movingBG = "linear-gradient(" + xy + "deg, #4ac1ff, #795bb0)";
    this.css({
        'background': movingBG
      });

}).mouseleave(function() {
    this.css({background:originalBg});
});

*/