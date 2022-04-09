//let speed = 23
//let slowDownTime = 1000;


myName("mark")
//dynamicVariable()
dynamicVariable2("autoTwoOn")

function myName(name)
{
  
  console.log ("my name is " + name)
}

function dynamicVariable()
{
  var myVariables = {};
  var variableName = 'foo';
  
  myVariables[variableName] = 42;
  console.log(myVariables.foo) // = 42

}
function dynamicVariable2(varName)
{
  var myVariables = {};
  var variableName = 'foo';
  
  myVariables[variableName] = varName;
  console.log(myVariables.foo) // = 42
  if(myVariables.foo =="autoTwoOn")
  {
    myVariables.foo = 1
    console.log(myVariables.foo)
  }

}
slowDown(03,100,43,500)
function slowDown(slot,speed,finalSpeed,slowDownTime)
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
            console.log(speed);
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
            console.log(speed);
            //setSpeed(slot,speed)
            clearInterval(interval);
        }
    }, slowDownTime);
}