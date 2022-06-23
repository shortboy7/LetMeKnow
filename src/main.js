const {app, Menu,BrowserWindow, ipcMain, webContents} = require("electron");
const axios = require('axios').default;
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;
const fs = require('fs');
const { stringify } = require("querystring");
const { webcrypto } = require("crypto");
const { resolve } = require("path");

let site = [
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
    {
        'name':'dongguk_computer_enginner',
        'url':'https://cse.dongguk.edu/?',
        'board': [
            //pageid = 1&page_id=799
            '799',
        ]
    },
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
    const article = contents[idx];
    getView(article.detailUrl);
});

const getUrl = {
    'dongguk': async (urlbase, pageIndex, board) => {
        let response = await axios.get(`${urlbase}${board}/list?pageIndex=${pageIndex}`, {
            // responseType:'document',
            // responseEncoding:'utf8' //UTF-8 , binary, 
        });
        const $ = cheerio.load(response.data.toString());
        for(let i = 6; i < $('.tit').length; i++){
            const title = $('.tit')[i].children[0].data.trim(' ');
            const date = $('.info span:first-child')[i].children[0].data;
            const detailId = $('.board_list ul li a')[i].attribs['onclick'].substring(9,17);

            contents.push({
                title:title, 
                date:date, 
                detailUrl : `${urlbase}${board}/detail/${detailId}`
            });
        }
        filterContents();
        main.webContents.send('init', filteredContents);
        Promise.resolve();
    }
};

async function createWindow(){
    main.loadFile("./src/index.html");
    initContents();
}

async function initContents() {
    for(let s = 0 ; s <= 0 ; s++){
        for(let b = 0 ; b < site[0].board.length; b++){
            for(let p = 1; p < 3; p++){
                setTimeout(() => {
                    getUrl['dongguk'](site[s].url, p, site[s].board[b]);
                }, 1000);
            }
        }
    }
}

app.on('ready', () => {
    main = new BrowserWindow({
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false    
        }
    });
    let str;
    fs.readFile('./keywords.json',{encoding:'utf-8',flag:'r+'},(err, data) =>{
        console.log(data);
        const obj = JSON.parse(data);
        keywords = obj['keywords'];
    });

    createWindow();
});