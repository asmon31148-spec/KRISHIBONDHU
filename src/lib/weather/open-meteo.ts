/**
 * KRISHIBONDHU - Real Meteorological Forecast Integration
 * Powered by Open-Meteo (Free Open Meteorological API - No API key needed)
 * Includes agronomic rules: spraying windows, fungal disease risk, irrigation advice.
 */

export interface WeatherData {
  latitude: number;
  longitude: number;
  locationName?: string;
  current: {
    time: string;
    temperature: number; // Celsius
    relativeHumidity: number; // %
    apparentTemperature: number;
    precipitation: number; // mm
    rain: number;
    weatherCode: number;
    weatherDescription: string;
    cloudCover: number; // %
    windSpeed: number; // km/h
    windDirection: number;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    weatherDescription: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationSum: number;
    precipitationProbability: number;
    windSpeedMax: number;
    sunrise: string;
    sunset: string;
  }>;
  agronomicInsights: {
    sprayCondition: {
      status: 'optimal' | 'marginal' | 'unfavorable';
      reason: string;
    };
    irrigationAdvice: {
      status: 'needed' | 'delay' | 'not_needed';
      reason: string;
    };
    diseaseRisk: {
      level: 'low' | 'moderate' | 'high';
      disease: string;
      reason: string;
    };
    heatRainWarning: string | null;
  };
}

// In-memory 30-minute server cache to protect network bandwidth
const memoryCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog / Morning Mist';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm';
    default:
      return 'Clear';
  }
}

export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  locationName?: string
): Promise<WeatherData> {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=Asia%2FKolkata`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }

    const json = await res.json();

    const currentPrecip = json.current.precipitation || 0;
    const currentWind = json.current.wind_speed_10m || 0;
    const currentHumidity = json.current.relative_humidity_2m || 0;
    const currentTemp = json.current.temperature_2m || 0;

    // Derived Agronomic Rule 1: Spraying Window
    let sprayStatus: 'optimal' | 'marginal' | 'unfavorable' = 'optimal';
    let sprayReason = 'Wind speed is calm (<15 km/h) and no imminent rain. Optimal window for foliar spray.';

    if (currentPrecip > 0.5) {
      sprayStatus = 'unfavorable';
      sprayReason = 'Active precipitation detected. Foliar sprays will be washed off. Avoid spraying.';
    } else if (currentWind > 18) {
      sprayStatus = 'unfavorable';
      sprayReason = `High wind speed (${currentWind} km/h). Spray droplets will drift and waste chemical.`;
    } else if (currentWind > 12) {
      sprayStatus = 'marginal';
      sprayReason = 'Moderate breeze. Spray close to crop canopy with low pressure nozzle.';
    }

    // Derived Agronomic Rule 2: Irrigation Advice
    const next3DaysPrecipSum = (json.daily.precipitation_sum as number[])
      .slice(0, 3)
      .reduce((a, b) => a + b, 0);

    let irrStatus: 'needed' | 'delay' | 'not_needed' = 'needed';
    let irrReason = 'Low rainfall expected over next 72 hours. Standard scheduled irrigation recommended.';

    if (next3DaysPrecipSum > 20) {
      irrStatus = 'delay';
      irrReason = `Substantial rainfall (${next3DaysPrecipSum.toFixed(1)} mm) forecast in next 3 days. Hold irrigation to prevent waterlogging.`;
    } else if (currentPrecip > 5) {
      irrStatus = 'not_needed';
      irrReason = 'Recent rainfall has saturated the soil profile.';
    }

    // Derived Agronomic Rule 3: Fungal Pathogen / Late Blight Risk
    let diseaseRiskLevel: 'low' | 'moderate' | 'high' = 'low';
    const diseaseName = 'Late Blight of Potato & Fungal Blast';
    let diseaseReason = 'Weather parameters do not favor rapid fungal spore germination.';

    if (currentHumidity > 85 && currentTemp >= 14 && currentTemp <= 23) {
      diseaseRiskLevel = 'high';
      diseaseReason = `Critical weather alert: High humidity (${currentHumidity}%) combined with temperature (${currentTemp}°C) creates ideal microclimate for Late Blight (Phytophthora infestans) and Rice Blast.`;
    } else if (currentHumidity > 75) {
      diseaseRiskLevel = 'moderate';
      diseaseReason = 'Elevated humidity. Inspect lower leaves for early lesion spotting.';
    }

    // Heat or Heavy Rain Alert
    let warning: string | null = null;
    if (currentTemp > 38) {
      warning = `Extreme Heat Warning: Current temperature (${currentTemp}°C) may cause crop transpiration stress. Provide light evening irrigation.`;
    } else if (next3DaysPrecipSum > 40) {
      warning = `Heavy Rain Alert: ${next3DaysPrecipSum.toFixed(0)} mm cumulative precipitation forecast. Ensure drainage channels are clear.`;
    }

    const dailyForecast = json.daily.time.map((dateStr: string, idx: number) => ({
      date: dateStr,
      weatherCode: json.daily.weather_code[idx],
      weatherDescription: getWeatherDescription(json.daily.weather_code[idx]),
      temperatureMax: json.daily.temperature_2m_max[idx],
      temperatureMin: json.daily.temperature_2m_min[idx],
      precipitationSum: json.daily.precipitation_sum[idx],
      precipitationProbability: json.daily.precipitation_probability_max?.[idx] || 0,
      windSpeedMax: json.daily.wind_speed_10m_max[idx],
      sunrise: json.daily.sunrise[idx],
      sunset: json.daily.sunset[idx],
    }));

    const weatherResult: WeatherData = {
      latitude,
      longitude,
      locationName: locationName || 'Farm Location',
      current: {
        time: json.current.time,
        temperature: currentTemp,
        relativeHumidity: currentHumidity,
        apparentTemperature: json.current.apparent_temperature,
        precipitation: currentPrecip,
        rain: json.current.rain || 0,
        weatherCode: json.current.weather_code,
        weatherDescription: getWeatherDescription(json.current.weather_code),
        cloudCover: json.current.cloud_cover || 0,
        windSpeed: currentWind,
        windDirection: json.current.wind_direction_10m || 0,
      },
      daily: dailyForecast,
      agronomicInsights: {
        sprayCondition: {
          status: sprayStatus,
          reason: sprayReason,
        },
        irrigationAdvice: {
          status: irrStatus,
          reason: irrReason,
        },
        diseaseRisk: {
          level: diseaseRiskLevel,
          disease: diseaseName,
          reason: diseaseReason,
        },
        heatRainWarning: warning,
      },
    };

    memoryCache.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
    return weatherResult;
  } finally {
    clearTimeout(timeout);
  }
}
