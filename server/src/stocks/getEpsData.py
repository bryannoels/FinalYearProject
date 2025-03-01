import requests
import json
import sys
import random
from bs4 import BeautifulSoup

USER_AGENTS = [
    "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 CrKey/1.54.250320",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
]

def get_eps_data(stock_symbol):
    url = f"https://www.macrotrends.net/stocks/charts/{stock_symbol}/apple/eps-earnings-per-share-diluted"
    
    headers = {
        "User-Agent": random.choice(USER_AGENTS)
    }
    
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        try:
            table = soup.find("table", class_="historical_data_table")
            eps_data = []

            for row in table.find("tbody").find_all("tr"):
                cells = row.find_all("td")
                if len(cells) >= 2:
                    year = int(cells[0].text.strip())
                    eps_value = float(cells[1].text.strip().replace('$', '').replace(',', ''))
                    eps_data.append({"Year": year, "EPS": eps_value})
                    
            eps_data.sort(key=lambda x: x["Year"])

            return {
                "Symbol": stock_symbol,
                "EPS_Data": eps_data
            }

        except AttributeError:
            return {"error": "Could not find the EPS data table on the page."}
    else:
        return {"error": f"Failed to retrieve the webpage. Status code: {response.status_code}"}

# for lambda func: LABA-python-stocks-get-eps-data
def lambda_handler(event, context):
    stock_symbol = event.get("stock_symbol")
    eps_data = get_eps_data(stock_symbol)
    return json.dumps(eps_data, indent=4)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    eps_data = get_eps_data(stock_symbol)
    print(json.dumps(eps_data, indent=4))
