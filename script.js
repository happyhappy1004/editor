document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchField = document.getElementById('searchField');
  const resultsArea = document.getElementById('resultsArea');

  // Store editorials data
  let editorialsData = [];

  // Load XML Data
  fetch('editor.xml')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(str => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(str, "text/xml");
      editorialsData = parseEditorials(xmlDoc);
      console.log('Data loaded:', editorialsData.length, 'items');
    })
    .catch(error => {
      console.error('Error loading XML:', error);
      resultsArea.innerHTML = `<div class="empty-state"><p>데이터를 불러오는 중 오류가 발생했습니다.<br>(${error.message})</p></div>`;
    });

  // Event Listeners
  searchBtn.addEventListener('click', performSearch);

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Parse XML to Object Array
  function parseEditorials(xmlDoc) {
    const items = xmlDoc.getElementsByTagName('editorial');
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const getTagVal = (tag) => item.getElementsByTagName(tag)[0]?.textContent || '';

      // Structure parsing
      const structureNode = item.getElementsByTagName('structure')[0];
      const structure = {
        background: structureNode?.getElementsByTagName('background')[0]?.textContent || '',
        evidence: structureNode?.getElementsByTagName('evidence')[0]?.textContent || '',
        argument: structureNode?.getElementsByTagName('argument')[0]?.textContent || '',
        fact: structureNode?.getElementsByTagName('fact')[0]?.textContent || ''
      };

      results.push({
        id: item.getAttribute('id'),
        title: getTagVal('title'),
        author: getTagVal('author'),
        date: getTagVal('date'),
        structure: structure
      });
    }
    return results;
  }

  // Search Logic
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const field = searchField.value;

    if (!query) {
      // Option 1: Show alert
      // alert('검색어를 입력해주세요.');
      // Option 2: Show all items (Preferred for UX)
      renderResults(editorialsData);
      return;
    }

    const filtered = editorialsData.filter(item => {
      if (field === 'all') {
        return item.title.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query) ||
          item.structure.background.toLowerCase().includes(query) ||
          item.structure.evidence.toLowerCase().includes(query) ||
          item.structure.argument.toLowerCase().includes(query) ||
          item.structure.fact.toLowerCase().includes(query);
      } else if (field === 'title') {
        return item.title.toLowerCase().includes(query);
      } else if (field === 'author') {
        return item.author.toLowerCase().includes(query);
      } else if (field === 'background') {
        return item.structure.background.toLowerCase().includes(query);
      } else if (field === 'evidence') {
        return item.structure.evidence.toLowerCase().includes(query);
      } else if (field === 'argument') {
        return item.structure.argument.toLowerCase().includes(query);
      } else if (field === 'fact') {
        return item.structure.fact.toLowerCase().includes(query);
      }
      return false;
    });

    renderResults(filtered, query);
  }

  // Render Logic
  function renderResults(items, query = '') {
    resultsArea.innerHTML = '';

    if (items.length === 0) {
      resultsArea.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="search-x"></i>
                    <p>검색 결과가 없습니다.</p>
                </div>
            `;
      lucide.createIcons();
      return;
    }

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'editorial-card';

      // Helper for highlighting
      const h = (text) => highlightText(text, query);

      card.innerHTML = `
                <div class="card-header">
                    <h2 class="card-title">${h(item.title)}</h2>
                    <div class="card-meta">
                        <span class="meta-item"><i data-lucide="user" size="14"></i> ${h(item.author)}</span>
                        <span class="meta-item"><i data-lucide="calendar" size="14"></i> ${item.date}</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="section-block background">
                        <div class="section-label">Background</div>
                        <p class="section-text">${h(item.structure.background)}</p>
                    </div>
                    <div class="section-block evidence">
                        <div class="section-label">Evidence</div>
                        <p class="section-text">${h(item.structure.evidence)}</p>
                    </div>
                    <div class="section-block argument">
                        <div class="section-label">Argument</div>
                        <p class="section-text">${h(item.structure.argument)}</p>
                    </div>
                    <div class="section-block fact">
                        <div class="section-label">Fact</div>
                        <p class="section-text">${h(item.structure.fact)}</p>
                    </div>
                </div>
            `;
      resultsArea.appendChild(card);
    });

    // Re-initialize icons for new elements
    lucide.createIcons();
  }

  // Highlight Helper
  function highlightText(text, query) {
    if (!query) return text;

    // Escape RegEx special characters
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');

    return text.replace(regex, '<span class="highlight">$1</span>');
  }
});
