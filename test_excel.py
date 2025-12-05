import pandas as pd
import os

file_path = "step_data.xlsx.xlsx"
print(f"Checking file: {file_path}")

if os.path.exists(file_path):
    print("File exists.")
    try:
        xl = pd.ExcelFile(file_path)
        print(f"Sheet names: {xl.sheet_names}")
        
        # Try parsing the first sheet
        df = xl.parse(xl.sheet_names[0])
        print(f"First sheet columns: {df.columns.tolist()}")
        print("Successfully read Excel file.")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
else:
    print("File does not exist.")





