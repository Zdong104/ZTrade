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


symbols_dict = {
    "600028.SS": "中国石化",
    "600030.SS": "中信证券",
    "600031.SS": "三一重工",
    "600036.SS": "招商银行",
    "600048.SS": "保利发展",
    "600050.SS": "中国联通",
    "600089.SS": "特变电工",
    "600104.SS": "上汽集团",
    "600150.SS": "中国船舶",
    "600276.SS": "恒瑞医药",
    "600309.SS": "万华化学",
    "600406.SS": "国电南瑞",
    "600436.SS": "片仔癀",
    "600438.SS": "通威股份",
    "600487.SS": "山西汾酒",
    "600690.SS": "海尔智家",
    "600809.SS": "山西汾酒",
    "600887.SS": "伊利股份",
    "600900.SS": "长江电力",
    "600941.SS": "中国移动",
    "601012.SS": "隆基绿能",
    "601088.SS": "中国神华",
    "601166.SS": "兴业银行",
    "601225.SS": "陕西煤业",
    "601288.SS": "农业银行",
    "601318.SS": "中国平安",
    "601328.SS": "交通银行",
    "601390.SS": "中国中铁",
    "601398.SS": "工商银行",
    "601601.SS": "中国太保",
    "601628.SS": "中国人寿",
    "601633.SS": "长城汽车",
    "601658.SS": "邮储银行",
    "601668.SS": "中国建筑",
    "601669.SS": "中国电建",
    "601857.SS": "中国石油",
    "601888.SS": "中国中免",
    "601899.SS": "紫金矿业",
    "601919.SS": "中远海控",
    "601985.SS": "中国核电",
    "601988.SS": "中国银行",
    "603259.SS": "药明康德",
    "603288.SS": "海天味业",
    "603501.SS": "韦尔股份",
    "603986.SS": "兆易创新",
    "688012.SS": "中微公司",
    "688041.SS": "海光信息",
    "688111.SS": "金山办公",
    "688981.SS": "中芯国际"
}

symbols_Chinese = list(symbols_dict.keys())



START_DATE = '2016-05-18'
DATA_FILE_RAW_Chinese = 'stock_data_Chinese.csv'
DATA_FILE_Chinese = 'Processed_Stock_Data_Chinese.csv'


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
        new_data = YahooDownloader(start_date=start_date, end_date=end_date, ticker_list=symbols_Chinese).fetch_data()

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
        invalid_tickers = [ticker for ticker in self.basket if ticker not in symbols_Chinese]
        if invalid_tickers:
            raise ValueError(f"Invalid ticker symbols: {', '.join(invalid_tickers)}")

    # Function to get the stock data from the database based on the user request
    def get_stock_data(self):
        raw_data = pd.read_csv(DATA_FILE_Chinese)
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
            'Allocated_Weights': [f"{x:.2f}" for x in mvo_weights],
            'Expected_annual_return:': f"{report[0] * 100:.2f}%",
            'Annual_volatility:': f"{report[1] * 100:.2f}%",
            'Sharpe_Ratio:': f"{report[2]:.2f}"
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
    daily_update = DailyUpdateData(START_DATE, DATA_FILE_RAW_Chinese, DATA_FILE_Chinese)
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

@app.route('/process', methods=['POST'])
def run_model_endpoint():
    input_data = request.json
    print(input_data)
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