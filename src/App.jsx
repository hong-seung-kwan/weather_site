import { useEffect, useState } from 'react'

import './App.css'
import axios from 'axios';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from 'lucide-react';
import { format } from "date-fns";
import { ko } from "date-fns/locale";


function App() {

  const API_KEY = import.meta.env.VITE_API_KEY;

  const [city, setCity] = useState("Seoul");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // 예보 데이터
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // 즐겨찾기 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(saved);
  }, []);

  const addFavorites = (cityName) => {
    if (!favorites.includes(cityName)) {
      const updated = [...favorites, cityName];
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
    }
  }

  const weatherIcons = {
    Clear: <Sun className="w-12 h-12 text-yellow-400 mx-auto" />,        // 맑음 ☀️
    Clouds: <Cloud className="w-12 h-12 text-gray-400 mx-auto" />,       // 구름 ☁️
    Rain: <CloudRain className="w-12 h-12 text-blue-400 mx-auto" />,     // 비 🌧
    Snow: <CloudSnow className="w-12 h-12 text-blue-200 mx-auto" />,     // 눈 ❄️
    Thunderstorm: <CloudLightning className="w-12 h-12 text-yellow-500 mx-auto" />, // 천둥 ⚡
    Drizzle: <CloudRain className="w-12 h-12 text-blue-300 mx-auto" />,  // 이슬비 🌦
    Mist: <CloudFog className="w-12 h-12 text-gray-300 mx-auto" />,      // 안개 🌫
  };

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`
      );
      setWeather(res.data);
    } catch (err) {
      console.error(err)
      alert("도시를 찾을 수 없습니다")
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`
          );
          setWeather(res.data)
          setCity(res.data.name);
        } catch (err) {
          console.error(err);
          alert("위치 기반 날씨를 가져올 수 없습니다.")
        }
      })
    } else {
      alert("브라우저가 위치 정보를 지원하지 않습니다.")
    }
  };

  // 5일 예보
  const fetchForecast = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`
      );
      setForecast(res.data.list); // list 배열 저장
    } catch (err) {
      console.error(err);
      setError("날씨를 불러올 수 없습니다...")
    } finally {
      setLoading(false)
    }
  };

  const handleSearch = () => {
    fetchWeather(city);
    fetchForecast(city);
    addFavorites(city);
  }


  const groupByDate = (list) => {
    return list.reduce((acc, item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  }

  const removeFavorite = (cityName) => {
    const updated = favorites.filter(fav => fav !== cityName);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  // 기본 도시 날씨 예보 데이터 불러오기
  useEffect(() => {
    fetchWeather(city);
    fetchForecast(city);
  }, []);

  // 다크모드인지 라이트모드인지 상태 불러오기
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 다크모드 상태 바뀔 때 localstorage 저장
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");   // <html class="dark">
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-start 
    bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400
    dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6">
      {/* 제목 + 다크모드 버튼 */}
      <div className="flex items-center space-x-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          🌤 날씨 앱
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
        >
          {darkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
        </button>
      </div>
      {/* 검색 */}
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="도시 이름 입력"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 
                   dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          검색
        </button>
        <button
          onClick={fetchWeatherByLocation}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          📍 내 위치
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          ⏳ 불러오는 중...
        </p>
      )}

      {/* 에러 */}
      {error && (
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
      )}

      {/* 즐겨찾기 */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 dark:text-gray-200">
            ⭐ 즐겨찾기 도시
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {favorites.map((fav, index) => (
              <div key={index} className='flex items-center space-x-2'>
                <button
                  onClick={() => {
                    setCity(fav);
                    fetchWeather(fav);
                    fetchForecast(fav);
                  }}
                  className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500"
                >
                  {fav}
                </button>

                <button
                  onClick={()=> removeFavorite(fav)}
                  className='bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600'
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 현재 날씨 */}
      {weather && (
        <div className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md rounded-lg p-6 mb-8 w-80 text-center">
          <h2 className="text-xl font-semibold mb-2">{weather.name} 날씨</h2>
          {weatherIcons[weather.weather[0].main] || (
            <Cloud className="w-12 h-12 text-gray-400 mx-auto" />
          )}
          <p>🌡 온도: {Math.round(weather.main.temp)}°C</p>
          <p>😮 체감 온도: {Math.round(weather.main.feels_like)}°C</p>
          <p>💧 습도: {weather.main.humidity}%</p>
          <p>🌬 풍속: {weather.wind.speed} m/s</p>
          <p>☁️ 상태: {weather.weather[0].description}</p>
        </div>
      )}

      {/* 5일 예보 */}
      {forecast.length > 0 && (
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 mt-3">
            📅 5일 예보
          </h2>

          {Object.entries(groupByDate(forecast)).map(([date, items], index) => (
            <div key={index} className="mb-6">
              {/* 날짜 헤더 */}
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">
                {format(new Date(date), "M월 d일 (E)", { locale: ko })}
              </h3>

              {/* 해당 날짜의 시간별 예보 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow rounded-lg p-4 text-center"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(item.dt_txt), "a h시", { locale: ko })}
                    </p>
                    {weatherIcons[item.weather[0].main] || (
                      <Cloud className="w-12 h-12 text-gray-400 mx-auto" />
                    )}
                    <p className="text-lg font-medium">
                      🌡 {Math.round(item.main.temp)}°C
                    </p>
                    <p className="capitalize">{item.weather[0].description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default App
