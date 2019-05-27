const rp = require('request-promise');
const cheerio = require('cheerio');
const url = [];
let fs = require('fs');
const fileNames = require("./fileNames")

const file = fileNames.dataArr
const rollno_min = fileNames.rollno_min,rollno_max = fileNames.rollno_max;
const resultId = fileNames.resultId

//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++

fs.writeFile(file, "module.exports = [", function(err) {
    if (err) throw err;
})

let rollnumerRange = [rollno_min, 0];
let arr = [];
const dataArr = [];
// setTimeout(writeFile,10000)
let i = 0;
let id = setInterval(() => {
    rollnumerRange[1] = rollnumerRange[0] + 50

    let url = createUrls(resultId, [rollnumerRange[0], rollnumerRange[1]]);

    if (rollnumerRange[0] >= rollno_max) {
        clearInterval(id)
        fs.appendFile(file, "];", function(err){
          if(err) throw err;
        })
    }
    else {
        resolve(url);
    }
    rollnumerRange[0] = rollnumerRange[1];

}, 7000)

const createUrls = (id, range) => {
    let url = [];
    for (let i = range[0]; i <= range[1]; i++) {
        url.push(
            rp(`http://pupdepartments.ac.in/puexam/t2/results/results.php?rslstid=${id}&ROLL=${i}&submit=Submit`)
            .catch(err => err)
        );
        console.log(i + "\n")
    }
    return url;
}

const resolve = (url) => {
    Promise.all(url).then(function(html) {
        html.forEach((e, i) => {

            let $ = cheerio.load(e);
            if ($('#divContentInnerPrint').text().indexOf('No Result Found!') === -1) {
                let data = {}
                studentInfo($, data);
                result($, data);
                console.log(data.RollNo, data.Name)
                // debugger;
                writeFile(data);
                console.log(i++)
            }

        })


    }).catch(err => console.log(err))
}






function studentInfo($, data) {

    $('td.c3').each(function(i, e) {
        if (i === 0) data['Name'] = $(e).text();
        if (i === 1) data['Course'] = $(e).text();

    })

    $('table.noborder span').each(function(i, e) {
        let arr = $(e).text().split('.');
        data[arr[0].split(' ').join('')] = arr[1];
    });
}

function result($, data) {
    let result = [];
    $('#resultTbl tr').each(function(i, e) {
        if (i != 0) {
            let resultStr = ''
            $(e).find('td').each(function(i, e) {
                if (i !== 0) {
                    resultStr += $(e).text() + ','
                }
            })

            result.push(new resultClass(resultStr))
        }
    })
    // console.log(result)
    // let i = result.findIndex(e => e.subject === ' '||e.subject=='');
    // result = result.map(e => e.subject !== ' ' || e.subject!==='')
    // if(i) result.splice(i, 1);
    result = result.filter(e => e.subject !== '')
    // console.log(result)

    data['result'] = result;
    data['pass'] = result.every(e => e.pass);
}

class resultClass {
    constructor(resultStr) {
        // console.log(resultStr)
        let arr = resultStr.split(',');

        this.subject = arr[0].trim();
        this.internal = typeCheck(arr[1]);
        this.external = typeCheck(arr[2]);
        this.total = typeCheck(arr[5]);
        // console.log(this.subject)
        if (this.subject === 'Drug Abuse: Problem') {
            // console.log(this.subject,arr)
            this.subject = arr[0] + ' ' + arr[1];
            this.internal = typeCheck(arr[2]);
            this.external = typeCheck(arr[3]);
            this.total = 0;
            this.pass = true;
            // console.log(this.subject)
        }
        debugger
        // console.log(this)
        if (this.internal && this.external && this.total) {
            this.pass = true;
        }
        else {
            this.pass = false;

        }
        //bca
        // if(this.subject == 'Drug Abuse:Problem Mgt.& Prevention (Qualified)')
        //     this.pass = true;

        //bcom
        if (this.subject == 'Drug Abuse: Problem  Management & Prevention')
            console.log(this.pass = true);

        // console.log(this)
    }
}

function typeCheck(str) {
    if (parseInt(str)) {
        return +str;
    }
    return null;
}

function writeFile(data) {
    let string = JSON.stringify(data) + ","
    fs.appendFile(file, string, function(err) {
        if (err) throw err;
    })
}
