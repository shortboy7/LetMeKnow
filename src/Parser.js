const cheerio = require('cheerio');
const axios = require('axios').default;

const getFunctions = {
    'dongguk': async (urlbase, pageIndex, board) => {
        let response = await axios.get(`${urlbase}${board}/list?pageIndex=${pageIndex}`, {
            // responseType:'document',
            // responseEncoding:'utf8' //UTF-8 , binary, 
        });
        let buffer = [];
        const $ = cheerio.load(response.data.toString());
        for(let i = 6; i < $('.tit').length; i++){
            const title = $('.tit')[i].children[0].data.trim(' ');
            const date = $('.info span:first-child')[i].children[0].data;
            const detailId = $('.board_list ul li a')[i].attribs['onclick'].substring(9,17);

            buffer.push({
                title:title, 
                date:date, 
                detailUrl : `${urlbase}${board}/detail/${detailId}`,
            });
        }
        return buffer;
    }
};

module.exports = class Parser{
    constructor(){
        this.promises = [];
        this.buffer = [];
    }
    
    // return []
    async getContents(sites){
        let l = 0;
        this.promises = [];
        for(let site of sites){
            // console.log(site.board);
            site.board.forEach((board)=>{
                for(let page = 1 ; page < 3; page += 1){
                    setTimeout(() => {
                        this.promises.push(getFunctions[site.name](site.url, page, board)
                        .then((result)=>{
                            // console.log(result);
                            this.buffer.push(...result);
                            return result;
                        }));
                        // console.log(promises);
                    }, l * 500);
                    l += 1;// 0 0.5 1 1.5 2.0
                }
            });
        }
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                Promise.all(this.promises).then(() => {
                    // console.log(this.buffer);
                    resolve(this.buffer);
                });
            }, l * 500);
        });
        // console.log("before");
        // console.log("after");
    }
};

/*
    Promise 객체는 명시적으로 resolve 함수를 호출해야 끝을 확인할 수 있다.
    안그러면 실행을 했더라도 무슨 상태인지 몰라서 then이 실행이 안됨.
*/


// .then(async (l)=>{
//     console.log(promises);
//     const result = await Promise.all(promises);
//     console.log(parser.buffer);
//     // await new Promise(() => setTimeout(()=>{
//     //     Promise.allSettled(promises).then(()=>{
//     //         // console.log(promises);
//     //         // console.log(parser.buffer);
//     //     });
//     // }, l * 500)).then(()=>{
//     //     console.log("after");
//     // });
//     // await new Promise(() => setTimeout(()=>{console.log(parser.buffer)}, 5000));
// });

