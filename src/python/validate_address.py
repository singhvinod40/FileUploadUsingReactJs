import requests
import sys
import re
import json


def infer_country(state, postal_code):
    state_to_country = {
        'VIC': 'AU', 'NSW': 'AU', 'QLD': 'AU', 'SA': 'AU', 'WA': 'AU', 'TAS': 'AU', 'ACT': 'AU', 'NT': 'AU',
        'Taipei City': 'TW', 'New Taipei City': 'TW', 'Taichung City': 'TW', 'Tainan City': 'TW',
        'Kaohsiung City': 'TW',
        'MH': 'IN', 'DL': 'IN', 'KA': 'IN', 'TN': 'IN', 'UP': 'IN', 'GJ': 'IN', 'WB': 'IN', 'RJ': 'IN',
        'NCR': 'PH', 'CAR': 'PH', 'Region I': 'PH', 'Region II': 'PH', 'Region III': 'PH', 'Region IV-A': 'PH'
    }

    if state in state_to_country:
        return state_to_country[state]

    if re.match(r'^\d{4}$', postal_code) and postal_code.startswith(('1', '2', '3', '4', '5', '6')):
        return 'AU'

    if re.match(r'^\d{3}$', postal_code) and postal_code.startswith(('1', '2')):
        return 'PH'

    return 'US'


def parse_address(address_str):
    postal_code_pattern = re.compile(r'\b\d{3,6}\b')
    country_pattern = re.compile(
        r'\b(?:Australia|Taiwan|Philippines|India|United States|Singapore|United Arab Emirates|Saudi Arabia|Qatar|Oman)\b',
        re.IGNORECASE)

    parts = [part.strip() for part in address_str.split(',')]

    if len(parts) < 3:
        raise ValueError("Address string must contain at least Address, Town, State, and Postal Code.")

    postal_code = None
    country = None
    state = None

    for part in parts:
        if postal_code_pattern.search(part):
            postal_code = postal_code_pattern.search(part).group()
        if country_pattern.search(part):
            country = country_pattern.search(part).group().title()
        if re.match(r'^[A-Za-z\s]{2,}$', part) and not country_pattern.search(part):
            state = part

    street_address = parts[0].strip()
    town = parts[1].strip() if len(parts) > 1 else "N/A"
    state = state if state else (parts[2].strip() if len(parts) > 2 else "N/A")

    if not country:
        country = infer_country(state, postal_code)

    return {
        "Name": "N/A",
        "Address": street_address,
        "Dept": "N/A",
        "Flr": "N/A",
        "Room": "N/A",
        "BldgNb": street_address.split()[0] if street_address.split() else "N/A",
        "StrtNm": ' '.join(street_address.split()[1:]) if street_address.split() else "N/A",
        "TwnNm": town,
        "CtrySubDvsn": state,
        "PstCd": postal_code,
        "Ctry": country,
        "PstBx": "N/A"
    }


def validate_address(api_key, address):
    url = f"https://addressvalidation.googleapis.com/v1:validateAddress?key={api_key}"

    payload = {
        "address": {
            "addressLines": [address["Address"]],
            "locality": address["TwnNm"],
            "administrativeArea": address["CtrySubDvsn"],
            "postalCode": address["PstCd"],
            "regionCode": address["Ctry"]
        },
        "enableUspsCass": False
    }

    response = requests.post(url, json=payload)

    result = {
        "address": address,
        "response_body": response.text,
        "valid": False,
        "inconsistencies": []
    }

    if response.status_code != 200:
        result["error"] = f"Failed to validate address. HTTP Error {response.status_code}."
        return result

    response_json = response.json()

    if 'error' in response_json:
        result["error"] = response_json['error']['message']
        return result

    validated_address = response_json.get("result", {}).get("geocode", {}).get("addressComponents", [])
    inconsistencies = []
    valid = True

    for component in validated_address:
        if component["componentType"] == "route" and component["longText"] != address["StrtNm"]:
            inconsistencies.append("Street Name")
            valid = False
        if component["componentType"] == "locality" and component["longText"] != address["TwnNm"]:
            inconsistencies.append("Town Name")
            valid = False
        if component["componentType"] == "administrative_area_level_1" and component["shortText"] != address[
            "CtrySubDvsn"]:
            inconsistencies.append("Country Subdivision")
            valid = False
        if component["componentType"] == "postal_code" and component["longText"] != address["PstCd"]:
            inconsistencies.append("Postal Code")
            valid = False
        if component["componentType"] == "country" and component["shortText"] != address["Ctry"]:
            inconsistencies.append("Country")
            valid = False

    result["valid"] = valid
    result["inconsistencies"] = inconsistencies

    return result


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python3 validate_address.py <API_KEY> <ADDRESS_STRING>"}))
        sys.exit(1)

    api_key = sys.argv[1]
    address_str = sys.argv[2]

    try:
        address = parse_address(address_str)
        result = validate_address(api_key, address)
        print(json.dumps(result, indent=2))
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
