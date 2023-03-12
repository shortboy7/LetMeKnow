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

module.exports = class Filter{
    constructor(){

    }
    filterContents(contents, keywords){
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
        return newFilteredContents;
    }
};