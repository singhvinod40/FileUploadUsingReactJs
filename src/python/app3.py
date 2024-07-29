from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/process-document', methods=['POST'])
def process_document():
    data = request.get_json()
    logger.info("Received request data: %s", data)

    file_url = data.get('fileUrl')
    logger.info("Extracted file URL: %s", file_url)

    if not file_url:
        logger.error("fileUrl not provided")
        return jsonify({"error": "fileUrl not provided"}), 400

    try:
        # Extract the file name from the URL
        file_name = file_url.split('/')[-1]
        logger.info("Extracted file name: %s", file_name)

        # Construct the file path
        base_path = os.path.join("C:\\Users", "vinod", "Downloads", "HackFestTestDoc")
        file_path = os.path.join(base_path, file_name)
        logger.info("Constructed file path: %s", file_path)

        if not os.path.exists(file_path):
            logger.error("File not found at path: %s", file_path)
            return jsonify({"error": f"File not found at path: {file_path}"}), 404

        # Run the `test2.py` script
        result = subprocess.run(['python', 'test2.py', file_path], capture_output=True, text=True)
        logger.info("Subprocess result: return code = %d, stdout = %s, stderr = %s",
                    result.returncode, result.stdout, result.stderr)

        if result.returncode != 0:
            logger.error("Subprocess failed with error: %s", result.stderr)
            return jsonify({"error": result.stderr}), 500

        # Load the JSON output from the script
        output = json.loads(result.stdout)
        logger.info("Script output: %s", output)

        response = {
            "text": output.get("text", ""),
            "entities": output.get("entities", []),
            "address": output.get("address", {})
        }
        logger.info("Response to be sent: %s", response)

        return jsonify(response), 200
    except Exception as e:
        logger.error("Exception occurred: %s", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/validate-address', methods=['POST'])
def validate_address():
    data = request.get_json()
    logger.info("Received request data: %s", data)

    address_str = data.get('address')
    api_key = data.get('apiKey')
    logger.info("Extracted address: %s", address_str)
    logger.info("Extracted API key: %s", api_key)

    if not address_str or not api_key:
        logger.error("address or apiKey not provided")
        return jsonify({"error": "address or apiKey not provided"}), 400

    try:
        # Run the `validateaddress.py` script
        result = subprocess.run(['python', 'validate_address.py', api_key, address_str], capture_output=True, text=True)
        logger.info("Subprocess result: return code = %d, stdout = %s, stderr = %s",
                    result.returncode, result.stdout, result.stderr)

        if result.returncode != 0:
            logger.error("Subprocess failed with error: %s", result.stderr)
            return jsonify({"error": result.stderr}), 500

        # Load the JSON output from the script
        output = result.stdout.strip()  # Removing any extraneous whitespace
        logger.info("Script output: %s", output)

        try:
            output_json = json.loads(output)
        except json.JSONDecodeError:
            logger.error("Failed to decode JSON output from the script")
            return jsonify({"error": "Failed to decode JSON output from the script"}), 500

        response = {
            "address": output_json.get("address", {}),
            "valid": output_json.get("valid", False)
        }
        logger.info("Response to be sent: %s", response)

        return jsonify(response), 200
    except Exception as e:
        logger.error("Exception occurred: %s", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
