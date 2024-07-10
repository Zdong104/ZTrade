import logging

# Set up logging
logging.basicConfig(level=logging.INFO)


from flask import Flask, jsonify, request
from apscheduler.schedulers.background import BackgroundScheduler
import pandas as pd
import numpy as np
from datetime import datetime
import time

app = Flask(__name__)

# Assume YahooDownloader and symbols are defined elsewhere
from finrl.meta.preprocessor.yahoodownloader import YahooDownloader
from finrl.meta.preprocessor.preprocessors import FeatureEngineer, data_split
from finrl.config import INDICATORS
import pandas as pd
import numpy as np
from datetime import datetime
import itertools
from pypfopt import risk_models, expected_returns, EfficientFrontier


symbols = [
    "aapl", "amd", "amzn", "axp", "ba", "cat", "csco", "cvx", "dis", "dow", "f", "goog", "gs", "hd", 
    "hon", "ibm", "intc", "jnj", "jpm", "ko", "mcd", "meta", "mmm", "mrk", "msft", "nflx", "nke", 
    "nvda", "pg", "trv", "tsla", "unh", "v"
]

START_DATE = '2012-05-18'
DATA_FILE_RAW = 'stock_data.csv'
DATA_FILE = 'Processed_Stock_Data.csv'


# Function to fetch and update data
class DailyUpdateData:
    def __init__(self, start_date, data_file_raw, data_file):
        self.start_date = start_date
        self.end_date = datetime.today().strftime('%Y-%m-%d')
        self.data_file_raw = data_file_raw
        self.data_file = data_file

    def fetch_and_update_data(self):
        print("Today's date:", self.end_date)

        try:
            existing_data = pd.read_csv(self.data_file_raw)
        except FileNotFoundError:
            existing_data = pd.DataFrame()

        # Convert string dates to datetime objects
        start_date = datetime.strptime(self.start_date, '%Y-%m-%d')
        end_date = datetime.strptime(self.end_date, '%Y-%m-%d')

        # Fetch new data
        new_data = YahooDownloader(start_date=start_date, end_date=end_date, ticker_list=symbols).fetch_data()

        # Check for overlaps
        if not existing_data.empty:
            last_date = existing_data['date'].max()
            new_data = new_data[new_data['date'] > last_date]

        print('Existing data:\n', existing_data)

        if not new_data.empty:
            updated_data = pd.concat([existing_data, new_data])
            updated_data.to_csv(self.data_file_raw, index=False)
            print(f"Updated data up to {new_data['date'].max()}")

    def data_processing(self, data):
        fe = FeatureEngineer(use_technical_indicator=True,
                             tech_indicator_list=INDICATORS,
                             use_vix=True,
                             use_turbulence=True,
                             user_defined_feature=False)

        processed = fe.preprocess_data(data)

        list_ticker = processed["tic"].unique().tolist()
        list_date = list(pd.date_range(processed['date'].min(), processed['date'].max()).astype(str))
        combination = list(itertools.product(list_date, list_ticker))

        processed_full = pd.DataFrame(combination, columns=["date", "tic"]).merge(processed, on=["date", "tic"], how="left")
        processed_full = processed_full[processed_full['date'].isin(processed['date'])]
        processed_full = processed_full.sort_values(['date', 'tic'])

        processed_full = processed_full.fillna(0)

        with open(self.data_file, 'w', encoding='utf-8-sig') as f:
            processed_full.to_csv(f)

    def update_and_process_data(self):
        self.fetch_and_update_data()
        existing_data = pd.read_csv(self.data_file_raw)
        self.data_processing(existing_data)

    

    
class PortfolioModel:
    def __init__(self, input_data):
        self.basket = input_data['basket']
        self.totalAmount = input_data['totalAmount']
        self.validate_tickers()

    def validate_tickers(self):
        invalid_tickers = [ticker for ticker in self.basket if ticker not in symbols]
        if invalid_tickers:
            raise ValueError(f"Invalid ticker symbols: {', '.join(invalid_tickers)}")

    # Function to get the stock data from the database based on the user request
    def get_stock_data(self):
        raw_data = pd.read_csv(DATA_FILE)
        data = raw_data[(raw_data['tic'].isin(self.basket))]
        data = data.set_index(data.columns[0])
        data.index.names = ['']
        return data

    def process_df_for_mvo(self, df, stock_dimension):
        df = df.sort_values(['date', 'tic'], ignore_index=True)[['date', 'tic', 'close']]
        fst = df.iloc[0:stock_dimension, :]
        tic = fst['tic'].tolist()

        mvo = pd.DataFrame()

        for k in range(len(tic)):
            mvo[tic[k]] = 0

        for i in range(df.shape[0] // stock_dimension):
            n = df.iloc[i * stock_dimension:(i + 1) * stock_dimension, :]
            date = n['date'].iloc[0]
            mvo.loc[date] = n['close'].tolist()
        return mvo

    def results_calculation(self, raw_data, stock_dimension):
        data = self.process_df_for_mvo(raw_data, stock_dimension)

        # Calculate expected returns and sample covariance
        mu = expected_returns.mean_historical_return(data)
        S = risk_models.sample_cov(data)

        # Optimize for maximal Sharpe ratio
        ef = EfficientFrontier(mu, S, weight_bounds=(0, 1))  # Set the single asset can be 100% of the portfolio, but we cannot buy short.
        raw_weights = ef.max_sharpe()
        cleaned_weights = ef.clean_weights()
        mvo_weights = np.array([self.totalAmount * cleaned_weights[ticker] for ticker in cleaned_weights]).tolist()  # weight * the total amount of money for each stock
        report = ef.portfolio_performance(verbose=True)

        results = {
            'meanReturns': [f"{x * 100:.2f}%" for x in mu],
            'Allocated Weights': [f"{x:.2f}" for x in mvo_weights],
            'Expected annual return:': f"{report[0] * 100:.2f}%",
            'Annual volatility:': f"{report[1] * 100:.2f}%",
            'Sharpe Ratio:': f"{report[2]:.2f}"
        }

        return results

    def run_model(self):
        raw_data = self.get_stock_data()
        stock_dimension = len(raw_data.tic.unique())
        print(f"Number of Stocks = {stock_dimension}")
        results = self.results_calculation(raw_data, stock_dimension)
        return results


# Function to run the update and process daily
def run_daily_update():
    logging.info("Running daily update...")
    daily_update = DailyUpdateData(START_DATE, DATA_FILE_RAW, DATA_FILE)
    daily_update.update_and_process_data()
    logging.info("Daily update completed.")

## Auto Update data daily
scheduler = BackgroundScheduler()
scheduler.add_job(func=run_daily_update, trigger="interval", hours=12) ## will not trigered in the begining, will triger after the first 24 hours
scheduler.start()
logging.info("Scheduler started...")

@app.route('/')
def home():
    return "Stock data updater is running"

@app.route('/run_model', methods=['POST'])
def run_model_endpoint():
    input_data = request.json
    if not input_data or 'basket' not in input_data:
        return jsonify({"error": "Invalid input data"}), 400
    
    try:
        model = PortfolioModel(input_data)
        results = model.run_model()
        return jsonify(results)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "An error occurred: " + str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)