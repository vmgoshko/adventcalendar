var path = require('path');
var url = require('url');
var fs = require('fs');

module.exports = {
    GetData : function(usr) {
        const dataFilePath = path.join(__dirname, "public", "data", usr.toLowerCase() + ".txt");
        if (fs.existsSync(dataFilePath))
            return dataFilePath;
        
        return "";
    }
}