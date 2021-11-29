const moment = require('moment')
const { format } = require('morgan')

function formatMessage(username, text){
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }

}

module.exports = formatMessage;