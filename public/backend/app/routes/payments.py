from flask import Blueprint, request, jsonify
import requests
import os

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create-bill', methods=['POST'])
def create_bill():
    try:
        data = request.get_json()
        
        # Billplz API configuration
        api_key = os.getenv('BILLPLZ_API_KEY')  # Store in environment variables
        collection_id = os.getenv('BILLPLZ_COLLECTION_ID')
        api_url = 'https://www.billplz-sandbox.com/api/v3/bills'

        # Prepare bill data
        bill_data = {
            'collection_id': collection_id,
            'email': f"{data['studentName']}@example.com",
            'mobile': '60123456789',
            'name': data['studentName'],
            'amount': int(float(data['amount']) * 100),  # Convert to cents
            'description': data['description'],
            'callback_url': data['callback_url'],
            'redirect_url': data['redirect_url']
        }

        # Create bill via Billplz API
        response = requests.post(
            api_url,
            json=bill_data,
            auth=(api_key, ''),
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()

        return jsonify({
            'bill_url': response.json()['url'],
            'status': 'success'
        }), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 400
