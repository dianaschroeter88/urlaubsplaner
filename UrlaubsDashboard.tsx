import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Clock, Sun, Cloud, CloudRain, Users, Calendar, Star } from 'lucide-react';

const UrlaubsDashboard = () => {
  // Urlaubszeitraum: 22.07 - 02.08
  const urlaubsStart = new Date('2025-07-22');
  const urlaubsEnde = new Date('2025-08-02');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherData, setWeatherData] = useState({});
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: 'Crêperie du Port', type: 'Restaurant' },
    { id: 2, name: 'La Villa Dinard', type: 'Restaurant' }
  ]);
  const [aktivitäten, setAktivitäten] = useState([
    { id: 1, name: 'Strand von Dinard', type: 'Aktivität', category: 'Strand' },
    { id: 2, name: 'Aquarium de Saint-Malo', type: 'Aktivität', category: 'Ausflug' }
  ]);
  const [tagesplan, setTagesplan] = useState({});
  const [frühstücksDienst, setFrühstücksDienst] = useState({});
  const [wetter, setWetter] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', type: 'Restaurant' });

  const kinder = ['Emilia', 'Yannic', 'Flyn'];
  const kategorien = {
    Restaurant: [],
    Aktivität: ['Strand', 'Museum', 'Ausflug', 'Sport', 'Shopping', 'Spaziergang']
  };

  const wetterOptionen = ['Sonnig', 'Bewölkt', 'Regen', 'Teilweise bewölkt'];
  const wetterIcons = {
    'Sonnig': Sun,
    'Bewölkt': Cloud,
    'Regen': CloudRain,
    'Teilweise bewölkt': Cloud
  };

  const zeitSlots = ['Morgens', 'Mittags', 'Abends'];

  useEffect(() => {
    // Initialisiere Frühstücksdienst für die nächsten 7 Tage
    const heute = new Date();
    const neuerFrühstücksDienst = {};
    for (let i = 0; i < 7; i++) {
      const datum = new Date(heute);
      datum.setDate(heute.getDate() + i);
      const dateString = datum.toISOString().split('T')[0];
      neuerFrühstücksDienst[dateString] = kinder[i % kinder.length];
    }
    setFrühstücksDienst(neuerFrühstücksDienst);
    
    // Lade Wetterdaten
    loadWeatherData();
  }, []);

  // Funktion zum Laden der Wetterdaten
  const loadWeatherData = async () => {
    setIsLoadingWeather(true);
    try {
      // Dinard Koordinaten: 48.6336, -2.0579
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=48.6336&longitude=-2.0579&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=Europe/Paris&forecast_days=16`
      );
      const data = await response.json();
      
      const weatherByDate = {};
      data.daily.time.forEach((date, index) => {
        weatherByDate[date] = {
          max_temp: Math.round(data.daily.temperature_2m_max[index]),
          min_temp: Math.round(data.daily.temperature_2m_min[index]),
          weather_code: data.daily.weather_code[index],
          precipitation: data.daily.precipitation_sum[index]
        };
      });
      
      setWeatherData(weatherByDate);
    } catch (error) {
      console.error('Fehler beim Laden der Wetterdaten:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Wettercode zu Icon und Beschreibung
  const getWeatherInfo = (code) => {
    const weatherCodes = {
      0: { icon: Sun, desc: 'Sonnig', color: 'text-yellow-500' },
      1: { icon: Sun, desc: 'Meist sonnig', color: 'text-yellow-400' },
      2: { icon: Cloud, desc: 'Teilweise bewölkt', color: 'text-gray-500' },
      3: { icon: Cloud, desc: 'Bewölkt', color: 'text-gray-600' },
      45: { icon: Cloud, desc: 'Neblig', color: 'text-gray-400' },
      48: { icon: Cloud, desc: 'Neblig', color: 'text-gray-400' },
      51: { icon: CloudRain, desc: 'Leichter Regen', color: 'text-blue-500' },
      53: { icon: CloudRain, desc: 'Regen', color: 'text-blue-600' },
      55: { icon: CloudRain, desc: 'Starker Regen', color: 'text-blue-700' },
      61: { icon: CloudRain, desc: 'Leichter Regen', color: 'text-blue-500' },
      63: { icon: CloudRain, desc: 'Regen', color: 'text-blue-600' },
      65: { icon: CloudRain, desc: 'Starker Regen', color: 'text-blue-700' },
    };
    return weatherCodes[code] || { icon: Sun, desc: 'Unbekannt', color: 'text-gray-500' };
  };

  // Nächste 3 Tage ab heute bestimmen
  const getNext3Days = () => {
    const days = [];
    const heute = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(heute);
      date.setDate(heute.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const addItem = () => {
    if (newItem.name) {
      const id = Date.now();
      const itemToAdd = newItem.type === 'Restaurant' 
        ? { ...newItem, id }
        : { ...newItem, id, category: newItem.category || 'Allgemein' };
      
      if (newItem.type === 'Restaurant') {
        setRestaurants([...restaurants, itemToAdd]);
      } else {
        setAktivitäten([...aktivitäten, itemToAdd]);
      }
      setNewItem({ name: '', category: '', type: 'Restaurant' });
    }
  };

  const deleteItem = (id, type) => {
    if (type === 'Restaurant') {
      setRestaurants(restaurants.filter(item => item.id !== id));
    } else {
      setAktivitäten(aktivitäten.filter(item => item.id !== id));
    }
  };

  const addToTagesplan = (item, zeitSlot) => {
    const key = `${selectedDate}-${zeitSlot}`;
    setTagesplan(prev => ({
      ...prev,
      [key]: item
    }));
  };

  const removeFromTagesplan = (zeitSlot) => {
    const key = `${selectedDate}-${zeitSlot}`;
    setTagesplan(prev => {
      const newPlan = { ...prev };
      delete newPlan[key];
      return newPlan;
    });
  };

  const updateWetter = (zeitSlot, wetterTyp) => {
    const key = `${selectedDate}-${zeitSlot}`;
    setWetter(prev => ({
      ...prev,
      [key]: wetterTyp
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const allItems = [...restaurants, ...aktivitäten];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
            {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-800 flex items-center gap-2">
                <MapPin className="text-indigo-600" />
                Dinard Urlaubs-Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Frankreich • 22.07 - 02.08.2025 • Familie mit 4 Kindern</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  6 Personen
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  {Math.ceil((urlaubsEnde - new Date()) / (1000 * 60 * 60 * 24))} Tage bis Urlaub
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linke Spalte: Sammlungen */}
          <div className="space-y-6">
            {/* Neuen Eintrag hinzufügen */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="text-green-600" />
                Neuer Vorschlag
              </h2>
              <div className="space-y-3">
                <select 
                  value={newItem.type} 
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Aktivität">Aktivität</option>
                </select>
                <input
                  type="text"
                  placeholder="Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {newItem.type === 'Aktivität' && (
                  <select 
                    value={newItem.category} 
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Kategorie wählen</option>
                    {kategorien[newItem.type].map(kat => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                )}
                <button 
                  onClick={addItem}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Hinzufügen
                </button>
              </div>
            </div>

            {/* Restaurant-Sammlung */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🍽️ Restaurants
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {restaurants.map(restaurant => (
                  <div 
                    key={restaurant.id}
                    className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(restaurant))}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{restaurant.name}</div>
                      </div>
                      <button
                        onClick={() => deleteItem(restaurant.id, 'Restaurant')}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aktivitäten-Sammlung */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎯 Aktivitäten
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {aktivitäten.map(aktivität => (
                  <div 
                    key={aktivität.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(aktivität))}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{aktivität.name}</div>
                        {aktivität.category && <div className="text-sm text-blue-600">{aktivität.category}</div>}
                      </div>
                      <button
                        onClick={() => deleteItem(aktivität.id, 'Aktivität')}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mittlere Spalte: Tagesplanung */}
          <div className="space-y-6">
            {/* Datum wählen */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" />
                Tagesplanung
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
              <div className="mt-2 text-sm text-gray-600 font-medium">
                {formatDate(selectedDate)}
              </div>
            </div>

            {/* Tagesplan */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tagesplan</h3>
              <div className="space-y-4">
                {zeitSlots.map(zeitSlot => {
                  const key = `${selectedDate}-${zeitSlot}`;
                  const geplantesItem = tagesplan[key];
                  
                  return (
                    <div key={zeitSlot} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {zeitSlot}
                        </h4>
                        {geplantesItem && (
                          <button
                            onClick={() => removeFromTagesplan(zeitSlot)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div 
                        className={`min-h-16 p-3 rounded-lg border-2 border-dashed transition-colors ${
                          geplantesItem 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-gray-50 border-gray-300 hover:border-indigo-400'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
                          addToTagesplan(itemData, zeitSlot);
                        }}
                      >
                        {geplantesItem ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">{geplantesItem.name}</div>
                            {geplantesItem.category && <div className="text-green-600">{geplantesItem.category}</div>}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            Hier Aktivität oder Restaurant hinziehen
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rechte Spalte: Live Wetter & Frühstücksdienst */}
          <div className="space-y-6">
            {/* Wetter */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="text-yellow-500" />
                Live Wetter Dinard
                {isLoadingWeather && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
              </h2>
              
              {/* Nächste 3 Tage Wettervorhersage */}
              <div className="space-y-4">
                {getNext3Days().map((dateString, index) => {
                  const weather = weatherData[dateString];
                  const date = new Date(dateString);
                  const isToday = index === 0;
                  const isTomorrow = index === 1;
                  
                  if (!weather) {
                    return (
                      <div key={dateString} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    );
                  }
                  
                  const weatherInfo = getWeatherInfo(weather.weather_code);
                  const WeatherIcon = weatherInfo.icon;
                  
                  return (
                    <div key={dateString} className={`p-4 rounded-lg border-2 ${
                      isToday ? 'bg-blue-50 border-blue-300' : 
                      isTomorrow ? 'bg-green-50 border-green-300' : 
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-800">
                            {isToday ? 'Heute' : 
                             isTomorrow ? 'Morgen' : 
                             date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">
                              {weather.max_temp}°
                            </div>
                            <div className="text-sm text-gray-500">
                              {weather.min_temp}° min
                            </div>
                            {weather.precipitation > 0 && (
                              <div className="text-xs text-blue-600">
                                💧 {weather.precipitation}mm
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center">
                            <WeatherIcon className={`w-8 h-8 ${weatherInfo.color}`} />
                            <div className="text-xs text-gray-600 text-center mt-1">
                              {weatherInfo.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button 
                onClick={loadWeatherData}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={isLoadingWeather}
              >
                {isLoadingWeather ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Lädt...
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    Wetter aktualisieren
                  </>
                )}
              </button>
            </div>

            {/* Frühstücksdienst diese Woche */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🥐 Frühstücksdienst
              </h2>
              <div className="space-y-3">
                {Object.entries(frühstücksDienst).slice(0, 7).map(([datum, kind]) => {
                  const isToday = datum === selectedDate;
                  return (
                    <div 
                      key={datum}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        isToday 
                          ? 'bg-green-100 border-green-300' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">
                            {new Date(datum).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </div>
                          {isToday && <div className="text-xs text-green-600 font-medium">Heute</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-gray-700">{kind}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Strukturierter Urlaubsplan:</div>
                  <div className="text-xs mt-1">Klare Aufgaben, feste Zeiten, gemeinsame Aktivitäten</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlaubsDashboard;