const {ipcRenderer, desktopCapturer} = require('electron');
const contentList = document.querySelector('.contentList');

ipcRenderer.on('init',(event, argument)=>{
    for(let i = 0; i < argument.length; i++){
        item = argument[i];
        let newItem = document.createElement('li');
        newItem.className = 'content';
        let newIcon = document.createElement('i');
        newIcon.className = 'content_siteMark';
        let newTitle = document.createElement('a');
        newTitle.className = 'content_title';
        newTitle.innerText = item.title;
        newTitle.onclick = () =>{
            ipcRenderer.send('loadSite', `${item.urlbase}${item.board}/detail/${item.id}`);
        }
        let newContentDate = document.createElement('div');
        newContentDate.className = 'content_date'
        let newStartDate = document.createElement('span');
        newStartDate.className = 'startDate';
        newStartDate.innerText = item.date;
        let newEndDate = document.createElement('span');
        newEndDate.className = 'endDate';
        newEndDate.innerText = item.date;
        newContentDate.appendChild(newStartDate);
        newContentDate.appendChild(newEndDate);
        newItem.appendChild(newIcon);
        newItem.appendChild(newTitle);
        newItem.appendChild(newContentDate);
        contentList.appendChild(newItem);
    }
});