import os
import time
import sqlite3
import win32com.client as client

class WeChatAppIDExtractor:
    def __init__(self, db_name='wechat_miniprograms.db'):
        """Initialize the extractor with database connection"""
        self.shell = client.Dispatch('WScript.shell')
        self.db_name = db_name
        self._initialize_database()

    def _initialize_database(self):
        """Create database table if it doesn't exist"""
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        # Create table with proper schema
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS app (
            appid TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()
        conn.close()

    def _is_appid_exists(self, cursor, appid):
        """Check if appid already exists in database"""
        cursor.execute('SELECT 1 FROM app WHERE appid = ?', (appid,))
        return cursor.fetchone() is not None

    def extract_and_save_appids(self, path):
        """
        Extract appids from .lnk files in specified path,
        save to database, and delete processed files
        """
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        extracted_apps = []

        try:
            # Walk through all files in the directory
            for root, _, filenames in os.walk(path):
                for filename in filenames:
                    if filename.endswith('.lnk'):
                        file_path = os.path.join(root, filename)
                        app_name = os.path.splitext(filename)[0]  # Remove .lnk extension
                        
                        try:
                            # Extract arguments from shortcut
                            shortcut = self.shell.CreateShortCut(file_path)
                            args = shortcut.Arguments
                            
                            # Extract appid (assuming it starts at position 14)
                            appid = args[14:] if len(args) > 14 else None
                            
                            if appid:
                                # Check if appid already exists before inserting
                                if not self._is_appid_exists(cursor, appid):
                                    cursor.execute(
                                        'INSERT INTO app (appid, name) VALUES (?, ?)',
                                        (appid, app_name)
                                    )
                                    print(f"Added new app: {app_name} - {appid}")
                                    extracted_apps.append((app_name, appid))
                                else:
                                    # Update timestamp for existing app
                                    cursor.execute(
                                        'UPDATE app SET updated_at = CURRENT_TIMESTAMP WHERE appid = ?',
                                        (appid,)
                                    )
                            
                            # Delete processed shortcut file
                            os.remove(file_path)
                            
                        except Exception as e:
                            print(f"Error processing {file_path}: {str(e)}")

            # Commit all changes
            conn.commit()
            return extracted_apps
            
        except Exception as e:
            print(f"Error during extraction process: {str(e)}")
            conn.rollback()
            return []
            
        finally:
            # Ensure database connection is closed
            conn.close()

    def run_monitor(self, path, interval=39):
        """Continuously monitor directory for new shortcut files"""
        print(f"Starting to monitor directory: {path}")
        print(f"Check interval: {interval} seconds")
        try:
            while True:
                self.extract_and_save_appids(path)
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\nMonitoring stopped by user")
        except Exception as e:
            print(f"Monitoring stopped due to error: {str(e)}")

if __name__ == '__main__':
    # Configuration
    WATCH_DIRECTORY = r"PATH"
    CHECK_INTERVAL = 39  # Seconds
    
    # Create and run the extractor
    extractor = WeChatAppIDExtractor()
    extractor.run_monitor(WATCH_DIRECTORY, CHECK_INTERVAL)
