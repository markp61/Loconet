function saymyName(name)
{
    console.log("My NAME is : " + name)
    
}

const wait = (milliseconds) => {
    console.log("im Waiting.......")
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  async function doaWait() {
        console.log("1st thing ... wait")
        speedRamp(1,100,0,1000)
        await wait(10000)
        console.log("...wait over ... second thing")
        saymyName("Rosco")

  };  
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
              
          }
      }, slowDownTime);
  }
  doaWait()

  saymyName("rubi")