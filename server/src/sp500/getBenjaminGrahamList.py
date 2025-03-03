import yfinance as yf
import sys
import json
import sys
sys.path.append('../stocks')
from getEpsData import get_eps_data
from getPeRatioData import get_pe_ratio_data

def get_benjamin_graham_list(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    defensive_value = 0
    defensive = ""
    enterprising_value = 0
    enterprising = ""
    stock_data = {}
    stock_info = stock.info
    
    # 1. total revenue
    total_revenue = stock_info.get('totalRevenue', None)
    if (total_revenue and total_revenue >= 100000000):
        defensive_value += 1
        defensive += "1"
    else:
        defensive += "0"
        
    if (total_revenue and total_revenue > 0):
        enterprising_value += 1
        enterprising += "1"
    else:
        enterprising += "0"
    
    
    # 2. current ratio
    current_ratio = stock_info.get('currentRatio', None)
    if (current_ratio and current_ratio >= 2):
        defensive_value += 1
        defensive += "1"
    else:
        defensive += "0"
        
    if (current_ratio and current_ratio >= 1.5):
        enterprising_value += 1
        enterprising += "1"
    else:
        enterprising += "0"
        
    
    # 3. EPS
    eps = get_eps_data(stock_symbol)
    if not eps or 'EPS_Data' not in eps:
        defensive += "0"
        enterprising += "0"
    else:
        eps_data = eps['EPS_Data']
        sorted_eps_data = sorted(eps_data, key=lambda x: x['Year']) if len(eps_data) > 0 else []

        if (len(sorted_eps_data) <= 10 and all(entry['EPS'] >= 0 for entry in sorted_eps_data)) or (len(sorted_eps_data) > 10 and all(entry['EPS'] >= 0 for entry in sorted_eps_data[-10:])):
            defensive_value += 1
            defensive += "1"
        else:
            defensive += "0"

        if (len(sorted_eps_data) <= 5 and all(entry['EPS'] >= 0 for entry in sorted_eps_data)) or (len(sorted_eps_data) > 5 and all(entry['EPS'] >= 0 for entry in sorted_eps_data[-5:])):
            enterprising_value += 1
            enterprising += "1"
        else:
            enterprising += "0"
            
    
    # 4. Dividend
    dividends = stock.dividends
    dividend_by_year = dividends.groupby(dividends.index.year).max()
    stock_data['dividends'] = [{"Year": int(year), "Dividend": dividend} for year, dividend in dividend_by_year.items()]
    if (len(stock_data['dividends']) <= 20 and all(entry['Dividend'] > 0 for entry in stock_data['dividends'])) or (len(stock_data['dividends']) > 20 and all(entry['Dividend'] > 0 for entry in stock_data['dividends'][-20:])):
        defensive_value += 1
        defensive += "1"
    else:
        defensive += "0"
        
    if stock_data['dividends'] and stock_data['dividends'][-1]['Dividend'] > 0:
        enterprising_value += 1
        enterprising += "1"
    else:
        enterprising += "0"


    # 5. Earnings Growth
    if not eps or 'EPS_Data' not in eps:
        defensive += "0"
        enterprising += "0"
    else:
        eps_data = eps['EPS_Data']
        sorted_eps_data = sorted(eps_data, key=lambda x: x['Year'])
        
        if (len(sorted_eps_data) >= 10 and (sum([entry['EPS'] for entry in sorted_eps_data[-10:-7]]) > 0) and (sum([entry['EPS'] for entry in sorted_eps_data[-3:0]]) / 3) / (sum([entry['EPS'] for entry in sorted_eps_data[-10:-7]]) / 3) >= 4.0 / 3):
            defensive_value += 1
            defensive += "1"
        else:
            defensive += "0"
            
        if (sorted_eps_data and sorted_eps_data[0]['EPS'] > 0 and sorted_eps_data[-1]['EPS'] / sorted_eps_data[0]['EPS'] >= 1.0) and not (sorted_eps_data and sorted_eps_data[0]['EPS'] == 0 and sorted_eps_data[-1]['EPS'] >= 0):
            enterprising_value += 1
            enterprising += "1"
        else:
            enterprising += "0"
            
    
    # 6. PE Ratio    
    pe_ratio = get_pe_ratio_data(stock_symbol)
    if pe_ratio and 'PE_Ratio_Data' in pe_ratio:
        pe_ratio_data = pe_ratio['PE_Ratio_Data']
        sortedPeData = sorted(pe_ratio_data, key=lambda x: x['Year'], reverse=True)
        if len(sortedPeData) > 3 and round(sum(entry['PE_Ratio'] for entry in sortedPeData[:3]) / 3, 2) <= 15:
            defensive_value += 1
            defensive += "1"
        else:
            defensive += "0"
    else:
        defensive += "0"

        
    enterprising_value += 1
    enterprising += "1"

        
    # 7. Price to Assets
    if pe_ratio and 'PE_Ratio_Data' in pe_ratio:
        pe_ratio_data = pe_ratio['PE_Ratio_Data']
        sortedPeData = sorted(pe_ratio_data, key=lambda x: x['Year'], reverse=True)
        price_to_book = float(stock_info.get('priceToBook', None))
        if (price_to_book and len(sortedPeData) > 0):
            pe_ratio_value = round(sortedPeData[0]['PE_Ratio'] * price_to_book, 2)
        else:
            pe_ratio_value = None
            
        if pe_ratio_value and pe_ratio_value <= 22.5:
            defensive_value += 1
            defensive += "1"
        else:
            defensive += "0"
            
        if pe_ratio_value and pe_ratio_value <= 18:
            enterprising_value += 1
            enterprising += "1"
        else:
            enterprising += "0"
    else:
        defensive += "0"
        enterprising += "0"
    
    return {
        "Stock Symbol": stock_symbol,
        "Defensive Value": defensive_value,
        "Defensive": defensive,
        "Enterprising Value": enterprising_value,
        "Enterprising": enterprising
    }

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_benjamin_graham_list(stock_symbol)
    print(json.dumps(stock_data, indent=2))
