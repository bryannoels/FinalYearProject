import sys
import requests
from bs4 import BeautifulSoup
import json

def categorize_rating(rating):
    rating = rating.lower()
    if any(keyword in rating for keyword in ['outperform', 'buy', 'overweight', 'positive']):
        return 1
    elif any(keyword in rating for keyword in ['sell', 'underweight', 'underperform', 'negative', 'reduce']):
        return -1
    else:
        return 0

def get_analysis(stock_symbol):
    url = f'https://finance.yahoo.com/quote/{stock_symbol}/analysis/'
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
    }    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        upgrades_downgrades = []
        rows = soup.find('section',{'data-testid':'upgrade-downgrade-table'}).find_all('tr')
        unique_firms = set()

        for row in rows:
            columns = row.find_all('td')
            if len(columns) >= 2:
                firm_rating_text = columns[1].text.strip()
                
                if ': ' in firm_rating_text:
                    firm_name, current_rating = firm_rating_text.split(': ')[0], firm_rating_text.split(' to ')[-1]
                    
                    if firm_name not in unique_firms:
                        unique_firms.add(firm_name)
                        action = categorize_rating(current_rating)
                        upgrades_downgrades.append({
                            'Firm': firm_name,
                            'Rating': current_rating,
                            'Action': action
                        })
            
            if len(upgrades_downgrades) >= 10:
                break
        
        growthRate = soup.find('section',{'data-testid':'growthEstimate'}).find_all('tr')[5].find_all('td')[1].text.strip()
        
        result = {
            'growthRate': growthRate,
            'analysis': upgrades_downgrades
        }
        return result
    else:
        return {"error": f"Failed to retrieve data. Status code: {response.status_code}"}

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    upgrades_downgrades = get_analysis(stock_symbol)
    print(json.dumps(upgrades_downgrades, indent=4))
