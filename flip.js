function saymyName(name)
{
    console.log("My NAME is : " + name)
    
}

const wait = (milliseconds) => {
    console.log("im Waiting.......")
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  
  async function speedRamp(slot,speed,finalSpeed,slowDownTime,waitTime,newDirection,newSpeed)
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

      for (let i = 0; i < steps; i++) {
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
              await wait(slowDownTime)
              console.log("wait OVER")
          }
          
              speed = finalSpeed;
              console.log(loopCount + " " + speed);
              //setSpeed(slot,speed);
              console.log("All done")
              if(waitTime>0)
              {
                await wait(waitTime)
              }
              console.log(newDirection)
              console.log(newSpeed)


              
          
   
  }
speedRamp(1,100,0,100,10000,"FWD",50)
saymyName("CALLIE")