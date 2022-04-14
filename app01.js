//setup
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

  //Locos Array
  let locoList = [
    {id: 0, loco: "Class 108", address: 08, slot: 0, direction: 0, speed: 0,  block: 0, ready: 0,browserName: "loco08"},
    {id: 1, loco: "Class 108 Passengers", address: 09, slot: 0, direction: 0, speed: 0, block: 0, ready: 0,browserName: "loco09"},
    {id: 2, loco: "Class 415", address: 03, slot: 0, direction: 0, speed: 0,  block: 0, ready: 0,browserName: "loco03"},
    {id: 3, loco: "Class 50", address: 50, slot: 0 , direction: 0, speed: 0,  block: 0, ready: 0,browserName: "loco50"},
    {id: 4, loco: "Class 121", address: 21, slot: 0, direction: 0, speed: 0,  block: 0, ready: 0,browserName: "loco21"},
    {id: 5, loco: "GWR", address: 94, slot: 0, direction: 0, speed: 0, block: 0 ,ready: 0,browserName: "loco94"},
  ]
//
  //Locos Array
  let blockList = [
    {block: 1, blockOccupied: 0, blockRequested:0,blockHighCode:"0050",blockLowCode:"0040"} ,
    {block: 2, blockOccupied: 0, bloclRequested:0,blockHighCode:"0070",blockLowCode:"0060"} ,
    {block: 3, blockOccupied: 0, bloclRequested:0,blockHighCode:"0150",blockLowCode:"0140"} ,
    {block: 4, blockOccupied: 0, bloclRequested:0},
    {block: 5, blockOccupied: 0, bloclRequested:0},
    {block: 6, blockOccupied: 0, bloclRequested:0},
    {block: 7, blockOccupied: 0, bloclRequested:0},
    {block: 8, blockOccupied: 0, bloclRequested:0},
    {block: 9, blockOccupied: 0, bloclRequested:0},
    {block: 10, blockOccupied: 0, bloclRequested:0},
    {block: 11, blockOccupied: 0, bloclRequested:0},
    {block: 12, blockOccupied: 0, bloclRequested:0},
    {block: 13, blockOccupied: 0, bloclRequested:0},
    {block: 14, blockOccupied: 0, bloclRequested:0},
    {block: 15, blockOccupied: 0, bloclRequested:0},
    {block: 16, blockOccupied: 0, bloclRequested:0},

  ]
  //global variables
  var autonOneRunning
  var autoOneOn
  var autoTwoRunning
  var autoTwoOn
  var autoThreeRunning
  var autoThreeOn
  bloxUsedCount = [] 

  


//Arduino Port Setup
const { SerialPort } = require('serialport');
const { Console, dir } = require('console');
const { result, templateSettings } = require('lodash');
const { title } = require('process');
const port = new SerialPort({ path: '/dev/cu.usbmodem144201', baudRate: 9600 })

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
})

//Loconet Port Setup
const loconet = new SerialPort({ path: '/dev/cu.usbmodemDxP4F0FD1', baudRate: 56700 })

// Open errors will be emitted as an error event
loconet.on('error', function(err) {
  console.log('Error: ', err.message +"*** IS LOCONET PLUGGED IN ??!!! ***")
})




server.listen(3000, () => {
  console.log('listening on *:3000');
});

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});



app.get('/', (req, res) => {
  const blogs = [
    {title: 'Yoshi finds eggs', snippet: 'Lorem ipsum dolor sit amet consectetur'},
    {title: 'Mario finds stars', snippet: 'Lorem ipsum dolor sit amet consectetur'},
    {title: 'How to defeat bowser', snippet: 'Lorem ipsum dolor sit amet consectetur'},
  ];
  res.render('index', { title: 'Home', blogs });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/blogs/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

app.get('/control', (req, res) => {
  res.render('control', { title: 'Control',locoList : JSON.stringify(locoList)});
});

app.get('/demo', (req, res) => {
  res.render('demo', { title: 'demo'});
});

app.get('/routes', (req, res) => {
  res.render('routes', { title: 'Routes'});
});




// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  io.emit('locoList Array', locoList);

 
});

//Global Variables
var thisBlock;
var thisBlockState;

// io is the browser
// socl
//listen from browser
io.on('connection', (socket) => {
  socket.on('speedCmd', (data) => {
    console.log('Loco : '+data.loco + ' / Speed : ' + data.speed);
            
            //Find index of specific loco using findIndex method.    
            objIndex = locoList.findIndex((obj => obj.browserName ==  data.loco));
            //get slot
            console.log("LOCO IS " + data.loco + " IS " + objIndex);
            var locoSlot = locoList[objIndex].slot;
            var locoSpeed = data.speed.toString(16);

    var buffer = new Buffer.alloc(4);
    buffer[0] = 0xA0;
    buffer[1] = locoSlot;
    buffer[2] = locoSpeed;
    buffer[3] = 0x00; //checksum
    //checksum
    chk(buffer);  
    //Update Speed in Array
    locoList[objIndex].speed =  locoSpeed;
    console.log("OFF WE GO ....  " + buffer.toString('hex') +"..." + locoList[objIndex].speed );
    //send array back to browser
    io.emit('locoList Array', locoList);
    loconet.write( buffer );

  });
  socket.on('dirCmd', (data) => {
    console.log('Loco : '+data.loco + ' / Direction : ' + data.direction);
            
            //Find index of specific loco using findIndex method.    
            objIndex = locoList.findIndex((obj => obj.browserName ==  data.loco));
            //get slot
            console.log("LOCO IS " + data.loco + " IS " + objIndex);
            var locoSlot = locoList[objIndex].slot;
            var locoDirection = data.direction.toString(16);

    var buffer = new Buffer.alloc(4);
    buffer[0] = 0xA1;
    buffer[1] = locoSlot;
    buffer[2] = locoDirection;
    buffer[3] = 0x00; //checksum
    //checksum
    chk(buffer);  
    //Update Speed in Array
    locoList[objIndex].direction =  locoDirection;
    console.log("Swapping Direction ....  " + buffer.toString('hex') +"..." + locoList[objIndex].direction );
    //send array back to browser
    io.emit('locoList Array', locoList);
    loconet.write( buffer );

  });

  socket.on('saveJSON', (data) => {
    saveJSON();

  });


  //Automation one test
  socket.on('autoOne', (data) => {
    autoOneOn=1;
    
    console.log('Automation On eis ON , Loco : '+data.loco + ' / Direction : ' + data.direction);
    checkAutomationRules(0,"");

  });
    //Automation one test
    socket.on('autoOneOff', (data) => {
      autoOneOn=0;
      autonOneRunning =0;
      console.log('Automation One is OFF , Loco : '+data.loco + ' / Direction : ' + data.direction);
      checkAutomationRules(0,"");
  
    });
      //Automation two test
    socket.on('autoTwo', (data) => {
    autoTwoOn=1;
    
    console.log('Automation 2 On is ON , Loco : '+data.loco + ' / Direction : ' + data.direction);
    checkAutomationRules(0,"");

  });
    //Automation two test
    socket.on('autoTwoOff', (data) => {
      autoTwoOn=0;
      autonTwoRunning =0;
      console.log('Automation Two is OFF , Loco : '+data.loco + ' / Direction : ' + data.direction);
      checkAutomationRules(0,"");
  
    });
    //Automation two test
    socket.on('autoThree', (data) => {
      autoThreeOn=1;
      
      console.log('Automation 3 On is ON , Loco : '+data.loco + ' / Direction : ' + data.direction);
      checkAutomationRules(0,"");
  
    });
      //Automation two test
      socket.on('autoThreeOff', (data) => {
        autoThreeOn=0;
        autonThreeRunning =0;
        console.log('Automation Three is OFF , Loco : '+data.loco + ' / Direction : ' + data.direction);
        checkAutomationRules(0,"");
    
      });
});

//send to Arduino//
io.on('connection', function(socket) {
    
  socket.on('lights',function(data){
      if(data.status == 1)
      {
      var lightsSts ="On"
      }
      else{
        var lightsSts ="Off"
      }
      console.log( "Lights : " + lightsSts );
      port.write( data.status );
  });
});

//send to Loconet

  loconet.on('open',function(){
  //Power on
  var buffer = new Buffer.alloc(2);
  buffer[0] = 0x83;
  buffer[1] = 0x7c; 
  console.log("Track Power On");
  loconet.write( buffer );



  async function send(groups) {
      for(const val of locoList) {
        var locoHex =  '0x'+(val.address).toString(16);
        var buffer = new Buffer.alloc(4);
        buffer[0] = 0xBF;
        buffer[1] = 0x00; 
        buffer[2] = locoHex //loco addresss
        buffer[3] = 0x00; //checksum
        //checksum
        chk(buffer);
        //console.log(buffer);
        console.log("Request Loco : " + val.loco + ' '  + buffer.toString('hex'));
        loconet.write( buffer );
        await wait(2000)
      }
    };
    send(locoList)

});



  //recieve data
  loconet.on('data', function(data){
    console.log("Recd :");
    console.log(data);
    var hexCode = data.toString('hex');

    //Loco Infor
    if(hexCode.startsWith("e7"))
    {
        var thisSlot = hexCode.substring(4, 6);
        console.log("Slot is : " + thisSlot);
        var thisLoco = hexCode.substring(8, 10);
        console.log("Loco is : " + parseInt(thisLoco, 16));

        //Update Array
        //Find index of specific object using findIndex method.    
        objIndex = locoList.findIndex((obj => obj.address ==  parseInt(thisLoco, 16)));
        //Update Slot in Array
        locoList[objIndex].slot =  parseInt(thisSlot, 16)
        //Update Ready Status in Array
        locoList[objIndex].ready =  1;
          if(locoList[objIndex].ready =  1)
          {
              //set Direction
              var buffer = new Buffer.alloc(4);
              buffer[0] = 0xA1;
              buffer[1] = thisSlot;
              buffer[2] = 0x00 //direction
              buffer[3] = 0x00; //checksum
              //checksum
              chk(buffer);
              //console.log("DIRECTION " + buffer.toString('hex'));
              loconet.write( buffer );
              locoList[objIndex].direction = 0;

              //set Speed
              var buffer = new Buffer.alloc(4);
              buffer[0] = 0xA0;
              buffer[1] = thisSlot;
              buffer[2] = 0x00; //set speed to 0
              buffer[3] = 0x00; //checksum
              
              //checksum
              chk(buffer);
              loconet.write( buffer );
              locoList[objIndex].speed = 0;
              console.log(buffer);
              console.log(locoList);
              io.emit('locoList Array', locoList);
              
          }
    }
    //Sensors
    if(hexCode.startsWith("b2"))
    {
      console.log("SENSOR HIT")
      var blockHex = hexCode.substring(2, 6);
      //Update Block in Array
     

      switch(blockHex) {
        case "0040":
          //Update Block Array 
          objIndex = blockList.findIndex((obj => obj.blockLowCode ==  blockHex));
          blockList[objIndex].blockOccupied =  0;
          thisBlock = 1;
          thisBlockState = 'Low'
          checkAutomationRules(thisBlock,thisBlockState);
          break;
        case "0050":
          //Update Block Array 
          objIndex = blockList.findIndex((obj => obj.blockHighCode ==  blockHex));
          blockList[objIndex].blockOccupied =  1;
          thisBlock = 1;
          thisBlockState = 'High'
          checkAutomationRules(thisBlock,thisBlockState);
          break;
        case "0060":
          //Update Block Array 
          objIndex = blockList.findIndex((obj => obj.blockLowCode ==  blockHex));
          blockList[objIndex].blockOccupied =  0;
          thisBlock = 2;
          thisBlockState = 'Low'
          break;
        case "0070":
          //Update Block Array 
          objIndex = blockList.findIndex((obj => obj.blockHighCode ==  blockHex));
          blockList[objIndex].blockOccupied =  1;
          thisBlock = 2;
          thisBlockState = 'High'
          checkAutomationRules(thisBlock,thisBlockState);
          break;
        case "0140":
          //Update Block Array 
          objIndex = blockList.findIndex((obj => obj.blockLowCode ==  blockHex));
          blockList[objIndex].blockOccupied =  0;
          thisBlock = 3;
          thisBlockState = 'Low'
          break;
        case "0150":
          //Update Block Array 
          objIndex = blockList.findIndex((obj => obj.blockHighCode ==  blockHex));
          blockList[objIndex].blockOccupied =  1;
          thisBlock = 3;
          thisBlockState = 'High'
          checkAutomationRules(thisBlock,thisBlockState);
          break;
      }
      console.log(".....Block " + thisBlock + " blockState " + thisBlockState)
      if(thisBlockState === "High")
      {
        objIndex = locoList.findIndex((obj => obj.address ==  94));
        locoList[objIndex].block = thisBlock;
        //send array back to browser
        io.emit('locoList Array', locoList);
      }
    }
  });

//checkAutomationRules
async function checkAutomationRules(thisBlock,thisBlockState)
{
  console.log("THIS BLOCK>>>>>>This Block is "+ thisBlock + "thisBlockState is : " + thisBlockState )
  if(autoOneOn == 1)
  {
    objIndex = blockList.findIndex((obj => obj.block == 1));
    if(blockList[objIndex].blockOccupied == 1)
    {
      autonOneRunning = 1;
      autoOneOn = 2; //set to 2 to stop it returning here once running
      console.log("All set");
      thisBlock = 1;
      thisBlockState = "High";

    }
    else{
      console.log("Loco Not in startig BLOCK");
      autoOneOn = 0;
    }
  }
  if (autonOneRunning == 1)
  {
  //get direction of loco 94
  objIndex = locoList.findIndex((obj => obj.address ==  parseInt(94)));
  l94dir = locoList[objIndex].direction;
  l94slot = locoList[objIndex].slot;
  l94speed = locoList[objIndex].speed;
  

  console.log(thisBlock +" "+thisBlockState);
      {
        if(thisBlock ==1 && thisBlockState == 'High')
        {
          console.log("Im in Block1 "+l94dir +" "+l94slot);
          if(l94dir == 0)
          {
            //if Forwards
            if(l94speed == 0)
              {
                setSpeed(l94slot,30);
              }
              else
              {
                setSpeed(l94slot,l94speed);
              }
            
            //slowdown
              //wait
              //reverse
              //setSpeed
          }
          else{
            //if Reverse
            setSpeed(l94slot,0);
            await wait(10000)
            setDirection(l94slot,0);
            setSpeed(l94slot,30);
          }
        }
        if(thisBlock ==3 && thisBlockState == 'High')
        {
          console.log("Im in Block3");
          setSpeed(l94slot,0);
          await wait(10000)
          setDirection(l94slot,32);
          setSpeed(l94slot,30);
          //setSpeed
        }
      }

  }
  //AUTO 2
  if(autoTwoOn == 1)
  {    
    console.log(thisBlock)
    //in the blocks array, find the block in step 1 an if occupied all is good to start
    objIndex = blockList.findIndex((obj => obj.block == 1));
    if(blockList[objIndex].blockOccupied == 1)
    {
      autoTwoRunning = 1;
      autoTwoOn = 2; //set to 2 to stop it returning here once running
      console.log("All set");
      thisBlock = 1;
      thisBlockState = "High";
      autoID = "autoTwo"
      //run the sequence
      testFunction(autoID,thisBlock,thisBlockState);
      return;
    }
    else{
      console.log("Loco Not in starting BLOCK " );
      autoTwoOn = 0;
      autoID = "autoTwo"

      ////TEST REMOVER
      autoTwoRunning = 1;
      autoTwoOn = 2; //set to 2 to stop it returning here once running
      console.log("All set");
      thisBlock = 1;
      thisBlockState = "High";
      autoID = "autoTwo"
      //run the sequence
      testFunction(autoID,thisBlock,thisBlockState);
      return;
    }
  }
  if(autoTwoOn ==2)
  {
    testFunction(autoID,thisBlock,thisBlockState);
  }
  //AUTO 3
  if(autoThreeOn == 1)
  {    
    //in the blocks array, find the block in step 1 an if occupied all is good to start
    objIndex = blockList.findIndex((obj => obj.block == 1));
    if(blockList[objIndex].blockOccupied == 1)
    {
      autoThreeRunning = 1;
      autoThreeOn = 2; //set to 2 to stop it returning here once running
      console.log("All set");
      //run the sequence
      testFunction(autoID,thisBlock,thisBlockState);
    }
    else{
      console.log("Loco Not in starting BLOCK " );
      autoThreeOn = 0;
      autoID = "autoThree"
      
    }
  }
}

async function testFunction(autoID,thisBlock,thisBlockState)
{

  //get the blocks involved in this automation sequence
  //when a relevant sensor to the sequence is high fire the appropriate functions
  //in case once sequence has 2 bolocks the same with different things to do we'll
  //keep track of them by having a count on each block so that the lowest count ones applies
 console.log("This Block is "+ thisBlock + "thisBlockState is : " + thisBlockState )
 console.log("Blocks used in this sequence are : ")

 const fs = require('fs');
 fs.readFile('./test.json', { encoding: 'utf8' }, function(err, data) {
  if (err) throw err;
  try {
    data = JSON.parse(data);
  } catch (ex) {
    console.log('Error parsing json');
    return;
  }

  //console.log(data);
  bloxUsed = []

  


  //THIS GETS THE BLOCKS USED
  for(var i = 0; i < data[autoID].length; i++)
  {
      var product = data[autoID][i];
      var blox = product.block
      var id = product.id
      
      bloxUsed.push({Block:blox,id})
      console.log(autoID,id)
      if (bloxUsedCount.some(e => e.autoID === autoID && e.id ===id)) {
        //console.log("Already in Arry")
      }
      else
      {
        //console.log("not in...")
        //if array does NOT contain this enrty.....
        bloxUsedCount.push({autoID,id,Block:blox,Count:0}) 
      }
  }
  console.log(bloxUsed)
  console.log (bloxUsedCount)


  //NOW GET THE ACTIONS FOR THE BLOCK DETECTED
 

  
  //if thisBlock in array do bits associated with said block
  
  //find associated bits
  //if(bloxUsed.includes(thisBlock) && thisBlockState =="High")
  if (bloxUsed.some(e => e.Block == thisBlock)&& thisBlockState =="High") 
  {
   
    //Get Loco Used in this Automation Sequence
    console.log("Loco is "+  data[autoID][0].loco)
    autoLoco = data[autoID][0].loco
    locoIndex = locoList.findIndex((obj => obj.address ==  autoLoco));
    thisSlot = locoList[locoIndex].slot;
    console.log("Loco is in Slot : " + thisSlot)
    ///THIS IS WHERE WE NEED TO GET THE DETAILS FOR THE BLOCK WITH THE LOWEST COUNT //


    let result = bloxUsedCount.filter(a => a.Block == thisBlock && a.autoID == autoID).sort((a, b) => a.Count - b.Count)
    .filter((item, index, array) => item.Count === array[0].Count);
    console.log(result[0]);
    console.log(bloxUsed)
    //objIndex = bloxUsed.findIndex(e => e.autoID === result[0].autoID && e.id ===result[0].id && e.Block=== result[0].Block);

 
    console.log(result[0].id)
 
    actions = bloxUsed.findIndex((a => a.Block == thisBlock && a.id == result[0].id));
    console.log("ACTION IS " + actions)
    console.log(actions)
 
    var bbb =  data[autoID][actions]
    console.log(bbb)
    console.log(bbb.actions.length + " Actions for this Block : ")
    loop()

    async function loop()
        {
        for (let i = 0; i < bbb.actions.length; i++) {
            //console.log(bbb.actions[i]);
            await wait(500)
            var cmdToSend =  bbb.actions[i].replace("slot",thisSlot)
            console.log(cmdToSend)
            //send Loconet Command

              eval(cmdToSend)


        }
        console.log(blox)
        objIndex = bloxUsedCount.findIndex((obj => obj.autoID == autoID && obj.Block == thisBlock && obj.id == result[0].id));
        console.log(bloxUsedCount)
        console.log(result)
      
        console.log("TEST: " + objIndex + "" +autoID +" "+blox + " "+ result[0].id)
        bloxUsedCount[objIndex].Count ++
        console.log(bloxUsedCount)
    }
  }
  else{
    console.log("This Block is not used in this sequence")
  }
});
}

function sayHello(name)
{
  console.log("HELLO!" + name)
}
//set Speed
function setSpeed(slot,speed)
{
  console.log("Im setting the speed")
  var buffer = new Buffer.alloc(4);
  buffer[0] = 0xA0;
  buffer[1] = slot;
  buffer[2] = speed; 
  buffer[3] = 0x00; //checksum
  chk(buffer);
  console.log(buffer.toString('hex'));
  loconet.write( buffer );
  //updateArray
  objIndex = locoList.findIndex((obj => obj.slot == slot));
  locoList[objIndex].speed = speed;
}
//set Direction
function setDirection(slot,direction)
{
  console.log("Im setting the direction")
  var buffer = new Buffer.alloc(4);
  buffer[0] = 0xA1;
  buffer[1] = slot;
  buffer[2] = direction; 
  buffer[3] = 0x00; //checksum
  chk(buffer);
  console.log(buffer.toString('hex'));
  loconet.write( buffer );
  //updateArray
  objIndex = locoList.findIndex((obj => obj.slot == slot));
  locoList[objIndex].direction = direction;
}

//SpeedRamp
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
            setSpeed(slot,speed)
            loopCount++;
        }
        else {
            speed = finalSpeed;
            console.log(loopCount + " " + speed);
            setSpeed(slot,speed);
            wait(5000)
            setDirection(slot,newDirection);
            setSpeed(slot,newSpeed)
            clearInterval(interval);
        }
    }, slowDownTime);
}


const wait = (milliseconds) => {
  console.log("im Waiting.......")
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}



//Calculate Loconet Checksum
function chk (buffer)
    {
        var z1 = buffer[0] ^ buffer[1];  // add the first 2 hex codes together
        var answer = z1 ^buffer[2];  // add the third to first two
        var a = answer;  //this is the answwer


        var x = a; // input value
        var y = x.toString(2);
        var yl = y.length;
        var mask = (Math.pow(2,yl)-1); // calculate mas
        var result = ~x & mask;

        var hex = Number(result).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }

        buffer[3] = "0x" + hex;
        
    }

    function saveJSON(filename)
    {
          // file system module to perform file operations
          const fs = require('fs');
          
          // json data
          var jsonData = '{"persons":[{"name":"John","city":"New York"},{"name":"Phil","city":"Ohio"}]}';
          
          // parse json
          var jsonObj = JSON.parse(jsonData);
          console.log(jsonObj);
          
          // stringify JSON Object
          var jsonContent = JSON.stringify(jsonObj);
          console.log(jsonContent);
          
          fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
              if (err) {
                  console.log("An error occured while writing JSON Object to File.");
                  return console.log(err);
              }
          
              console.log("JSON file has been saved.");
});
    }

