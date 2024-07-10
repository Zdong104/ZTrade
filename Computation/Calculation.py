from flask import Flask, request, jsonify
import json
import numpy as np

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    print(f"Received data: {data}")
    
    # Assuming you have a function run_model that takes the input data and returns the results
    results = run_model(data)
    
    return jsonify(results)

def run_model(data):
    # Get the basket length
    basket_length = len(data['basket'])
    
    # Generate random values with lengths matching the basket length
    meanReturns = np.random.random(basket_length).tolist()
    maxSharpeWeights = np.random.random(basket_length).tolist()
    ercWeights = np.random.random(basket_length).tolist()
    
    # Normalize weights so that they sum to 1
    maxSharpeWeights = (maxSharpeWeights / np.sum(maxSharpeWeights)).tolist()
    ercWeights = (ercWeights / np.sum(ercWeights)).tolist()
    
    results = {
        'meanReturns': meanReturns,
        'maxSharpeWeights': maxSharpeWeights,
        'ercWeights': ercWeights
    }
    
    return results

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)
