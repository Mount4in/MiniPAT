import requests
import re
import openpyxl
import time
import sys
from requests.adapters import HTTPAdapter

def init_session():
    """
    Initialize a requests Session with retry mechanism 
    to handle transient network errors
    """
    session = requests.Session()
    # Configure retry strategy for HTTP/HTTPS requests
    session.mount('http://', HTTPAdapterHTTPAdapter(max_retries=3))
    session.mount('https://', HTTPAdapter(max_retries=3))
    return session

def main():
    # Initialize HTTP session with retry support
    session = init_session()
    
    # Path to the Excel file containing appid data
    excel_path = '../xxxxxxxxxx.xlsx'
    
    # Load Excel workbook and activate the default sheet
    workbook = openpyxl.load_workbook(excel_path)
    sheet = workbook.active
    
    # Proxy configuration (currently disabled)
    # proxies = {"http":"http://127.0.0.1:8080","https":"http://127.0.0.1:8080"}
    
    # API endpoint for fetching app ratings
    rating_url = "http://wxa.weixin.qq.com/mmsearchservicecommentery/service_commentery/get_appraise_list"
    
    # HTTP headers for the rating request (simulating iPhone device)
    headers = {
        "Host": "wxa.weixin.qq.com",
        "Connection": "close",
        "X-WX-ClientVersion": "0x18002e2c00",
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.46(0x18002e2c) NetType/WIFI Language/zh_CN",
        "Referer": "https://servicewechat.com/wxdb2453762cc14cf3/128/page-frame.html"
    }
    
    # Iterate through rows 2 to 502 (1-based index)
    for row in range(2, 99999):
        try:
            # Get appid from column B of current row
            appid = sheet[f'B{row}'].value
            
            # Skip processing if appid is empty
            if appid is None:
                continue
            
            print(f"Processing row {row} | Appid: {appid}")
            
            # Construct request payload with current appid
            # Note: session_id and session_key should be updated periodically
            payload = (
                "{\"service_id\":\"3804242475_100\",\"body_id\":\"3804242475\",\"busi_type\":100,"
                f"\"appid\":\"{appid}\",\"id\":\"\",\"is_first_page\":true,\"seq\":\"\",\"sort_type\":0,"
                "\"tag\":\"\",\"msg_id\":\"\",\"huodong_id\":\"\",\"open_scene\":1,\"service_ids\":\"\","
                "\"base_req\":{\"check_auth_status\":true,\"client_version\":\"103082241024\","
                "\"device\":1,\"model\":\"iPhone 12<iPhone13,2>\",\"system\":\"iOS 17.1.1\","
                "\"req_id\":\"1724567856649\",\"scene\":0,\"scenes\":\"1\","
                "\"session_id\":1724567856649,"
                "\"session_key\":\"xxxxxxxxxxxxxxxxxxxxxxx\","
                "\"wxapp_type\":0,\"wxapp_version\":\"3.13.7\",\"wxapp_version_number\":199943}}"
            )
            
            # Send POST request to get rating data
            response = session.post(
                url=rating_url,
                headers=headers,
                data=payload,
                timeout=5
                # proxies=proxies  # Uncomment to enable proxy
            )
            
            # Print raw response for debugging (UTF-8 encoded)
            print(f"Response: {response.text.encode('utf-8')}")
            
            # Extract average score using regex
            account_average_score = ""
            score_match = re.search(r'"account_average_score":"(.*?)"', response.text)
            if score_match:
                account_average_score = score_match.group(1)
            
            print(f"Average score: {account_average_score}")
            
            # Write score to column Q in current row
            sheet[f'Q{row}'] = account_average_score
            
            # Save changes and reload workbook to prevent data corruption
            workbook.save(excel_path)
            workbook = openpyxl.load_workbook(excel_path)
            sheet = workbook.active
            
            # Add delay to avoid overwhelming the API
            time.sleep(2)
            
        except Exception as e:
            # Save workbook before handling exception
            workbook.save(excel_path)
            print(f"Error processing row {row}: {str(e)}")
            # Continue to next row instead of exiting
            continue
    
    # Final save after all rows are processed
    workbook.save(excel_path)
    print("Processing completed. Excel file saved.")

if __name__ == "__main__":
    main()