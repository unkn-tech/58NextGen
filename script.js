async function loadData() {
    const response = await fetch('/api/chat-data');
    const data = await response.json();
  
    const fund = data.fund;
    const news = data.news;
  
    // Display Fund Info
    document.getElementById('fundInfo').innerHTML = `
      <h3>${fund.name}</h3>
      <p><strong>NAV:</strong> ₹${fund.latest_nav}</p>
      <p><strong>Change:</strong> ₹${fund.change.toFixed(2)}</p>
    `;
  
    // Display News
    const newsContainer = document.getElementById('newsList');
    newsContainer.innerHTML = '<h3>Latest News</h3>';
    news.forEach(item => {
      const div = document.createElement('div');
      div.className = 'news-item';
      div.innerHTML = `
        <strong>${item.title}</strong>
        <p>${item.summary}</p>
      `;
      newsContainer.appendChild(div);
    });
  
    // Save data globally for question matching
    window.chatData = { fund, news };
  }
  
  function askQuestion() {
    const input = document.getElementById('userInput').value;
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
  
    let matched = false;
    const news = window.chatData.news;
    const fund = window.chatData.fund;
  
    for (let item of news) {
      const text = (item.title + " " + item.summary).toLowerCase();
      if (input.toLowerCase().split(" ").some(word => text.includes(word))) {
        chatBox.innerHTML += `
          <p><strong>Bot:</strong><br>
          📰 <strong>${item.title}</strong><br>
          📄 ${item.summary}<br>
          ${
            fund.change > 0 ? "✅ Fund NAV increased, possibly due to this news." :
            fund.change < 0 ? "⚠ Fund NAV decreased, this news might explain why." :
            "ℹ No significant NAV change despite the news."
          }
          </p>
        `;
        matched = true;
        break;
      }
    }
  
    if (!matched) {
      chatBox.innerHTML += `<p><strong>Bot:</strong> ❌ No matching news found.</p>`;
    }
  
    document.getElementById('userInput').value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  loadData();
  