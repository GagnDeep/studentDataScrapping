const headers = require('./final-headers');
const body = require('./body')

module.exports = {
    getForm: {
        method: "GET",
        uri: "http://exam.pupadmissions.ac.in"
    },
    postData: {
        method: "POST",
        uri: "http://exam.pupadmissions.ac.in",
        headers: headers.postData,
    },
    getStudent: {
        uri: "http://exam.pupadmissions.ac.in/Examination_Form/Paper.aspx",
        method: "GET",
        headers: headers.getStudent
    }
}