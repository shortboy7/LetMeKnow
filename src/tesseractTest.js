const {createWorker} = require('tesseract.js');
const path = require('path');
const worker = createWorker({
    cachePath: path.join(__dirname, 'lang-data'),
    logger : m => console.log(m),
});


(async () => {
    await worker.load();
    await worker.loadLanguage('kor');
    await worker.initialize('kor');
    const { data: { text } } = await worker.recognize('https://www.dongguk.edu/cmmn/fileView?path=/ckeditor//GENERALNOTICES&physical=1654653706377.jpg&contentType=image');
    console.log(text);
    console.log(typeof(text));
    await worker.terminate();
  })();