const {ipcRenderer, desktopCapturer, contentTracing} = require('electron');
const contentList = document.querySelector('.contentList');

let keywords = [];
let contents = [];
let rowPerPage = 10;
let pages = 25;

function createPagination(pages, page) {
  let str = '<ul>';
  let active;
  let pageCutLow = page - 1;
  let pageCutHigh = page + 1;
  // Show the Previous button only if you are on a page other than the first
  if (page > 1) {
    str += '<li class="page-item previous no"><a onclick="createPagination(pages, '+(page-1)+')">Previous</a></li>';
  }
  // Show all the pagination elements if there are less than 6 pages total
  if (pages < 6) {
    for (let p = 1; p <= pages; p++) {
      active = page == p ? "active" : "no";
      str += '<li class="'+active+'"><a onclick="createPagination(pages, '+p+')">'+ p +'</a></li>';
    }
  }
  // Use "..." to collapse pages outside of a certain range
  else {
    // Show the very first page followed by a "..." at the beginning of the
    // pagination section (after the Previous button)
    if (page > 2) {
      str += '<li class="no page-item"><a onclick="createPagination(pages, 1)">1</a></li>';
      if (page > 3) {
          str += '<li class="out-of-range"><a onclick="createPagination(pages,'+(page-2)+')">...</a></li>';
      }
    }
    // Determine how many pages to show after the current page index
    if (page === 1) {
      pageCutHigh += 2;
    } else if (page === 2) {
      pageCutHigh += 1;
    }
    // Determine how many pages to show before the current page index
    if (page === pages) {
      pageCutLow -= 2;
    } else if (page === pages-1) {
      pageCutLow -= 1;
    }
    // Output the indexes for pages that fall inside the range of pageCutLow
    // and pageCutHigh
    for (let p = pageCutLow; p <= pageCutHigh; p++) {
      if (p === 0) {
        p += 1;
      }
      if (p > pages) {
        continue
      }
      active = page == p ? "active" : "no";
      str += '<li class="page-item '+active+'"><a onclick="createPagination(pages, '+p+')">'+ p +'</a></li>';
    }
    // Show the very last page preceded by a "..." at the end of the pagination
    // section (before the Next button)
    if (page < pages-1) {
      if (page < pages-2) {
        str += '<li class="out-of-range"><a onclick="createPagination(pages,'+(page+2)+')">...</a></li>';
      }
      str += '<li class="page-item no"><a onclick="createPagination(pages, pages)">'+pages+'</a></li>';
    }
  }
  // Show the Next button only if you are on a page other than the last
  if (page < pages) {
    str += '<li class="page-item next no"><a onclick="createPagination(pages, '+(page+1)+')">Next</a></li>';
  }
  str += '</ul>';
  // Return the pagination string to be outputted in the pug templates
  document.getElementById('pagination').innerHTML = str;
  const s = (page - 1) * rowPerPage;
  const e = page * rowPerPage;
  createContentList(s, e);
  return str;
}

function getContents(event, argument){
  let newContents = [];
  for(let i = 0 ; i < argument.length ; i++){
    newContents.push(argument[i]);
  }
  newContents.sort((left, right) => {
    if(left.date < right.date) return 1;
    else if(left.date > right.date) return -1;
    else return 0;
  });
  contents = newContents;
}

const loadsite = (idx) => {
  ipcRenderer.send('loadSite', idx);
}

// [s, e)
function createContentList(s, e){
  let str = '';
  // console.log(contents[i]);
  for(let i = s; i < e; i++){
      item = contents[i];
      let newIcon = `<i className = 'content_siteMark'></i>`;
      let newTitle = 
      `<a className = 'content_title' onclick = "loadsite(${i})"> ${item.title} </a>`;
      let newStartDate = `<span className = 'startDate'>${item.date}</span>`;
      let newEndDate = `<span className = 'endDate'>${item.date}</span>`;
      let newContentDate = 
      `<div className = 'content_date'>
        ${newStartDate}
        ${newEndDate}
      </div>`;
      let newItem = 
      `<li className = 'content'>
        ${newIcon}
        ${newTitle}
        ${newContentDate}
      </li>`;
      str += newItem;
  }
  contentList.innerHTML = str;
}

ipcRenderer.on('init', (event, argument) => {
  getContents(event, argument);
  pages = Math.floor(contents.length / rowPerPage);
  createPagination(pages, 1);
});