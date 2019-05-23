const fileNames = require('./fileNames');
const arr = require(fileNames.data).filter(e => e.gender === "Female")
const resultData = require(fileNames.dataArr)

let totalFemalesCount = arr.length,
    totalPassedFemales = arr.reduce((a, c) => {
        let student = resultData.find(e => +e.RollNo === +c.rollno)
        
        return student && student.pass ? a + 1 : a
    },0),
    totalFailedFemales = totalFemalesCount - totalPassedFemales


console.log("Number of females in the dataset: " + totalFemalesCount)
console.log("Number of passed females: " + totalPassedFemales)
console.log("Number of failed females: " + totalFailedFemales)
