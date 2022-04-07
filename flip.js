const { findIndex } = require("lodash")

let data = [ 
    { size: 5, qty: 2, rest: 0 },
    { size: 2, qty: 5, rest: 0 },
    { size: 1, qty: 10, rest: 0 },
    { size: 3, qty: 3, rest: 1 },
    { size: 4, qty: 2, rest: 2 } 
  ]

 let min = Math.min(...data.map(item => item.rest))
 let result = data.filter(item => item.rest === min)
 //console.log(result)

 thisBlock = "1"
 let data2 = [ 
    { autoID: 'autoTwo', id: 0, Block: '1', Count: 9},
    { autoID: 'autoTwo', id: 1, Block: '2', Count: 39 },
    { autoID: 'autoTwo', id: 2, Block: '1', Count: 8}
]

//let result2 = data2.filter((item, index, array) => item.Count === array[0].Count && item.Block === thisBlock).sort((b, a) => a.Count - b.Count);
let result2 = data2.filter(a => a.Block == thisBlock).sort((a, b) => a.Count - b.Count)
                 .filter((item, index, array) => item.Count === array[0].Count);
            

console.log(result2);
//console.log(result2);
console.log(result2[0]);



objIndex = data2.findIndex(e => e.autoID === result2[0].autoID && e.id ===result2[0].id);
console.log(objIndex)