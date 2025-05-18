(function() {
  // Check if reader mode is already active (to prevent re-triggering)
  if (document.body.classList.contains('article-reader-active')) {
    return;
  }

  function activateReaderMode() {
    const reader = new Readability(document);
    const article = reader.parse();

    if (article) {
      document.body.innerHTML = `
        <div class="article-reader-container">
          <h1><span class="math-inline">\{article\.title \|\| 'Article'\}</h1\>
