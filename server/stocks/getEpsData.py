import requests
import json
import sys
from bs4 import BeautifulSoup

def get_eps_data(stock_symbol):
    url = f"https://www.macrotrends.net/stocks/charts/{stock_symbol}/apple/eps-earnings-per-share-diluted"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
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

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    eps_data = get_eps_data(stock_symbol)
    print(json.dumps(eps_data, indent=4))
