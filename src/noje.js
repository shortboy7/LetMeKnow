const axios = require('axios');
const cheerio = require('cheerio');

const getHTML = async (url) => {
    try {
        return await axios.get(url);
    } catch (err) {
        console.log(err);
    }
};

const parsing = async (page) =>{
    const $ = cheerio.load(page);
    const $contestList = $(".all-contest > .contest-table tbody tr");
    const contests = []

    $contestList.each((idx, node) => {
        const field = $(node).find('.cate-name').text();

        if(field.indexOf('게임/소프트웨어') == -1){
            return true;
        }

        const title = $(node).find('.contest-title > a').text();
        const href = $(node).find('.contest-title > a').attr('href');
        const period = $(node).find('td:eq(3)').text();


        contests.push({
            title: title,
            field: field,
            period: period,
            href: href,
        });
    });

    return contests;
}


const getContest = async (site) => {
    const html = await getHTML(site);
    const contests = parsing(html.data);

    return contests;
}

async function getInfoContest(pageCount){
    const home = 'https://www.thinkcontest.com';

    for(let i=1; i<=pageCount; i++){
        const contestPromise = await getContest(`${home}/Contest/CateField.html?page=${i}`);
        contestPromise.forEach((contest) => {
            console.log(`${contest.title} (${contest.field})`);
            console.log(`${home}${contest.href}`);
            console.log(contest.period);
            console.log("===============================================");


        })
    }
}

getInfoContest(15);
