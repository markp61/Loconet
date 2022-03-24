//setup
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


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


io.on('connection', (socket) => {
  console.log('a user connected');
});

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
  res.render('control', { title: 'Control' });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});


//listen from browser
io.on('connection', (socket) => {
  socket.on('speedCmd', (data) => {
    console.log('Loco : '+data.loco + ' / Speed : ' + data.speed);
  });
});

//send to Arduino
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
loconet.on('connection', function(socket) {
  //Power on
  var buffer = new Buffer.alloc(2);
  buffer[0] = 0x83;
  buffer[1] = 0x7c; 
  console.log("Track Power On");
  loconet.write( buffer );
  


  //Request Locos
  let locoList = [
    {id: 0, loco: "Class 121", address: 21, slot: 0},
    {id: 1, loco: "Class 108", address: 08, slot: 0},
    {id: 2, loco: "Class 415", address: 03, slot: 0},
    {id: 3, loco: "Class 50", address: 50, slot: 0},
  ]
  

  for(const val of locoList) {
    console.log(val.address);
    var locoHex =  '0x'+(val.address).toString(16);
    var buffer = new Buffer.alloc(4);
    buffer[0] = 0xBF;
    buffer[1] = 0x00; 
    buffer[2] = locoHex //loco addresss
    buffer[3] = 0x00; //checksum
    
    //checksum
    chk(buffer);

    console.log(buffer);
    console.log("Request Loco : " + val.loco + ' '  + buffer.toString('hex'));
    loconet.write( buffer );


  }

  //recieve data
  loconet.on('data', function(data){
    console.log("Recd :");
    console.log(data);
    var hexCode = data.toString('hex');
    
    if(hexCode.startsWith("e7"))
    {
        console.log("YES");
        var thisSlot = hexCode.substring(4, 6);
        console.log("Slot is : " + thisSlot);
        var thisLoco = hexCode.substring(8, 10);
        console.log("Loco is : " + thisLoco);
        //set Direction
        var buffer = new Buffer.alloc(4);
        buffer[0] = 0xA1;
        buffer[1] = 0x0C; //slot12
        buffer[2] = data.direction; //loco addresss
        buffer[3] = 0x00; //checksum
        //checksum
        chk(buffer);
        loconet.write( buffer );

        //set Speed
        var buffer = new Buffer.alloc(4);
        buffer[0] = 0xA0;
        buffer[1] = thisSlot;
        buffer[2] = 0x32; //set speed to 50 / 32 in Hex
        buffer[3] = 0x00; //checksum
        
        //checksum
        chk(buffer);
        loconet.write( buffer );
        console.log(buffer);
    }
  });

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




