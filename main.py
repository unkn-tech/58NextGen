from flask import Flask, jsonify, render_template
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

# Fetch Mutual Fund News
def fetch_news():
    url = "https://www.moneycontrol.com/news/business/mutual-funds/"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    articles = soup.find_all("div", class_="clearfix")

    news_data = []
    for article in articles[:5]:
        title_tag = article.find("h2")
        summary_tag = article.find("p")
        if title_tag and summary_tag:
            news_data.append({
                "title": title_tag.get_text(strip=True),
                "summary": summary_tag.get_text(strip=True)
            })
    return news_data

# Fetch Mutual Fund NAV
def fetch_fund_data():
    url = "https://api.mfapi.in/mf/120503"
    response = requests.get(url)
    if response.status_code != 200:
        return None

    data = response.json()
    latest = float(data['data'][0]['nav'])
    previous = float(data['data'][1]['nav'])
    return {
        "name": data['meta']['scheme_name'],
        "latest_nav": latest,
        "previous_nav": previous,
        "change": latest - previous
    }

# Route to serve index.html (optional)
@app.route('/')
def index():
    return render_template('index.html')

# API Endpoint to return fund + news data
@app.route('/api/chat-data')
def get_chat_data():
    news = fetch_news()
    fund = fetch_fund_data()
    if news and fund:
        return jsonify({"news": news, "fund": fund})
    return jsonify({"error": "Failed to fetch data"}), 500

if __name__ == '__main__':
    app.run(debug=True)
