import uiautomator2 as u2
import time
import sys

# --------------------------
# Configuration (Easy to Modify)
# --------------------------
DEVICE_SERIAL = "PBV7N16607006967"  # Target device serial number
KEYWORD_FILE_PATH = "keyword.txt"   # Path to keyword file
TIKTOK_APP_TEXT = "**"            # App name for TIKTOK 
MINIPROGRAM_ENTRY_TEXT = "小程序"    # Text for Mini Program entry in TIKTOK
SEARCH_BOX_TEXT = "搜索小程序名称"   # Text for Mini Program search box
SEARCH_BUTTON_TEXT = "搜索"          # Text for search confirmation button
CLEAR_BUTTON_DESC = "清除"           # Content description for clear search button
CLOSE_BUTTON_DESC = "关闭"           # Content description for close button
RECENT_APPS_RESOURCE_ID = "com.android.systemui:id/recent_apps"  # Recent apps button
CLEAR_ALL_RECENT_RESOURCE_ID = "com.android.systemui:id/recent_igmbutton_clear_all"  # Clear all recent apps
SIDE_BAR_DESC = "侧边栏"             # Content description for TIKTOK sidebar
LATER_TEXT = "以后再说"              # Text for "Remind Later" prompt

# --------------------------
# Initialize Device Connection
# --------------------------
try:
    # Connect to the target Android device
    d = u2.connect(DEVICE_SERIAL)
    print(f"[INFO] Successfully connected to device: {DEVICE_SERIAL}")
except Exception as e:
    print(f"[ERROR] Failed to connect to device: {str(e)}")
    sys.exit(1)


def load_keywords(file_path: str) -> list[str]:
    """
    Load search keywords from text file, filtering empty lines.
    
    Args:
        file_path: Path to the keyword text file
    
    Returns:
        List of non-empty keywords (stripped of whitespace)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Filter out empty lines and strip whitespace from each keyword
            keywords = [line.strip() for line in f if line.strip()]
        print(f"[INFO] Loaded {len(keywords)} valid keywords from {file_path}")
        return keywords
    except FileNotFoundError:
        print(f"[ERROR] Keyword file not found: {file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Failed to load keywords: {str(e)}")
        sys.exit(1)


def restart_TIKTOK_miniprogram_env() -> bool:
    """
    Restart TIKTOK and navigate to Mini Program entry to reset the environment.
    Handles USB connection prompts and initial TIKTOK setup.
    
    Returns:
        True if environment reset succeeds, False otherwise
    """
    try:
        # Step 1: Return to home screen
        d.press("home")
        time.sleep(1)
        print("[INFO] Returned to home screen")

        # Step 2: Clear all recent apps to avoid background interference
        if d(resourceId=RECENT_APPS_RESOURCE_ID).wait(timeout=2):
            d(resourceId=RECENT_APPS_RESOURCE_ID).click()
            time.sleep(1)
            if d(resourceId=CLEAR_ALL_RECENT_RESOURCE_ID).wait(timeout=2):
                d(resourceId=CLEAR_ALL_RESOURCE_ID).click()
                print("[INFO] Cleared all recent apps")
            else:
                print("[WARNING] Clear all recent apps button not found")
        else:
            print("[WARNING] Recent apps button not found")
        time.sleep(1)

        # Step 3: Launch TIKTOK app
        if d(text=TIKTOK_APP_TEXT).wait(timeout=3):
            d(text=TIKTOK_APP_TEXT).click()
            print(f"[INFO] Launched {TIKTOK_APP_TEXT} app")
        else:
            print(f"[ERROR] {TIKTOK_APP_TEXT} app icon not found on home screen")
            return False
        time.sleep(1.5)


        # Step 4: Handle TIKTOK's "Remind Later" prompt (if appears)
        if d(text=LATER_TEXT).wait(timeout=1):
            d(text=LATER_TEXT).click()
            print(f"[INFO] Handled TIKTOK prompt: {LATER_TEXT}")
        time.sleep(1.5)

        # Step 4: Open TIKTOK sidebar (to access Mini Program entry)
        if d(description=SIDE_BAR_DESC).wait(timeout=3):
            d(description=SIDE_BAR_DESC).click()
            print(f"[INFO] Opened TIKTOK sidebar ({SIDE_BAR_DESC})")
        else:
            print(f"[ERROR] TIKTOK sidebar ({SIDE_BAR_DESC}) not found")
            return False
        time.sleep(1)

        # Step 6: Navigate to Mini Program entry
        if d(text=MINIPROGRAM_ENTRY_TEXT).wait(timeout=3):
            d(text=MINIPROGRAM_ENTRY_TEXT).click()
            print(f"[INFO] Entered {MINIPROGRAM_ENTRY_TEXT} section")
        else:
            print(f"[ERROR] {MINIPROGRAM_ENTRY_TEXT} entry not found in sidebar")
            return False
        time.sleep(1)

        # Step 7: Focus on search box
        if d(text=SEARCH_BOX_TEXT).wait(timeout=3):
            d(text=SEARCH_BOX_TEXT).click()
            print(f"[INFO] Focused on search box ({SEARCH_BOX_TEXT})")
        else:
            print(f"[ERROR] Search box ({SEARCH_BOX_TEXT}) not found")
            return False

        return True

    except Exception as e:
        print(f"[ERROR] Failed to restart TIKTOK environment: {str(e)}")
        return False


def search_and_open_miniprogram(keyword: str) -> bool:
    """
    Search for a Mini Program by keyword and open the first result (if exists).
    
    Args:
        keyword: Search keyword for the target Mini Program
    
    Returns:
        True if Mini Program is found and opened, False otherwise
    """
    try:
        print(f"\n[INFO] Starting search for keyword: {keyword}")

        # Step 1: Check if search box is available (reconnect if not)
        if not d(text=SEARCH_BOX_TEXT).wait(timeout=1):
            print(f"[WARNING] Search box lost, resetting environment...")
            if not restart_TIKTOK_miniprogram_env():
                print(f"[ERROR] Failed to reset environment for keyword: {keyword}")
                return False

        # Step 2: Input keyword into search box
        d(text=SEARCH_BOX_TEXT).set_text(keyword)
        print(f"[INFO] Entered keyword into search box: {keyword}")
        time.sleep(0.5)

        # Step 3: Confirm search
        if d(text=SEARCH_BUTTON_TEXT).wait(timeout=2):
            d(text=SEARCH_BUTTON_TEXT).click()
            print(f"[INFO] Confirmed search ({SEARCH_BUTTON_TEXT})")
        else:
            print(f"[ERROR] Search button ({SEARCH_BUTTON_TEXT}) not found")
            return False

        # Wait for search results to load (adjust sleep time based on network speed)
        time.sleep(6)

        # Step 4: Locate Mini Program results (using common TIKTOK Mini Program resource ID)
        result_xpath = '//*[@resource-id="com.ss.android.ugc.aweme:id/nrc"]'
        results = d.xpath(result_xpath).all()

        if len(results) == 0:
            print(f"[INFO] No Mini Program results found for keyword: {keyword}")
            # Clear search box for next query
            if d(description=CLEAR_BUTTON_DESC).wait(timeout=1):
                d(description=CLEAR_BUTTON_DESC).click()
                print(f"[INFO] Cleared search box for next query")
            return False

        # Step 5: Open the first search result
        print(f"[INFO] Found {len(results)} Mini Program result(s), opening the first one")
        results[0].click()
        time.sleep(10)  # Wait for Mini Program to load completely
        print(f"[SUCCESS] Opened Mini Program for keyword: {keyword}")

        # Step 6: Close current Mini Program (prepare for next search)
        if d(description=CLOSE_BUTTON_DESC).wait(timeout=3):
            d(description=CLOSE_BUTTON_DESC).click()
            print(f"[INFO] Closed current Mini Program ({CLOSE_BUTTON_DESC})")
        else:
            print(f"[WARNING] Close button ({CLOSE_BUTTON_DESC}) not found, resetting environment")
            restart_TIKTOK_miniprogram_env()

        # Step 7: Clear search box for next keyword
        if d(description=CLEAR_BUTTON_DESC).wait(timeout=2):
            d(description=CLEAR_BUTTON_DESC).click()
            print(f"[INFO] Cleared search box for next keyword")

        return True

    except Exception as e:
        print(f"[ERROR] Error processing keyword '{keyword}': {str(e)}")
        # Reset environment on error to avoid cascading failures
        restart_TIKTOK_miniprogram_env()
        return False


# --------------------------
# Main Execution Flow
# --------------------------
if __name__ == "__main__":
    # Load keywords from file
    keywords = load_keywords(KEYWORD_FILE_PATH)
    if not keywords:
        print("[ERROR] No valid keywords to process, exiting")
        sys.exit(1)

    # Initialize TIKTOK Mini Program environment
    if not restart_TIKTOK_miniprogram_env():
        print("[ERROR] Failed to initialize TIKTOK environment, exiting")
        sys.exit(1)

    # Process each keyword sequentially
    print(f"\n[INFO] Starting to process {len(keywords)} keywords...")
    for idx, keyword in enumerate(keywords, 1):
        print(f"\n[INFO] Processing keyword {idx}/{len(keywords)}: {keyword}")
        search_and_open_miniprogram(keyword)

    # Final cleanup
    d.press("home")
    print("\n[INFO] All keywords processed, exited to home screen")
    sys.exit(0)