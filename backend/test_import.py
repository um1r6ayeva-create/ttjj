import sys
import os
sys.path.append(os.getcwd())

try:
    from app.dependencies.auth import admin_or_commandant_required
    print("SUCCESS: Imported admin_or_commandant_required")
except ImportError as e:
    print(f"IMPORT ERROR: {e}")
except Exception as e:
    print(f"OTHER ERROR: {e}")
    import traceback
    traceback.print_exc()
