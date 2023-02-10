

let logService = {
    addToLogService: function(message, page_url) {
        let message_err = message.message ? message.message : message;
        return logService.createFromParams(message_err, page_url)
    }
}

module.exports = logService