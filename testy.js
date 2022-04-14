
function rollDice(callback,myTime) {
    var i = Math.floor((Math.random() * 25) + 5);
    var j = i;
    var test = setInterval(function() {
        i--;
        var value = Math.floor((Math.random() * 6) + 1);
        console.log(value)
        if(i < 1) {
            clearInterval(test);
            callback(value);
        }
    }, 50);
}

rollDice(function() {
    rollDice(8)
    console.log("done" )
});
console.log("MArky here")

function speedRamp(slot,speed,finalSpeed,slowDownTime,wait,newDirection,newSpeed)
{
    let steps = 10;
    if(speed < finalSpeed)
    {
       increment = (speed - finalSpeed)/ steps;
    }
    else
    {
       increment = (finalSpeed - speed)/ steps;
    }
    var loopCount = 1;
    var interval = setInterval(function () {
        if (loopCount <= steps) {
            console.log(loopCount + " " + speed);
            if(speed < finalSpeed)
            {
              speed = Math.round((speed - increment));
            }
            else
            {
              speed = Math.round((speed + increment));
            }
            //setSpeed(slot,speed)
            loopCount++;
        }
        else {
            speed = finalSpeed;
            console.log(loopCount + " " + speed);
            //setSpeed(slot,speed);
            clearInterval(interval);
            callback(value);
        }
    }, slowDownTime);
}