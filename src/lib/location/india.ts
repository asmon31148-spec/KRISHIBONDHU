/**
 * Comprehensive Indian States & Districts Dataset with Agro-Climatic Intelligence
 * Supports 1-Tap Browser GPS Reverse Geocoding & Pan-India District Selection
 */

export interface DistrictInfo {
  name: string;
  nameBn?: string;
  nameHi?: string;
  lat: number;
  lon: number;
  agroZone?: 'alluvial_gangetic' | 'red_laterite' | 'coastal_saline' | 'terai_dooars' | 'hill' | 'barind';
}

export const WEST_BENGAL_DISTRICTS: DistrictInfo[] = [
  { name: 'Purba Bardhaman', nameBn: 'পূর্ব বর্ধমান', nameHi: 'पूर्व बर्धमान', lat: 23.2324, lon: 87.8615, agroZone: 'alluvial_gangetic' },
  { name: 'Paschim Bardhaman', nameBn: 'পশ্চিম বর্ধমান', nameHi: 'पश्चिम बर्धमान', lat: 23.6889, lon: 86.9661, agroZone: 'red_laterite' },
  { name: 'Hooghly', nameBn: 'হুগলি', nameHi: 'हुगली', lat: 22.9031, lon: 88.3968, agroZone: 'alluvial_gangetic' },
  { name: 'Nadia', nameBn: 'নদিয়া', nameHi: 'नदिया', lat: 23.4013, lon: 88.4965, agroZone: 'alluvial_gangetic' },
  { name: 'Murshidabad', nameBn: 'মুর্শিদাবাদ', nameHi: 'मुर्शिदाबाद', lat: 24.1037, lon: 88.2536, agroZone: 'alluvial_gangetic' },
  { name: 'South 24 Parganas', nameBn: 'দক্ষিণ ২৪ পরগণা', nameHi: 'दक्षिण 24 परगना', lat: 22.1896, lon: 88.1925, agroZone: 'coastal_saline' },
  { name: 'North 24 Parganas', nameBn: 'উত্তর ২৪ পরগণা', nameHi: 'उत्तर 24 परगना', lat: 22.7231, lon: 88.4815, agroZone: 'alluvial_gangetic' },
  { name: 'Bankura', nameBn: 'বাঁকুড়া', nameHi: 'बांकुड़ा', lat: 23.2313, lon: 87.0784, agroZone: 'red_laterite' },
  { name: 'Purulia', nameBn: 'পুরুলিয়া', nameHi: 'पुरुलिया', lat: 23.3322, lon: 86.3652, agroZone: 'red_laterite' },
  { name: 'Birbhum', nameBn: 'বীরভূম', nameHi: 'बीरभूम', lat: 23.9056, lon: 87.5246, agroZone: 'red_laterite' },
  { name: 'Purba Medinipur', nameBn: 'পূর্ব মেদিনীপুর', nameHi: 'पूर्व मेदिनीपुर', lat: 22.2985, lon: 87.9254, agroZone: 'coastal_saline' },
  { name: 'Paschim Medinipur', nameBn: 'পশ্চিম মেদিনীপুর', nameHi: 'पश्चिम मेदिनीपुर', lat: 22.4257, lon: 87.3199, agroZone: 'red_laterite' },
  { name: 'Jhargram', nameBn: 'ঝাড়গ্রাম', nameHi: 'झाड़ग्राम', lat: 22.4533, lon: 86.9856, agroZone: 'red_laterite' },
  { name: 'Howrah', nameBn: 'হাওড়া', nameHi: 'हावड़ा', lat: 22.4735, lon: 88.1098, agroZone: 'alluvial_gangetic' },
  { name: 'Kolkata', nameBn: 'কলকাতা', nameHi: 'कोलकाता', lat: 22.5726, lon: 88.3639, agroZone: 'alluvial_gangetic' },
  { name: 'Malda', nameBn: 'মালদা', nameHi: 'मालदा', lat: 25.0108, lon: 88.1411, agroZone: 'barind' },
  { name: 'Uttar Dinajpur', nameBn: 'উত্তর দিনাজপুর', nameHi: 'उत्तर दिनाजपुर', lat: 25.6197, lon: 88.1257, agroZone: 'terai_dooars' },
  { name: 'Dakshin Dinajpur', nameBn: 'দক্ষিণ দিনাজপুর', nameHi: 'दक्षिण दिनाजपुर', lat: 25.2217, lon: 88.7667, agroZone: 'barind' },
  { name: 'Jalpaiguri', nameBn: 'জলপাইগুড়ি', nameHi: 'जलपाईगुड़ी', lat: 26.5414, lon: 88.7196, agroZone: 'terai_dooars' },
  { name: 'Alipurduar', nameBn: 'আলিপুরদুয়ার', nameHi: 'अलीपुरद्वार', lat: 26.4919, lon: 89.5271, agroZone: 'terai_dooars' },
  { name: 'Cooch Behar', nameBn: 'কোচবিহার', nameHi: 'कूचबिहार', lat: 26.3452, lon: 89.4482, agroZone: 'terai_dooars' },
  { name: 'Darjeeling', nameBn: 'দার্জিলিং', nameHi: 'दार्जिलिंग', lat: 27.0410, lon: 88.2663, agroZone: 'hill' },
  { name: 'Kalimpong', nameBn: 'কালিম্পং', nameHi: 'कालिम्पोंग', lat: 27.0667, lon: 88.4667, agroZone: 'hill' },
];

export const INDIAN_STATES: string[] = [
  'West Bengal',
  'Bihar',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Tripura',
  'Meghalaya',
];

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  'West Bengal': WEST_BENGAL_DISTRICTS.map((d) => d.name),
  Bihar: [
    'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Samastipur',
    'Begusarai', 'Vaishali', 'Saran', 'Nalanda', 'Rohtas', 'Katihar', 'Madhubani'
  ],
  Odisha: [
    'Khordha', 'Cuttack', 'Puri', 'Balasore', 'Bhadrak', 'Ganjam', 'Mayurbhanj',
    'Sambalpur', 'Bargarh', 'Sundargarh', 'Jajpur', 'Kendrapara', 'Angul'
  ],
  Assam: [
    'Kamrup Metropolitan', 'Kamrup', 'Nagaon', 'Dibrugarh', 'Silchar', 'Jorhat',
    'Sonitpur', 'Barpeta', 'Dhubri', 'Cachar', 'Tinsukia', 'Golaghat'
  ],
  Jharkhand: [
    'Ranchi', 'Dhanbad', 'East Singhbhum', 'Bokaro', 'Hazaribagh', 'Deoghar',
    'Giridih', 'Dumka', 'Palamu', 'Ramgarh'
  ],
  'Uttar Pradesh': [
    'Varanasi', 'Prayagraj', 'Gorakhpur', 'Lucknow', 'Kanpur Nagar', 'Agra',
    'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Ayodhya', 'Jhansi'
  ],
  Punjab: [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur',
    'Sangrur', 'Firozpur', 'Gurdaspur', 'Moga'
  ],
  Haryana: [
    'Karnal', 'Hisar', 'Ambala', 'Sirsa', 'Kurukshetra', 'Rohtak',
    'Sonipat', 'Panipat', 'Fatehabad', 'Jind'
  ],
};

/**
 * Agro-climatic zone suitability multiplier & characteristics
 */
export const AGRO_ZONE_CHARACTERISTICS: Record<
  string,
  {
    name: string;
    description: string;
    suitableCrops: string[];
    productivityMultiplier: number;
    managementTip: string;
  }
> = {
  alluvial_gangetic: {
    name: 'Gangetic Alluvial Delta Zone',
    description: 'Deep fertile loam and silt with high water table. Premier rice, potato, jute, and mustard belt.',
    suitableCrops: ['Rice (Aman / Boro)', 'Potato', 'Jute', 'Mustard', 'Vegetables'],
    productivityMultiplier: 1.05,
    managementTip: 'High nutrient responsiveness. Split nitrogen applications and incorporate bio-fertilizers to prevent leaching.',
  },
  red_laterite: {
    name: 'Red & Laterite Zone (Western Undulating)',
    description: 'Acidic, coarse-textured soils with lower water holding capacity and subsurface iron concretions.',
    suitableCrops: ['Mustard', 'Groundnut', 'Pulses', 'Wheat', 'Short-duration Aman Paddy'],
    productivityMultiplier: 0.94,
    managementTip: 'Soil acidity and moisture stress during dry spells require in-situ rainwater conservation and lime/dolomite amendment.',
  },
  coastal_saline: {
    name: 'Coastal Saline & Sundarbans Mangrove Zone',
    description: 'High seasonal soil salinity, heavy clay, and shallow brackish water table.',
    suitableCrops: ['Salt-tolerant Rice (Aman)', 'Sunflower', 'Betel Vine', 'Brinjal'],
    productivityMultiplier: 0.95,
    managementTip: 'Requires raised bed cultivation (Dharbandhi) and flushing with monsoon rainwater before dry season crops.',
  },
  terai_dooars: {
    name: 'Terai & Teesta Alluvial Plain (North Bengal)',
    description: 'High precipitation, light acidic sandy-loam, and cooler sub-Himalayan winters.',
    suitableCrops: ['Rice', 'Maize', 'Potato', 'Ginger', 'Tea', 'Mustard'],
    productivityMultiplier: 1.02,
    managementTip: 'Abundant rainfall. Focus on soil drainage in monsoon and boron micronutrient supplementation.',
  },
  barind: {
    name: 'Old Alluvial Barind Tract',
    description: 'Grey-brown clayey soils with acidic to neutral reaction and moderate drainage.',
    suitableCrops: ['Rice (Aman / Boro)', 'Wheat', 'Mustard', 'Pulses'],
    productivityMultiplier: 0.98,
    managementTip: 'Apply farmyard manure (FYM) to improve soil structure and moisture retention.',
  },
  hill: {
    name: 'Darjeeling Eastern Himalayan Hill Zone',
    description: 'Terraced slopes, high altitude, cool temperatures, and high organic matter.',
    suitableCrops: ['Cardamom', 'Ginger', 'Orange', 'Vegetables', 'Off-season Potato'],
    productivityMultiplier: 0.92,
    managementTip: 'Terrace bunding to prevent topsoil erosion; organic compost mulching.',
  },
};

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds closest West Bengal district by coordinates
 */
export function findClosestBengalDistrict(lat: number, lon: number): DistrictInfo {
  let closest = WEST_BENGAL_DISTRICTS[0];
  let minDistance = Infinity;

  for (const d of WEST_BENGAL_DISTRICTS) {
    const dist = getDistanceKm(lat, lon, d.lat, d.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return closest;
}

export interface GeocodeResult {
  state: string;
  district: string;
  locality?: string;
  latitude: number;
  longitude: number;
  agroZone?: string;
  isApproximate?: boolean;
}

/**
 * Reverse geocodes GPS coordinates into State, District, and Agro-Climatic Zone
 */
export async function reverseGeocodeGPS(
  latitude: number,
  longitude: number
): Promise<GeocodeResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const state = data.principalSubdivision || 'West Bengal';
      let district = data.locality || data.city || '';

      // Clean up common suffix
      district = district
        .replace(/ District/i, '')
        .replace(/ Division/i, '')
        .trim();

      // Check if state is West Bengal
      if (state.toLowerCase().includes('bengal')) {
        // Match with known Bengal district
        const matched = WEST_BENGAL_DISTRICTS.find(
          (d) =>
            district.toLowerCase().includes(d.name.toLowerCase()) ||
            d.name.toLowerCase().includes(district.toLowerCase())
        );

        if (matched) {
          return {
            state: 'West Bengal',
            district: matched.name,
            locality: data.locality || data.city,
            latitude,
            longitude,
            agroZone: matched.agroZone,
          };
        }

        // If exact name didn't match directly, pick nearest Bengal district centroid
        const closest = findClosestBengalDistrict(latitude, longitude);
        return {
          state: 'West Bengal',
          district: closest.name,
          locality: data.locality || data.city,
          latitude,
          longitude,
          agroZone: closest.agroZone,
        };
      }

      // Other Indian state
      return {
        state,
        district: district || 'Central District',
        locality: data.locality || data.city,
        latitude,
        longitude,
      };
    }
  } catch (err) {
    console.warn('Network reverse geocode fallback to nearest district coordinate:', err);
  }

  // Fallback to closest Bengal district based on distance
  const closest = findClosestBengalDistrict(latitude, longitude);
  return {
    state: 'West Bengal',
    district: closest.name,
    latitude,
    longitude,
    agroZone: closest.agroZone,
    isApproximate: true,
  };
}
