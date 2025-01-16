import schedule
import time
from datetime import datetime, timedelta
import pytz

singapore_tz = pytz.timezone("Asia/Singapore")

def my_scheduled_task():
    print(f"Task executed at {datetime.now(singapore_tz).strftime('%Y-%m-%d %H:%M:%S')} Singapore Time")

def schedule_task():
    current_time = datetime.now(singapore_tz)
    target_time = current_time.replace(hour=22, minute=13, second=45, microsecond=0)
    
    if target_time <= current_time:
        target_time += timedelta(days=1)
    
    delay_seconds = (target_time - current_time).total_seconds()
    print(f"Next run scheduled in {delay_seconds} seconds")
    
    time.sleep(delay_seconds)
    my_scheduled_task()

while True:
    schedule_task()
