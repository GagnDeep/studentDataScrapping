let fs = require('fs');
let fileNames = require('./fileNames')
let studentArr = require(fileNames.data)

fs.writeFile('./data.vcf',"",function(err) {
        if (err) throw err;
    })

studentArr.forEach((e,i) => {
    if(e&&e.rollno){
    let str = `BEGIN:VCARD\nVERSION:3.0\nN:;${e.name};;;\nFN:${e.name}\nTEL;TYPE=CELL;TYPE=PREF:${e.mobile}\nEND:VCARD\n`
    writeFile(str)
    }

})
function writeFile(data) {
    // let string = JSON.stringify(data) + ","
    fs.appendFile('./data.vcf', data, function(err) {
        if (err) throw err;
    })
}
