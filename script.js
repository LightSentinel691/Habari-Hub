const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');
const latestMore = document.getElementById('latest_news_more');
const weeklyMore = document.getElementById("weekly-highlights-more");
let articleNumber;
let lastNewsResultNumber;
let weeklyHighlightsNumber;
const result = [];
const latestNewsResult = [];
const mustReadNewsResult = [];



//Section to handle Event Listeners for Element
leftArrow.addEventListener('click', () => {
    if (articleNumber > 0) {
        articleNumber--;
        displayHeaderNews(articleNumber);
    } else {
        articleNumber = result.length - 1; 
        displayHeaderNews(articleNumber);
    }
}
);
rightArrow.addEventListener('click', () => {
    if (articleNumber < result.length - 1) {
        articleNumber++;
        displayHeaderNews(articleNumber);
    } else {
        articleNumber = 0;
        displayHeaderNews(articleNumber);
    }
}
);
latestMore.addEventListener('click', () => {
    seeMoreNews();
});
weeklyMore.addEventListener('click', () => {       
    seeMoreWeeklyHighlights();
});




//First we get user location
const getUserCity = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=e637c9148a654df3a4f5d41aebe0d72e`
        );
        const data = await response.json();
        console.log(data);
        const city = data.results[0].components.county || data.results[0].components.town || data.results[0].components.state;
        console.log(`User's county: ${city}`);
      } catch (error) {
        console.error('Error fetching city:', error);
      }
    }, (error) => {
      console.error('Geolocation error:', error.message);
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
};



//Here we have the running of our program
getUserCity();
getNewsfromApi();
getLatestNewsfromApi();
// getMustReadNewsfromApi();



async function getNewsfromApi() {
    try {
        const response = await fetch('https://newsdata.io/api/1/latest?apikey=pub_79d5df0bbe5f49b5984e94b2cd6dc4ad&country=ke&language=en&category=politics');
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error('Failed to fetch news data');
        }
        data.results = data.results.slice(0, 10);
        result.length = 0;
        result.push(...data.results);
        console.log('Fetched news:', data.results);
        displayHeaderNews(0); 
        displayHeaderSidebarNews();
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}


function displayHeaderNews(articleNum) {
    const headerImage = document.getElementById('header-image');
    const headerText = document.querySelector('.main-article_text_content');
    headerText.innerHTML = '';
    articleNumber = articleNum || 0;  

    //display only the first article in the header
    const firstArticle = result[articleNum];
    let description = firstArticle.description || 'No description available.';
    // Truncate description if it's too long
    if (description.length > 155) {
        description = description.substring(0, 160) + '...';
    }
    if (firstArticle) {
        headerImage.src = firstArticle.image_url || 'images/default.jpg'; // Fallback image if none is available
        headerText.innerHTML = `
            <p>${firstArticle.source_name} - ${new Date(firstArticle.pubDate).toLocaleDateString()}</p>
            <h1>${firstArticle.title}</h1>
            <p>${description}</p>
            <a href="${firstArticle.link}" target="_blank">Read more</a>
            <p><strong>Published on:</strong> ${new Date(firstArticle.pubDate).toLocaleDateString()}</p>
        `;
        const paragraphs = headerText.querySelectorAll("p");
    
        if (paragraphs.length > 0) {
            paragraphs[0].style.fontSize = "1.2em"; 
            paragraphs[0].style.fontWeight = "bold"; // Set the first paragraph to bold
            paragraphs[0].style.color = "#333"; // Set the color of the first paragraph
            paragraphs[paragraphs.length - 1].style.fontSize = "0.8em"; // Set the font size of the last paragraph to 0.8em
        }
    } else {
        console.log('No articles available for the header.');
    }
}


function displayHeaderSidebarNews() {
    const sidebarContainer = document.getElementById('header-sidebar');
    sidebarContainer.innerHTML = '';

    result.forEach((article, index) => {
        if (index > 0 && index < 11) {
            const articleElement = document.createElement('div');
            articleElement.classList.add('news-item');

            articleElement.innerHTML = `
                <img src="${article.image_url || 'images/default.jpg'}" alt="Article Image" class="sidebar-image">
                <h2>${article.title}</h2>
                <p>${article.description || 'No description available.'}</p>
                <a href="${article.link}" target="_blank">Read more</a>
                <p><strong>Published on:</strong> ${new Date(article.pubDate).toLocaleDateString()}</p>
            `;
            const paragraphs = articleElement.querySelectorAll("p");
            paragraphs[paragraphs.length - 1].style.fontSize = "0.9em";
            paragraphs[paragraphs.length - 1].style.display = "inline-block";
            paragraphs[paragraphs.length - 1].style.float = "right";
            paragraphs[paragraphs.length - 1].style.marginTop = "0"; 
            sidebarContainer.appendChild(articleElement);
        }
    });
}





async function getLatestNewsfromApi() {
    try {
        const response = await fetch('https://newsdata.io/api/1/latest?apikey=pub_79d5df0bbe5f49b5984e94b2cd6dc4ad&q=Nairobi&language=en&category=business,crime,health,technology,top&country=ke');
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error('Failed to fetch news data');
        }
        data.results = data.results.slice(0, 15);
        latestNewsResult.length = 0;
        latestNewsResult.push(...data.results);
        console.log('Latest news:', data.results);
        showLatestNews();
        showWeeklyHighlights();
        scrollText();
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

function showLatestNews() {
    const latestNewsContainer = document.querySelector('.latest-news-grid');
    latestNewsContainer.innerHTML = ''; // Clear previous content
    for (let i = 0; i < 4 && i < latestNewsResult.length; i++) {
        lastNewsResultNumber = i + 1; // Update the last news result number
        const article = latestNewsResult[i];
        const articleElement = document.createElement('div');
        articleElement.classList.add('news-card');
        let description = article.description || 'No description available.';
        // Truncate description if it's too long
        if (description.length > 150) {
            description = description.substring(0, 150) + '...';
        }

        articleElement.innerHTML = `
            <img src="${article.image_url || 'images/default.jpg'}" alt="Article Image" class="latest-news-image">
            <h2>${article.title}</h2>
            <p>${description}</p>
            <a href="${article.link}" target="_blank">Read more</a>
            <p><strong>Published on:</strong> ${new Date(article.pubDate).toLocaleDateString()}</p>
        `;
        articleElement.style.position = "relative";
        const image = articleElement.querySelector('img');
        const header = articleElement.querySelector('h2');
        const paragraphs = articleElement.querySelectorAll("p");
        const anchor = articleElement.querySelector('a');
        image.style.height = '27vh';
        header.style.fontSize = '1.4em';
        header.style.marginInlineStart = "3%";
        header.style.marginInlineEnd = "3%";
        paragraphs[0].style.fontSize = "1.1em";
        paragraphs[0].style.marginInlineStart = "3%";
        paragraphs[0].style.marginInlineEnd = "3%";
        paragraphs[0].style.marginBlockEnd = "12%"; // Set the first paragraph to bold
        anchor.style.position = "absolute";
        anchor.style.bottom = "0";
        anchor.style.left = "0";
        anchor.style.marginInlineStart = "3%";
        anchor.style.marginBlockEnd = "3%";      
        paragraphs[paragraphs.length - 1].style.fontSize = "0.9em";
        paragraphs[paragraphs.length - 1].style.display = "inline-block";
        paragraphs[paragraphs.length - 1].style.float = "right";
        paragraphs[paragraphs.length - 1].style.marginTop = "0"; 
        paragraphs[paragraphs.length - 1].style.position = "absolute";
        paragraphs[paragraphs.length - 1].style.bottom = "0";
        paragraphs[paragraphs.length - 1].style.right = "0";
        paragraphs[paragraphs.length - 1].style.marginInlineStart = "3%";
        paragraphs[paragraphs.length - 1].style.marginInlineEnd = "3%";
        latestNewsContainer.appendChild(articleElement);
    }
}       

function seeMoreNews() {
    const latestNewsContainer = document.querySelector('.latest-news-grid');
    console.log(lastNewsResultNumber < latestNewsResult.length);
    console.log('Last news result number:', lastNewsResultNumber);
    console.log('Latest news result length:', latestNewsResult.length);
    if (lastNewsResultNumber < latestNewsResult.length) {
        let length = lastNewsResultNumber; // Start from the next article
        lastNewsResultNumber = length; // Update the last news result number
        removeFirstNews(); 
        const articleElement = document.createElement('div');
        articleElement.classList.add('news-card');
        let description = latestNewsResult[length].description || 'No description available.';
        // Truncate description if it's too long
        if (description.length > 150) {
            description = description.substring(0, 150) + '...';
        }

        articleElement.innerHTML = `
            <img src="${latestNewsResult[length].image_url || 'images/default.jpg'}" alt="Article Image" class="latest-news-image">
            <h2>${latestNewsResult[length].title}</h2>
            <p>${description}</p>
            <a href="${latestNewsResult[length].link}" target="_blank">Read more</a>
            <p><strong>Published on:</strong> ${new Date(latestNewsResult[length].pubDate).toLocaleDateString()}</p>
        `;
        articleElement.style.position = "relative";
        const image = articleElement.querySelector('img');
        const header = articleElement.querySelector('h2');
        const paragraphs = articleElement.querySelectorAll("p");
        const anchor = articleElement.querySelector('a');
        image.style.height = '27vh';
        header.style.fontSize = '1.4em';
        header.style.marginInlineStart = "3%";
        header.style.marginInlineEnd = "3%";
        paragraphs[0].style.fontSize = "1.1em";
        paragraphs[0].style.marginInlineStart = "3%";
        paragraphs[0].style.marginInlineEnd = "3%";
        paragraphs[0].style.marginBlockEnd = "12%"; // Set the first paragraph to bold
        anchor.style.position = "absolute";
        anchor.style.bottom = "0";
        anchor.style.left = "0";
        anchor.style.marginInlineStart = "3%";
        anchor.style.marginBlockEnd = "3%";      
        paragraphs[paragraphs.length - 1].style.fontSize = "0.9em";
        paragraphs[paragraphs.length - 1].style.display = "inline-block";
        paragraphs[paragraphs.length - 1].style.float = "right";
        paragraphs[paragraphs.length - 1].style.marginTop = "0"; 
        paragraphs[paragraphs.length - 1].style.position = "absolute";
        paragraphs[paragraphs.length - 1].style.bottom = "0";
        paragraphs[paragraphs.length - 1].style.right = "0";
        paragraphs[paragraphs.length - 1].style.marginInlineStart = "3%";
        paragraphs[paragraphs.length - 1].style.marginInlineEnd = "3%";
        latestNewsContainer.appendChild(articleElement);
        lastNewsResultNumber++;
        if (lastNewsResultNumber >= latestNewsResult.length) {
            latestMore.style.display = 'none';}
        }
    console.log('Latest news container:', latestNewsContainer.children.length);

}

function removeFirstNews() {
    const latestNewsContainer = document.querySelector('.latest-news-grid');
    latestNewsContainer.children[0].remove(); // Remove the first news card
}



async function getMustReadNewsfromApi() {
    try {
        const response = await fetch('https://newsdata.io/api/1/latest?apikey=pub_79d5df0bbe5f49b5984e94b2cd6dc4ad&country=wo&language=en&category=top,world');
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error('Failed to fetch news data');
        }
        data.results = data.results.slice(0, 16);
        mustReadNewsResult.length = 0;
        mustReadNewsResult.push(...data.results);
        console.log('Must Read news:', mustReadNewsResult);
        showMustReadNews();
        seeMoreMustReadNews();
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}



function showMustReadNews() {
    const mustReadNewsContainer = document.querySelector('.must-read-article');
    mustReadNewsContainer.innerHTML = ''; // Clear previous content
    mustReadNewsContainer.innerHTML = `
        <img src="${mustReadNewsResult[0].image_url || 'images/default.jpg'}" alt="Must Read Image" class="must-read-image">`
    ;
    const articleElement = document.createElement('div');
    articleElement.classList.add('must-read-article_text');
    articleElement.innerHTML = `
        <p> <img src="${mustReadNewsResult[0].source_icon || 'images/default.jpg'}" alt="Must Read Image" class="circular-image"> ${mustReadNewsResult[0].source_name} - ${new Date(mustReadNewsResult[0].pubDate).toLocaleDateString()}</p>
        <h1>${mustReadNewsResult[0].title}</h1>
        <p>${mustReadNewsResult[0].description || 'No description available.'}</p>
        <a href="${mustReadNewsResult[0].link}" target="_blank">Read more</a>
        <p><strong>Published on:</strong> ${new Date(mustReadNewsResult[0].pubDate).toLocaleDateString()}</p>
    `;
    mustReadNewsContainer.appendChild(articleElement);
    const paragraphs = articleElement.querySelectorAll("p");
    paragraphs[1].style.fontSize = "1.2em"; 
    paragraphs[1].style.color = "#333"
    paragraphs[paragraphs.length - 1].style.fontSize = "0.8em"; 
}

function seeMoreMustReadNews() {
    const sidebarContainer = document.getElementById('must-read-sidebar');
    sidebarContainer.innerHTML = '';

    mustReadNewsResult.forEach((article, index) => {
        let title = mustReadNewsResult[index].title || 'No description available.';
        // Truncate description if it's too long
        if (title.length > 125) {
            title = title.substring(0, 130) + '...';
        }
        if (index > 0 && index < 11) {
            const articleElement = document.createElement('div');
            articleElement.classList.add('news-item');

            articleElement.innerHTML = `
                <img src="${article.image_url || 'images/default.jpg'}" alt="Article Image" class="sidebar-image">
                <h2>${title}</h2>
                <p>${article.description || 'No description available.'}</p>
                <a href="${article.link}" target="_blank">Read more</a>
                <p><strong>Published on:</strong> ${new Date(article.pubDate).toLocaleDateString()}</p>
            `;
            
            articleElement.style.dislay = "block";
            const image = articleElement.querySelector('img');
            const paragraphs = articleElement.querySelectorAll("p");
            image.style.height = '165px';
            image.style.width = '31%';
            image.style.backgroundSize = 'cover';
            paragraphs[paragraphs.length - 1].style.fontSize = "0.9em";
            paragraphs[paragraphs.length - 1].style.display = "inline-block";
            paragraphs[paragraphs.length - 1].style.float = "right";
            paragraphs[paragraphs.length - 1].style.marginTop = "0"; 
            sidebarContainer.appendChild(articleElement);
        }
    });
}


//function to display the weekly highlights


function showWeeklyHighlights() {
    const weeklyHighlightsContainer = document.querySelector('.news-grid');
    weeklyHighlightsContainer.innerHTML = ''; // Clear previous content
    for (let i = latestNewsResult.length - 1; i > latestNewsResult.length - 5 && i > -1; i--) {
        weeklyHighlightsNumber = i - 1; // Update the last news result number
        const article = latestNewsResult[i];
        const articleElement = document.createElement('div');
        articleElement.classList.add('news-card');
        let description = article.description || 'No description available.';
        // Truncate description if it's too long
        if (description.length > 150) {
            description = description.substring(0, 150) + '...';
        }
        articleElement.innerHTML = `
            <img src="${article.image_url || 'images/default.jpg'}" alt="Article Image" class="latest-news-image">
            <h2>${article.title}</h2>
            <p>${description}</p>
            <a href="${article.link}" target="_blank">Read more</a>
            <p><strong>Published on:</strong> ${new Date(article.pubDate).toLocaleDateString()}</p>
        `;
        articleElement.style.position = "relative";
        const image = articleElement.querySelector('img');
        const header = articleElement.querySelector('h2');
        const paragraphs = articleElement.querySelectorAll("p");
        const anchor = articleElement.querySelector('a');
        image.style.height = '27vh';
        header.style.fontSize = '1.4em';
        header.style.marginInlineStart = "3%";
        header.style.marginInlineEnd = "3%";
        paragraphs[0].style.fontSize = "1.1em";
        paragraphs[0].style.marginInlineStart = "3%";
        paragraphs[0].style.marginInlineEnd = "3%";
        paragraphs[0].style.marginBlockEnd = "12%"; // Set the first paragraph to bold
        anchor.style.position = "absolute";
        anchor.style.bottom = "0";
        anchor.style.left = "0";
        anchor.style.marginInlineStart = "3%";
        anchor.style.marginBlockEnd = "3%";      
        paragraphs[paragraphs.length - 1].style.fontSize = "0.9em";
        paragraphs[paragraphs.length - 1].style.display = "inline-block";
        paragraphs[paragraphs.length - 1].style.float = "right";
        paragraphs[paragraphs.length - 1].style.marginTop = "0"; 
        paragraphs[paragraphs.length - 1].style.position = "absolute";
        paragraphs[paragraphs.length - 1].style.bottom = "0";
        paragraphs[paragraphs.length - 1].style.right = "0";
        paragraphs[paragraphs.length - 1].style.marginInlineStart = "3%";
        paragraphs[paragraphs.length - 1].style.marginInlineEnd = "3%";
        weeklyHighlightsContainer.appendChild(articleElement);
    }
}       


function seeMoreWeeklyHighlights() {
    const latestNewsContainer = document.querySelector('.news-grid');
    console.log(weeklyHighlightsNumber < latestNewsResult.length);
    console.log('Weekly news result number:', weeklyHighlightsNumber);
    console.log('Latest news result length:', latestNewsResult.length);
    if (weeklyHighlightsNumber > -1) {
        let length = weeklyHighlightsNumber; // Start from the next article
        weeklyHighlightsNumber = length; // Update the last news result number
        removeFirstWeeklyNews(); 
        const articleElement = document.createElement('div');
        articleElement.classList.add('news-card');
        let description = latestNewsResult[length].description || 'No description available.';
        // Truncate description if it's too long
        if (description.length > 150) {
            description = description.substring(0, 150) + '...';
        }

        articleElement.innerHTML = `
            <img src="${latestNewsResult[length].image_url || 'images/default.jpg'}" alt="Article Image" class="latest-news-image">
            <h2>${latestNewsResult[length].title}</h2>
            <p>${description}</p>
            <a href="${latestNewsResult[length].link}" target="_blank">Read more</a>
            <p><strong>Published on:</strong> ${new Date(latestNewsResult[length].pubDate).toLocaleDateString()}</p>
        `;
        articleElement.style.position = "relative";
        const image = articleElement.querySelector('img');
        const header = articleElement.querySelector('h2');
        const paragraphs = articleElement.querySelectorAll("p");
        const anchor = articleElement.querySelector('a');
        image.style.height = '27vh';
        header.style.fontSize = '1.4em';
        header.style.marginInlineStart = "3%";
        header.style.marginInlineEnd = "3%";
        paragraphs[0].style.fontSize = "1.1em";
        paragraphs[0].style.marginInlineStart = "3%";
        paragraphs[0].style.marginInlineEnd = "3%";
        paragraphs[0].style.marginBlockEnd = "12%"; // Set the first paragraph to bold
        anchor.style.position = "absolute";
        anchor.style.bottom = "0";
        anchor.style.left = "0";
        anchor.style.marginInlineStart = "3%";
        anchor.style.marginBlockEnd = "3%";      
        paragraphs[paragraphs.length - 1].style.fontSize = "0.9em";
        paragraphs[paragraphs.length - 1].style.display = "inline-block";
        paragraphs[paragraphs.length - 1].style.float = "right";
        paragraphs[paragraphs.length - 1].style.marginTop = "0"; 
        paragraphs[paragraphs.length - 1].style.position = "absolute";
        paragraphs[paragraphs.length - 1].style.bottom = "0";
        paragraphs[paragraphs.length - 1].style.right = "0";
        paragraphs[paragraphs.length - 1].style.marginInlineStart = "3%";
        paragraphs[paragraphs.length - 1].style.marginInlineEnd = "3%";
        latestNewsContainer.appendChild(articleElement);
        weeklyHighlightsNumber--;
        if (weeklyHighlightsNumber <= -1) {
            weeklyMore.style.display = 'none';}
        }
    else {
         // Hide the "See More" button if no more articles are available
    }

    console.log('Latest news container:', latestNewsContainer.children.length);

}

function removeFirstWeeklyNews() {
    const latestNewsContainer = document.querySelector('.news-grid');
    latestNewsContainer.children[0].remove(); // Remove the first news card
}

function scrollText() {
    console.log('DOM fully loaded and parsed');
    const textElement = document.getElementById("scrollingText");
    textElement.innerHTML = ""; // Clear previous text

    const newsItems = result.slice(0, 5);
    let fullText = "";

    newsItems.forEach((item, index) => {
        fullText += `${index + 1}. ${item.title}   `;
    });
    console.log('Full text:', fullText);

    textElement.textContent = fullText; // Assign all text at once
}
