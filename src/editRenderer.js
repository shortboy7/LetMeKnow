const {ipcRenderer} = require('electron');
let keywords = [];

ipcRenderer.on("keywordInit", (event, arguments) => {
    for(let i = 0 ; i < arguments.length; i++){
        keywords.push(arguments[i]);
    }
});

