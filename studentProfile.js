const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const config = require('./final-config');

const fileNames = require("./fileNames")
const arr = require(fileNames.dataArr);

const studentArr = formatArr(arr);

const notFound = []

let dataFile = fileNames.data;

fs.writeFile(dataFile, "module.exports = [", function(err) {
    if (err) throw err;
})


generatePromises(50)
// getLoginPages(20)

async function generatePromises(quantity) {
    console.log("+++++++++++ " + studentArr.length + " ++++++++++")
    if (studentArr.length <= 0) {
        fs.appendFile(dataFile, "]", function(err) {
            if (err) throw err;
        })
        return;
    }
    let arr = studentArr.splice(0, quantity);
    // for(let i = 0; i < arr.length; i++)
    //     getData(arr[i])
    let loginPage = await getLoginPages(quantity);
    // // console.log(loginPage.length)
    let bodies = loginPage.map((e, i) => new generateBody(e, arr[i]));

    // console.log(bodies)
    bodies = bodies.map(body => getDataPromises(body))
    // console.log("shajdhasjdhjashdjkasjdhashdkaj")
    await Promise.all(bodies);
    // console.log("++++++++++++++++++++++sahdjkshadhasjjdas++++++++++++++++++++")
    // setTimeout(e => generatePromises(quantity), 12000)
    generatePromises(quantity)
}

async function getDataPromises(body, data) {
    return new Promise(async(res, rej) => {
        await getData(body, data)
        res()
    })
}

async function getData(body, data, i = 0) {
    if (i > 6) return
    // if (i >= studentArr.length) {
    //     console.log(notFound)
    //     return;
    // }

    // let loginPage = await getLoginPage(10);
    // console.log(loginPage.length)

    // if (loginPage) {
    //     const body = new generateBody(loginPage, data);
    // console.log(body.StuUID)
    let postHeaders = await postData(body);

    if (postHeaders) {
        if (postHeaders !== -1) {
            if (postHeaders !== -2) {
                let cookie = getCookie(postHeaders);
                let studentInfo = await getStudent(cookie)
                if (studentInfo) {
                    console.log("======== " + studentInfo.name + " =========");
                    writeFile(studentInfo);
                    // getData(i + 1)
                }
                else {
                    notFound.push(body)
                    // console.log('skipping to next student ' + notFound.length);
                    // getData(i + 1)
                }
            }
            else {
                console.log("catastorpe failue in posting data " + i)
                await getData(body, data, i + 1)
            }
        }
        else {
            notFound.push(body)
            // console.log('skipping to next student ' + notFound.length);
            // getData(i + 1)
        }
    }
    else {
        notFound.push(body)
        // console.log('skipping to next student ' + notFound.length);
        // getData(i + 1)
    }

    // }
    // else {
    //     getData(data)
    // }

}


function extractData(data, index) {

    // console.log("yippeeeeiiiiiiiiiiiii")
    let $ = cheerio.load(data);
    let rollno = $("#lblRollNo").text();
    let obj = {
        rollno: rollno,
        image: $("#Image1").prop("src"),
        name: $("#lblApp_Name").text(),
        registration: $("#lblRegNo").text(),
        mobile: $("#lblApp_MobileNo").text(),
        id: $("#LblId").text(),
        batch: $("#LblClass").text(),
        father: $("#lblApp_FatherName").text(),
        mother: $("#lblApp_MotherName").text(),
        gender: $("#lblApp_Gender").text(),
    }
    // if (!rollno) studentArr.push(studentArr[index])
    // console.log(rollno, obj.name, obj.mobile)
    // writeFile(obj)
    return obj;
}

function writeFile(data) {
    let string = JSON.stringify(data) + ","
    fs.appendFile(dataFile, string, function(err) {
        if (err) throw err;
    })
}

async function getStudent(cookie, i = 0) {
    if (i < 6) {
        try {
            let obj = {
                ...config.getStudent,
                headers: {
                    ...config.getStudent.headers,
                    Cookie: cookie
                }
            }
            let res = await rp(obj)
            // console.log('success in getting student info')
            let data = extractData(res)
            if (data.rollno === "") {
                // console.log("++++++++resend++++++++++++")
                return getStudent(cookie, i + 1)
            }
            else {
                return data
            }
        }
        catch (err) {
            // console.log("error in  getting student info");
            return getStudent(cookie, i + 1)
        }
    }
    else {
        return null
    }
}

// function generateCookieJar(){

// }

function getCookie(headers) {
    let Cookie = headers['set-cookie'][0].split(';')[0];
    return Cookie
}

async function postData(body, i = 0) {
    if (i > 6) return null
    try {
        // console.log('submitting the form')
        await rp({
            ...config.postData,
            form: body
        })
        // console.log('unknown error 1 - possibly user not found')
        return -1
    }
    catch (err) {
        if (err.statusCode === 302 && typeof(err.response) === 'object') {
            // console.log('success in submitting data')
            if (err.response.headers && err.response.headers['set-cookie']) {
                return err.response.headers
            }
            else
                return -2
        }
        else {
            // console.log('error in submitting data')
            return postData(body, i + 1)
        }
    }
}

async function getLoginPages(i, bodies = []) {;
    if (i <= bodies.length) return bodies
    // console.log("++++++++ " + i)

    let arr = []

    for (let j = 0; j < i - bodies.length; j++)
        arr.push(rp(config.getForm).catch(e => e))

    try {
        let b = await Promise.all(arr);
        b = b.filter(e => {
            if (typeof(e) !== 'object') {
                let obj = new generateBody(e)
                return obj.__EVENTVALIDATION
            }
            return false
        });
        // console.log(b.length)
        bodies = [...bodies, ...b]

        // bodies.forEach(e => console.log(typeof(e)))
        // console.log(bodies.length)

        return getLoginPages(i, bodies)

    }
    catch (err) {
        console.log("error in promises creation all", err)
        getLoginPage(i)
    }
}
async function getLoginPage(i, arr = [], j = 0) {
    if (!i) return arr;
    // if(j>i*3+5) return null
    try {
        //GET form and extract validation info
        // console.log('get request for login page');
        let form = await rp(config.getForm)

        console.log('success in receiving login page ' + i)
        arr.push(form)
        return getLoginPage(i - 1, arr, j)

    }
    catch (err) {
        // console.log('error while trying to reach login page');

        return getLoginPage(i, arr, j + 1)
    }
}

function updateBody(res, body, i) {
    let $ = cheerio.load(res);
    let eventValidation = $("input#__EVENTVALIDATION").prop("value"),
        viewStateGenerator = $("input#__VIEWSTATEGENERATOR").prop("value"),
        viewState = $("input#__VIEWSTATE").prop("value");

    body["__EVENTVALIDATION"] = eventValidation;
    body["__VIEWSTATEGENERATOR"] = viewStateGenerator;
    body["__VIEWSTATE"] = viewState;

    body["StuUID"] = studentArr[i].userId;
    body["StuPwd"] = studentArr[i].password;
}



function formatArr(arr) {
    return arr.map(e => {
        return {
            password: e.RollNo.replace(/\s/g, ''),
            userId: e.RegdNo.replace(/\s/g, '').replace("2017", "17")
        }
    })
}

class generateBody {
    constructor(res, data) {
        let $ = cheerio.load(res);
        this["__EVENTVALIDATION"] = $("input#__EVENTVALIDATION").prop("value");
        this["__VIEWSTATEGENERATOR"] = $("input#__VIEWSTATEGENERATOR").prop("value");
        this["__VIEWSTATE"] = $("input#__VIEWSTATE").prop("value");
        this["StuUID"] = data ? data.userId : '';
        this["StuPwd"] = data ? data.password : '';
        this["__EVENTTARGET"] = "student";
        this["__EVENTARGUMENT"] = "";
        this["txt_userid"] = "";
        this["txt_pwd"] = "";
        this["txt_username_o"] = "";
        this["txt_pwd_o"] = "";
        this["btnStuLogin"] = "Login";
    }
}
