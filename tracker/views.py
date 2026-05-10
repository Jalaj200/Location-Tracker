import phonenumbers
from phonenumbers import geocoder, carrier, timezone
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

def index(request):
    return render(request, 'tracker/index.html')

@api_view(['POST'])
def track_number(request):
    phone_number_str = request.data.get('phone_number', '')
    if not phone_number_str:
        return Response({'success': False, 'error': 'Phone number is required.'}, status=400)

    try:
        # We parse the number. If no region is given, the number must start with +
        parsed_number = phonenumbers.parse(phone_number_str, None)
        
        if not phonenumbers.is_valid_number(parsed_number):
            return Response({'success': False, 'error': 'Invalid phone number.'}, status=400)
            
        location = geocoder.description_for_number(parsed_number, 'en')
        carrier_info = carrier.name_for_number(parsed_number, 'en')
        time_zones = timezone.time_zones_for_number(parsed_number)
        
        # Format the number perfectly
        formatted_number = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
        
        return Response({
            'success': True,
            'data': {
                'number': formatted_number,
                'location': location or 'Unknown Location',
                'carrier': carrier_info or 'Unknown Carrier',
                'time_zones': ", ".join(time_zones) if time_zones else 'Unknown Valid Timezone',
                'valid': True
            }
        })
        
    except phonenumbers.phonenumberutil.NumberParseException as e:
        return Response({'success': False, 'error': str(e)}, status=400)
    except Exception as e:
        return Response({'success': False, 'error': 'Something went wrong processing the number.'}, status=500)
