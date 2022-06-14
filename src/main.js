const {app, BrowserWindow, ipcMain, webContents} = require("electron");
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

const getUrl = {
    'dongguk': async (urlbase, pageIndex, board) => {
        let response = await axios.get(`${urlbase}${board}/list?pageIndex=${pageIndex}`, {
            // responseType:'document',
            // responseEncoding:'utf8' //UTF-8 , binary, 
        });
        // console.log(response);
        const $ = cheerio.load(response.data.toString());
        for(let i = 0; i < 6 ; i++){
            const date = $('.info span:first-child')[i].children[0].data;
            const title = $('.tit')[i].children[2].data.trim(' ');
            contents.push({title:title, date:date});
        }
        for(let i = 6; i < $('.tit').length; i++){
            const title = $('.tit')[i].children[0].data.trim(' ');
            const date = $('.info span:first-child')[i].children[0].data;
            contents.push({title:title, date:date});
        }
        Promise.resolve(contents);
    }
};

async function createWindow(){
    const win = new BrowserWindow({
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false    
        }
    });
    win.loadFile("./src/index.html");
    await getUrl['dongguk'](site[0].url, 3, site[0].board[0])
    // console.log(contents);
    win.webContents.send('init', contents);

    // win.webContents.on('did-finish-load', () => {
    //     getUrl['dongguk'](site[0].url, 3, site[0].board[0]).then(()=>{
    //         console.log(contents);
    //     });
    // })
}

app.on('ready', () => {
    createWindow();
});