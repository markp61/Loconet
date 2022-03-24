//setup
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

  //Locos Array
  let locoList = [
    {id: 0, loco: "Class 108", address: 08, slot: 0, direction: 0, speed: 0, ready: 0,browserName: "loco08"},
    {id: 1, loco: "Class 108 Passengers", address: 09, slot: 0, direction: 0, speed: 0, ready: 0,browserName: "loco09"},
    {id: 2, loco: "Class 415", address: 03, slot: 0, direction: 0, speed: 0, ready: 0,browserName: "loco03"},
    {id: 3, loco: "Class 50", address: 50, slot: 0 , direction: 0, speed: 0, ready: 0,browserName: "loco50"},
    {id: 4, loco: "Class 121", address: 21, slot: 0, direction: 0, speed: 0, ready: 0,browserName: "loco21"},
    {id: 5, loco: "GWR", address: 94, slot: 0, direction: 0, speed: 0, ready: 0,browserName: "loco94"},
  ]
//

//Arduino Port Setup
const { SerialPort } = require('serialport')
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




// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  io.emit('locoList Array', locoList);

 
});



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

function wait(milleseconds) {
  return new Promise(resolve => setTimeout(resolve, milleseconds))
}

  //recieve data
  loconet.on('data', function(data){
    console.log("Recd :");
    console.log(data);
    var hexCode = data.toString('hex');
    
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
              buffer[2] = 0x32; //direction
              buffer[3] = 0x00; //checksum
              //checksum
              chk(buffer);
              //console.log("DIRECTION " + buffer.toString('hex'));
              loconet.write( buffer );
              locoList[objIndex].direction = 32;

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
  });



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



