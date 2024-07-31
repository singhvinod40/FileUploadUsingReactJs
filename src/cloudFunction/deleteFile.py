import functions_framework
from google.cloud import storage
from flask import jsonify
import os
import base64
import logging

logging.basicConfig(level=logging.INFO)


@functions_framework.http
def hello_http(request):
    # Decode the base64-encoded credentials and set them
    base64_credentials = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if base64_credentials:
        try:
            credentials_json = base64.b64decode(base64_credentials).decode('utf-8')
            with open('/tmp/credentials.json', 'w') as f:
                f.write(credentials_json)
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/credentials.json'
        except (base64.binascii.Error, UnicodeDecodeError) as e:
            logging.error(f"Error decoding base64 credentials: {str(e)}")
            return jsonify({"error": "Invalid credentials format"}), 500

    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    if request.method == 'OPTIONS':
        # Handle preflight request
        return ('', 204, headers)

    try:
        request_json = request.get_json(silent=True)
        request_args = request.args

        if request_json and 'bucket_name' in request_json and 'file_name' in request_json:
            bucket_name = request_json['bucket_name']
            file_name = request_json['file_name']
        elif request_args and 'bucket_name' in request_args and 'file_name' in request_args:
            bucket_name = request_args['bucket_name']
            file_name = request_args['file_name']
        else:
            return jsonify({"error": "Missing parameters: 'bucket_name' and 'file_name' are required."}), 400, headers

        # Initialize Google Cloud Storage client
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_name)

        # Delete the file
        blob.delete()

        logging.info(f"File {file_name} in bucket {bucket_name} deleted.")
        return jsonify({"message": f"File {file_name} in bucket {bucket_name} deleted."}), 200, headers

    except Exception as e:
        logging.error(f"Error deleting file: {str(e)}")
        return jsonify({"error": f"Error deleting file: {str(e)}"}), 500, headers

functions-framework==3.*
google-cloud-storage


gcloud functions deploy deleteFileFunction --runtime python310 --trigger-http --allow-unauthenticated --region asia-south1