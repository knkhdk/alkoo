import pandas as pd
import os

file_path = "step_data.xlsx.xlsx"
try:
    xl = pd.ExcelFile(file_path)
    if len(xl.sheet_names) > 1:
        df = xl.parse(xl.sheet_names[1])
        print(f"Second sheet ({xl.sheet_names[1]}) columns: {df.columns.tolist()}")
except Exception as e:
    print(e)





