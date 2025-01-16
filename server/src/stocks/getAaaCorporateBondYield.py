import requests
from bs4 import BeautifulSoup
import json

def get_aaa_corporate_bond_yield():
    url = f'https://ycharts.com/indicators/us_coporate_aaa_effective_yield'
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
    }    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        aaaCorporateBondYield = soup.find('div', class_='key-stat-title').text.strip().partition(' ')[0]
        
        return { 'aaaCorporateBondYield': aaaCorporateBondYield }
    else:
        return {"error": f"Failed to retrieve data. Status code: {response.status_code}"}

if __name__ == "__main__":
    aaaCorporateBondYield = get_aaa_corporate_bond_yield()
    print(json.dumps(aaaCorporateBondYield, indent=4))
