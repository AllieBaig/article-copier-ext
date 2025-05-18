(function() {
  // Check if reader mode is already active
  if (document.body.classList.contains('article-reader-active')) {
    return;
  }

  function activateReaderMode() {
    const reader = new Readability(document);
    const article = reader.parse();

    if (article) {
      document.body.innerHTML = `
        <div class="article-reader-container">
          <h1>${article.title || 'Article'}</h1>
          <div class="article-reader-content">${article.content || '<p>Could not extract article content.</p>'}</div>
          <button id="copyArticleButton">Copy Article</button>
        </div>
      `;
      document.body.classList.add('article-reader-active');


// Inside activateReaderMode function, after creating the article container
const copyOptionsDiv = document.createElement('div');
copyOptionsDiv.style.marginTop = '10px';

const copyPlainButton = document.createElement('button');
copyPlainButton.textContent = 'Copy Plain Text';
copyOptionsDiv.appendChild(copyPlainButton);

const copyFormattedButton = document.createElement('button');
copyFormattedButton.textContent = 'Copy Formatted';
copyOptionsDiv.appendChild(copyFormattedButton);

articleContainer.appendChild(copyOptionsDiv);




// Inside activateReaderMode function, after creating the buttons
copyPlainButton.addEventListener('click', () => {
  const articleText = document.querySelector('.article-reader-content').textContent;
  navigator.clipboard.writeText(articleText)
    .then(() => alert('Article text (plain) copied to clipboard!'))
    .catch(err => console.error('Failed to copy:', err));
});

copyFormattedButton.addEventListener('click', () => {
  const articleContent = document.querySelector('.article-reader-content').innerHTML;
  // Basic formatting - you might need a more robust solution
  const formattedText = articleContent.replace(/<h\d>/g, '\n# ').replace(/<\/h\d>/g, '\n\n')
                                     .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
                                     .replace(/<em>/g, '*').replace(/<\/em>/g, '*')
                                     .replace(/<li>/g, '- ').replace(/<\/li>/g, '\n')
                                     .replace(/<p>/g, '\n').replace(/<\/p>/g, '\n\n')
                                     .replace(/<br>/g, '\n');
  navigator.clipboard.writeText(formattedText)
    .then(() => alert('Article text (formatted) copied to clipboard!'))
    .catch(err => console.error('Failed to copy formatted text:', err));
});


      const copyButton = document.getElementById('copyArticleButton');
      if (copyButton) {
        copyButton.addEventListener('click', () => {
          const articleText = document.querySelector('.article-reader-content').textContent;
          navigator.clipboard.writeText(articleText)
            .then(() => alert('Article copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
        });
      }
    } else {
      console.log('Could not parse article on this page.');
      // Optionally display a message to the user
    }
  }

  function isLikelyArticle() {
    const articleElement = document.querySelector('article');
    const headingCount = document.querySelectorAll('h1, h2, h3').length;
    const paragraphCount = document.querySelectorAll('p').length;
    const liCount = document.querySelectorAll('li').length;
    const textLength = document.body.textContent.length;

    // More sophisticated checks
    const hasMainContent = textLength > 800;
    const hasSufficientHeadings = headingCount >= 1;
    const hasSufficientParagraphsOrLists = paragraphCount >= 5 || liCount >= 15;

    return (articleElement !== null && hasMainContent) || (hasSufficientHeadings && hasSufficientParagraphsOrLists && hasMainContent);
  }

  // Trigger reader mode automatically on page load if it looks like an article
  if (document.readyState === 'complete') {
    if (isLikelyArticle()) {
      activateReaderMode();
    }
  } else {
    window.addEventListener('load', () => {
      if (isLikelyArticle()) {
        activateReaderMode();
      }
    });
  }

  // Listen for messages from the background script (e.g., toolbar icon click)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleReaderMode") {
      activateReaderMode();
    }
  });
})();
