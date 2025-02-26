from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load Excel file once at startup
excel_file = "updated_merged.xlsx"  # Change this to your actual file
df = pd.read_excel(excel_file)

# Ensure column names are stripped of extra spaces
df.columns = df.columns.str.strip()

# Define column names
LAT_COL = "Latitude"
LON_COL = "Longitude"
WATER_TABLE_COL = "WaterTableLevel"
DISTRICT_COL = "Distict"

# Function to find the closest latitude & longitude in the dataset
def find_nearest_water_table(lat, lon):
    if df.empty:
        return {"error": "Water table data not available."}

    # Calculate the Euclidean distance to find the closest row
    df["Distance"] = np.sqrt((df[LAT_COL] - lat) ** 2 + (df[LON_COL] - lon) ** 2)
    nearest_row = df.loc[df["Distance"].idxmin()]

    # Get the values safely
    result = {
        "latitude": nearest_row.get(LAT_COL, "Unknown"),
        "longitude": nearest_row.get(LON_COL, "Unknown"),
        "water_table_level": nearest_row.get(WATER_TABLE_COL, "Data Not Available"),
        "district": nearest_row.get(DISTRICT_COL, "Unknown District")
    }

    return result

# Route to render the main page
@app.route("/")
def index():
    return render_template("index.html")

# Route to handle map click and return water table data (supports both GET & POST)
@app.route("/get_water_table", methods=["GET", "POST"])
def get_water_table():
    if request.method == "POST":
        data = request.json
        lat = float(data.get("latitude", 0))
        lon = float(data.get("longitude", 0))
    else:  # Handle GET request
        lat = float(request.args.get("lat", 0))
        lon = float(request.args.get("lon", 0))

    # Get nearest water table data
    result = find_nearest_water_table(lat, lon)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
