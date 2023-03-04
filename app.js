// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = '9e80f672976c457da7b1606591c0a803';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  // return request to server
  return {
    topHeadlines(country = 'us', cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  // for init all plugins of materialize
  M.AutoInit();
  loadNews();
});

// basic load news
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// fun get respons from server
function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    console.log('error');
    return;
  }

  // console.log(res);
  renderNews(res.articles);
}

// func rend news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  let fragment = '';
  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });
  // console.log(fragment);
  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// news item template func
function newsTemplate({ urlToImage, title, url, description }) {
  // console.log(news);
  return `
    <div class='col s12'
      <div class="card">
        <div class="card-image"
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class='card-action'>
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

// pre
function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
}

// show loader
function showLoader() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
  `
  );
}

// remove loader func
function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}
