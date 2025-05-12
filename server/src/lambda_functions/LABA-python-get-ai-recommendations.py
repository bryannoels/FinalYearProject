import json
import boto3
import csv
import io
import os
import openai
from datetime import datetime
import math

s3 = boto3.client('s3')

openai.api_key = os.environ.get('OPENAI_API_KEY')

def get_number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def sort_and_filter_data(formatted, sort_by):
    config = {
        'percent_graham': {
            'field': 'Percent Benjamin Graham',
            'return_fields': ['Stock Symbol', 'Company Name', 'Opening Price', 'Benjamin Graham Value', 'Percent Benjamin Graham'],
            'filter': lambda item: -10 <= get_number(item.get('Percent Benjamin Graham')) <= 10 if get_number(item.get('Percent Benjamin Graham')) is not None else False
        },
        'stddev': {
            'field': 'Intrinsic Value Standard Deviation',
            'return_fields': ['Stock Symbol', 'Company Name', 'Opening Price', 'Intrinsic Value Standard Deviation']
        }
    }

    sort_option = config.get(sort_by, None)

    filtered = []
    for item in formatted['data']:
        if sort_option:
            if item.get(sort_option['field']) is not None:
                filtered_item = {field: item.get(field) for field in sort_option['return_fields']}
                filtered.append(filtered_item)
        else:
            if any(v is not None for v in item.values()):
                filtered.append(item)

    if sort_option:
        filtered.sort(key=lambda x: get_number(x.get(sort_option['field'])) or math.inf)

    if sort_option and 'filter' in sort_option:
        filtered = list(filter(sort_option['filter'], filtered))

    top_10 = filtered[:10]

    return {
        'data': top_10,
        'totalItems': len(filtered),
        'retrievedAt': formatted.get('retrievedAt', datetime.utcnow().isoformat())
    }

def load_csv_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    return list(reader)

def get_gpt_recommendations(reference_stocks, user_criteria):
    prompt = f"""
You are a stock recommendation engine. The user selected these criteria:
- Risk Level: {user_criteria['risk_level']}
- Sector: {user_criteria['sector']}
- Horizon: {user_criteria['horizon']}

Reference stocks (from recent value investing filters):
{json.dumps(reference_stocks, indent=2)}

Recommend exactly 5 U.S. stocks suitable for the user's criteria.
For each stock, give:
- Stock Symbol
- Company Name
- 3 Reasons for recommendation (based on value, sector, horizon fit)
Your response should be in JSON array format like:
[
  {{
    "stock_symbol": "...",
    "company_name": "...",
    "reasons": ["...",
      "...",
      "..."
      ],
  }},
  ...
]
Only include the recommendations, no extra explanation.
    """

    client = openai.OpenAI()

    response = client.chat.completions.create(
        model="gpt-4.1",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}]
    )

    answer = response.choices[0].message.content
    try:
        recommendations = json.loads(answer)
        return recommendations
    except json.JSONDecodeError:
        return {"error": "Failed to parse GPT response."}

def lambda_handler(event, context):
    try:
        bucket = 'laba.portfolio.booster'
        key = 'sp_500/company_valuations.csv'

        rows = load_csv_from_s3(bucket, key)

        formatted_data = {
            'data': rows,
            'retrievedAt': datetime.utcnow().isoformat()
        }
        
        graham_top10 = sort_and_filter_data(formatted_data, 'percent_graham')['data']
        stddev_top10 = sort_and_filter_data(formatted_data, 'stddev')['data']
        print(f"graham_10: ", graham_top10)
        print(f"stddev_10: ", stddev_top10)
        
        print(f"Incoming event: {event}")

        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        elif isinstance(event.get('body'), dict):
            body = event['body']
        else:
            body = event 

        user_criteria = {
            'risk_level': body.get('risk_level', 'low'),
            'sector': body.get('sector', 'any'),
            'horizon': body.get('horizon', 'short-term')
        }
        print(f"user_criteria: ", user_criteria)

        reference_stocks = graham_top10 + stddev_top10
        recommendations = get_gpt_recommendations(reference_stocks, user_criteria)
        print(f"recommendations: ", recommendations)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': {
                'recommendations': recommendations,
                'retrievedAt': datetime.utcnow().isoformat()
            }
        }

    except s3.exceptions.NoSuchKey:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'CSV file not found in S3.'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
