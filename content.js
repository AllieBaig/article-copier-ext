(function() {
  // Check if reader mode is already active
  if (document.body.classList.contains('article-reader-active')) {
    return;
  }

  function activateReaderMode() {
    const reader = new Readability(document);
    const article = reader.parse();

    if (article) {
      const articleContainer = document.createElement('div');
      articleContainer.className = 'article-reader-container';
      articleContainer.innerHTML = `
        <h1>${article.title || 'Article'}</h1>
        <div class="article-reader-content">${article.content || '<p>Could not extract article content.</p>'}</div>
        <div style="margin-top: 10px;">
          <button id="copyPlainButton">Copy Plain Text</button>
          <button id="copyFormattedButton">Copy Formatted</button>
          <button id="highlightButton">Highlight</button>
          <button id="saveButton">Save Article Offline</button>
          <button id="exportPlainButton">Export as Plain Text</button>
          <button id="exportMarkdownButton">Export as Markdown</button>
        </div>
      `;

      document.body.innerHTML = '';
      document.body.appendChild(articleContainer);
      document.body.classList.add('article-reader-active');

      // Copy Functionality
      const copyPlainButton = document.getElementById('copyPlainButton');
      if (copyPlainButton) {
        copyPlainButton.addEventListener('click', () => {
          const articleText = document.querySelector('.article-reader-content').textContent;
          navigator.clipboard.writeText(articleText)
            .then(() => alert('Article text (plain) copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
        });
      }

      const copyFormattedButton = document.getElementById('copyFormattedButton');
      if (copyFormattedButton) {
        copyFormattedButton.addEventListener('click', () => {
          const articleContent = document.querySelector('.article-reader-content').innerHTML;
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
      }

      // Highlighting Functionality
      const articleContentDiv = document.querySelector('.article-reader-content');
      const highlightButton = document.getElementById('highlightButton');
      let selectedText = '';

      if (articleContentDiv && highlightButton) {
        articleContentDiv.addEventListener('mouseup', () => {
          selectedText = window.getSelection().toString().trim();
        });

        highlightButton.addEventListener('click', () => {
          if (selectedText) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const newNode = document.createElement('span');
              newNode.className = 'highlighted';
              range.surroundContents(newNode);
              window.getSelection().removeAllRanges();
              selectedText = '';
              // TODO: Store the highlight information locally
              console.log('Highlighted:', newNode.textContent);
            }
          }
        });
      }

      // Save Article Functionality
      const saveButton = document.getElementById('saveButton');
      if (saveButton) {
        saveButton.addEventListener('click', () => {
          const articleData = {
            title: document.querySelector('.article-reader-container h1')?.textContent || 'Saved Article',
            content: document.querySelector('.article-reader-container').innerHTML
          };
          localStorage.setItem(`saved_article_${window.location.href}`, JSON.stringify(articleData));
          alert('Article saved for offline reading!');
        });
      }

      // Export Functionality
      function downloadFile(filename, content, contentType) {
        const link = document.createElement('a');
        link.setAttribute('href', `data:${contentType};charset=utf-8,${encodeURIComponent(content)}`);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      const exportPlainButton = document.getElementById('exportPlainButton');
      if (exportPlainButton) {
        exportPlainButton.addEventListener('click', () => {
          const articleText = document.querySelector('.article-reader-content').textContent;
          downloadFile('article.txt', articleText, 'text/plain');
        });
      }

      const exportMarkdownButton = document.getElementById('exportMarkdownButton');
      if (exportMarkdownButton) {
        exportMarkdownButton.addEventListener('click', () => {
          const articleContent = document.querySelector('.article-reader-content').innerHTML;
          const markdownText = articleContent.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
                                             .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
                                             .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
                                             .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                                             .replace(/<em>(.*?)<\/em>/g, '*$1*')
                                             .replace(/<li>(.*?)<\/li>/g, '- $1\n')
                                             .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
                                             .replace(/<br>/g, '\n');
          downloadFile('article.md', markdownText, 'text/markdown');
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
