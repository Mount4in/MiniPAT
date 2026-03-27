import requests
import re
import openpyxl
import time
import sys
from requests.adapters import HTTPAdapter

# Define the path to the target Excel file (contains appid data to be queried)
EXCEL_PATH = '../xxxxxxxxxxxxxx.xlsx'


def init_session():
    """
    Initialize a requests Session with retry mechanism to enhance request stability.
    Mounts HTTP/HTTPS adapters with max 3 retries for failed connections.
    """
    session = requests.Session()
    # Set retry strategy for HTTP requests
    session.mount('http://', HTTPAdapter(max_retries=3))
    # Set retry strategy for HTTPS requests
    session.mount('https://', HTTPAdapter(max_retries=3))
    return session


def load_excel(path):
    """
    Load the Excel workbook and get the active worksheet.
    
    Args:
        path (str): Full path to the Excel file
        
    Returns:
        tuple: (workbook object, active worksheet object)
    """
    workbook = openpyxl.load_workbook(path)
    sheet = workbook.active
    return workbook, sheet


def main():
    # Initialize session and load Excel file
    session = init_session()
    workbook, sheet = load_excel(EXCEL_PATH)
    
    # Proxy configuration (currently commented out in request, enable if needed)
    PROXIES = {"http": "http://127.0.0.1:8080", "https": "http://127.0.0.1:8080"}
    
    # Multiple sets of request parameters (different uin/key for WeChat verification)
    # Each set corresponds to a different account identity
    request_params = {
        "xxxxx": {
            "action": "get",
            "appid": "",  # Will be dynamically filled with appid from Excel
            "uin": "xxxxxx",
            "key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        }
    }

    # HTTP headers for WeChat Mini Program verification request
    headers = {
        "Host": "mp.weixin.qq.com",
        "Cookie": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "Cache-Control": "max-age=0",
        "X-Wechat-Key": request_params["chenzong"]["key"],  # Use "chenzong" account's key
        "X-Wechat-Uin": request_params["chenzong"]["uin"],  # Use "chenzong" account's uin
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6309092b) XWEB/9079 Flue",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Dest": "document",
        "Referer": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9"
    }

    # Target API URL for WeChat Mini Program verification info
    verify_url = "https://mp.weixin.qq.com/wxawap/waverifyinfo"
    

    for row in range(1, 9999999999999):
        try:
            # Get appid from column B of current row
            appid = sheet[f'B{row}'].value
            
            # Skip if appid is empty
            if not appid:
                print(f"Row {row}: Appid is empty, skipping...")
                continue
            
            print(f"Processing Row {row} | Appid: {appid}")
            
            # Update appid in the selected request parameters (using "vivo" parameters here)
            selected_params = request_params["vivo"]
            selected_params["appid"] = appid

            # Send GET request to get verification info (timeout: 5s, proxy disabled)
            response = session.get(
                url=verify_url,
                params=selected_params,
                headers=headers,
                timeout=5
                # proxies=PROXIES  # Uncomment if proxy is needed
            )
            response.raise_for_status()  # Raise exception for HTTP errors (4xx/5xx)

        except Exception as e:
            # Save Excel and exit if any error occurs during request
            workbook.save(EXCEL_PATH)
            print(f"Request failed for Row {row} | Error: {str(e)}")
            sys.exit(1)

        # Extract required data from response text using regex
        response_text = response.text
        app_info = {
            "name": "",
            "nickname": "",
            "customer_type_text": "",
            "category_list": "",
            "icp_beian_id": "",
            "app_update_time": "",
            "auth_3rd_list": "",
            "domain": ""  
        }

        # Extract data with regex (handle possible missing fields)
        try:
            # Official name of the Mini Program
            app_info["name"] = re.search(r'icp_beian_id.*?name: "(.*?)"', response_text, re.S).group(1)
            # Nickname of the Mini Program
            app_info["nickname"] = re.search(r'nickname: "(.*?)"', response_text).group(1)
            # Customer type description (e.g., individual/enterprise)
            app_info["customer_type_text"] = re.search(r'customer_type_text: "(.*?)"', response_text).group(1)
            # Service category list (optional, set empty if not found)
            category_match = re.search(r'cate":\["(.*?)"\]', response_text)
            if category_match:
                app_info["category_list"] = category_match.group(1)
            # ICP registration ID
            app_info["icp_beian_id"] = re.search(r'icp_beian_id: "(.*?)"', response_text).group(1)
            # Last update timestamp (Unix time)
            app_info["app_update_time"] = re.search(r'app_update_time: "(.*?)"', response_text).group(1)
            # Third-party authorization list
            app_info["auth_3rd_list"] = re.search(r'auth_3rd_list: \[(.*?)\]', response_text, re.S).group(1)
            # Domain information (added back)
            app_info["domain"] = re.search(r'request_domain:\{item:\[(.*?)\]\},wxa_', response_text, re.S).group(1)


        except Exception as e:
            # Save Excel and exit if data extraction fails
            workbook.save(EXCEL_PATH)
            print(f"Data extraction failed for Row {row} | Error: {str(e)}")
            sys.exit(1)

        # Convert Unix timestamp to human-readable date (YYYY-MM-DD)
        try:
            if app_info["app_update_time"].isdigit():
                timestamp = int(app_info["app_update_time"])
                time_struct = time.localtime(timestamp)
                app_info["app_update_time"] = time.strftime("%Y-%m-%d", time_struct)
        except Exception as e:
            workbook.save(EXCEL_PATH)
            print(f"Timestamp conversion failed for Row {row} | Error: {str(e)}")
            sys.exit(1)

        # Print extracted info for verification
        print(f"Extracted Info - Name: {app_info['name']}")
        print(f"Extracted Info - Nickname: {app_info['nickname']}")
        print(f"Extracted Info - Customer Type: {app_info['customer_type_text']}")
        print(f"Extracted Info - Category List: {app_info['category_list']}")
        print(f"Extracted Info - ICP ID: {app_info['icp_beian_id']}")
        print(f"Extracted Info - Update Time: {app_info['app_update_time']}")
        print(f"Extracted Info - 3rd Auth List: {app_info['auth_3rd_list'].strip()}")
        print(f"Extracted Info - Domain: {app_info['domain']}\n")  # Print domain info

        # Write extracted data to corresponding columns in Excel
        sheet[f'K{row}'] = app_info["name"]          # Column K: Official Name
        sheet[f'C{row}'] = app_info["nickname"]      # Column C: Nickname
        sheet[f'L{row}'] = app_info["customer_type_text"]  # Column L: Customer Type
        sheet[f'M{row}'] = app_info["category_list"] # Column M: Category List
        sheet[f'N{row}'] = app_info["icp_beian_id"]  # Column N: ICP ID
        sheet[f'O{row}'] = app_info["app_update_time"] # Column O: Update Time
        sheet[f'P{row}'] = app_info["auth_3rd_list"].strip() # Column P: 3rd Auth List
        sheet[f'Q{row}'] = app_info["domain"]        # Column Q: Domain (added)

        # Save Excel after updating current row
        workbook.save(EXCEL_PATH)
        # Reload workbook to avoid data inconsistency in next iteration
        workbook, sheet = load_excel(EXCEL_PATH)

        # Add delay to avoid overwhelming the API (7s per request)
        time.sleep(xxxxxxxxxx)

    # Final save after all rows are processed
    workbook.save(EXCEL_PATH)
    print("All rows processed successfully! Excel file saved.")


if __name__ == "__main__":
    main()
