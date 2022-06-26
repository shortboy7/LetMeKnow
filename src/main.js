const {app, Menu,BrowserWindow, ipcMain, webContents} = require("electron");
const Parser = require('./Parser');
const fs = require('fs');
const { stringify } = require("querystring");
const { webcrypto } = require("crypto");
const { resolve } = require("path");

const parser = new Parser();

const site = [
    {
        'name':'dongguk',
        'url':'https://www.dongguk.edu/article/',
        'board': [
            //HAKSANOTICE/list?pageIndex=1&
            // article/${board}/list?pageIndex=${pageIndex}
            'GENERALNOTICES',
            'HAKSANOTICE',
            'IPSINOTICE',
            'JANGHAKNOTICE',
            'HAKSULNOTICE',
        ]
    },
    // {
    //     'name':'dongguk_computer_enginner',
    //     'url':'https://cse.dongguk.edu/?',
    //     'board': [
    //         //pageid = 1&page_id=799
    //         '799',
    //     ]
    // },
];

let contents = [];
let keywords = [];
let filteredContents = [];
let main;

function leftPad(value){
    if(value >= 10) return value;
    else return `0${value}`;
}

function toStringByFormat(source , delimiter = '-'){
    const year = source.getFullYear();
    const month = leftPad(source.getMonth() + 1);
    console.log(month);
    const day = leftPad(source.getDate());

    return [year, month, day].join(delimiter);
}

function filterContents(){
    let newFilteredContents = [];
    const dateString = toStringByFormat(new Date(), '.');
    for(const content of contents){
        // if(content.date < dateString) continue;
        for(const keyword of keywords){
            if(content.title.includes(keyword)){
                newFilteredContents.push(content);
                break;
            }
        }
    }
    newFilteredContents.sort((left, right) => {
        if(left.date < right.date) return 1;
        else if(left.date > right.date) return -1;
        else return 0;
      });
    filteredContents = newFilteredContents;
}

const getView = (url) => {
    const newWindow = new BrowserWindow({
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false,
            webviewTag: true
        }
    });
    newWindow.loadURL(url);
    // newWindow.webContents.send('did-finish-load', url);
    // newWindow.setMenu(null);
    newWindow.setFullScreen(null);
}

ipcMain.on('loadSite', (e, idx) =>{
    const article = filteredContents[idx];
    getView(article.detailUrl);
});



async function createWindow(){
    main.loadFile("./src/index.html");
}

app.on('ready', async () => {
    main = new BrowserWindow({
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false    
        }
    });
    createWindow();
    fs.readFile('./keywords.json',{encoding:'utf-8',flag:'r+'},(err, data) =>{
        console.log(data);
        const obj = JSON.parse(data);
        keywords = obj['keywords'];
    });
    contents = await parser.getContents(site);
    filterContents();
    main.webContents.send('init',filteredContents);
});