import requests
import json
import sys
from bs4 import BeautifulSoup

def get_pe_ratio_data(stock_symbol):
    url = f"https://www.macrotrends.net/stocks/charts/{stock_symbol}/stock/pe-ratio"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        try:
            table = soup.find("table", class_="table")
            pe_ratio_data = []

            rows = table.find("tbody").find_all("tr")
            for index, row in enumerate(rows):
                if index % 4 == 3:
                    cells = row.find_all("td")
                    if len(cells) >= 3:
                        year = cells[0].text.strip()[:4]
                        pe_ratio = float(cells[3].text.strip().replace(',', ''))
                        if pe_ratio != "":
                            pe_ratio_data.append({"Year": year, "PE_Ratio": pe_ratio})

            pe_ratio_data.sort(key=lambda x: x["Year"])

            return {
                "Symbol": stock_symbol,
                "PE_Ratio_Data": pe_ratio_data
            }

        except AttributeError:
            return {"error": "Could not find the PE ratio data table on the page."}
    else:
        return {"error": f"Failed to retrieve the webpage. Status code: {response.status_code}"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        stock_symbol = sys.argv[1]
        pe_data = get_pe_ratio_data(stock_symbol)
        print(json.dumps(pe_data, indent=4))
