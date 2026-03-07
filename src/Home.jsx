import "../global.css"
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TextInput, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme, weatherImages } from "../utils/utils";
import { useCallback, useEffect, useState, useRef } from "react";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { setData } from '../utils/secureStore';
import { getData } from "../utils/secureStore";

export default function Home() {
  const waitTime = 500;
  const minSearchLength = 2;
  
  // handle search bar
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchOpen = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);

  // loader screen
  const [loading, setLoading] = useState(true);
  const fadeAnime = useRef(new Animated.Value(1)).current;

  // handling location from results
  const [locations, setLocations] = useState([]);
  const handleLocation = (loc) => {
    setLocations([]);
    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
      setData('city', loc.name);
    })
    setIsSearching(false);
  }
 
  // handling search
  const handleSearch = (value) => {
    // fetch locations
    if(value.length >= minSearchLength){
      fetchLocations({cityName: value}).then(data=>{
        setLocations(data)
      })
    }
  }

  // fetch the weather api at booting
  useEffect(() => {
    fetchWeatherData();
  },[]);

  const fetchWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'London';

    // set the data if there is any
    if(myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName: cityName,
      days: '7'
    }).then(data => {
      setWeather(data);
      setLoading(false)
    })
  }

  // set text debounce for search bar
  const handleTextDebounce = useCallback(debounce(handleSearch, waitTime))

  // handling received data
  const [weather, setWeather] = useState({});
  const {current, location} = weather;

  // rendering
  return (
    <SafeAreaProvider>
    <View className="flex-1 relative">

      <StatusBar style="light" />

      {/* background image */}
      <Image 
        source={require('../assets/images/bg-3.png')}
        blurRadius={115}
        className="absolute h-full w-full"
      />

      {/* loading data first, then rendering */}
      {
        loading ? (

          // add a progress bar at loading state
          <Animated.View 
          style={{ opacity:fadeAnime }}
          className="flex-1 items-center justify-center"
          >
            <ActivityIndicator size={75} color="#fff" />
          </Animated.View>

        ) : (

          <SafeAreaView className="flex flex-1">
        {/* search section */}
        <View className="m-4 my-2 z-50" onFocus={handleSearchOpen} onBlur={handleSearchClose}>

          <View 
           style={{backgroundColor: isSearching ? theme.bgWhite(0.2) : 'transparent'}} 
           className="flex-row justify-end items-center rounded-full overflow-hidden" >
            
            {/* search bar */}
            {
              isSearching? (
                <TextInput
                 onChangeText={handleTextDebounce}
                 placeholder="Search City" 
                 placeholderTextColor={'lightgray'} 
                 cursorColor={'white'}
                 className="text-white pl-4 flex-1 text-xl"
                />
              ) : null
            }

            {/* search bar toggle button */}
            <TouchableOpacity
            style={{backgroundColor: theme.bgWhite(0.3)}}
            className="rounded-full p-3 m-1"
            onPress={() => setIsSearching(!isSearching)}>
              
              <Image source={require('../assets/icons/search.png')} 
              className="h-5 w-5" 
              tintColor={'white'}/>

            </TouchableOpacity>
          </View>

          {/* search results */}
          <View>
            {
              locations.length > 0 && isSearching ? (
                <View className="absolute w-full bg-slate-300 overflow-hidden rounded-3xl top-2">
                  {
                    locations.map((loc, index) => {
                      // remove the border from the last element
                      let showBorder = index + 1 != locations.length;
                      let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';
                      
                      return (
                        <TouchableOpacity 
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={"flex-row items-center p-3 px-4  mb-1 " + borderClass} >
                          <Image 
                           source={require('../assets/icons/pin-2.png')}
                           tintColor={'gray'}
                           className="h-4 w-4"/>
                          <Text className="text-black text-xl font-medium ml-2">{loc?.name}, {loc?.country}</Text>
                        </TouchableOpacity>
                      )
                    })
                  }
                </View>
              ) : null
            }
          </View>
        </View>
        
        {/* forecast section */}
        
        {// render the page elements only when search bar is off
        !isSearching && (
          <>
            <View className="flex flex-col justify-around flex-1">

              {/* location */}
              <Text className="text-white text-center font-bold text-3xl">
                {location?.name},
                <Text className="text-gray-200 text-xl">{" " + location?.country}</Text>
              </Text>

              {/* weather image */}
              <View className="justify-center flex-row">
                <Image 
                source={weatherImages[current?.condition?.text]}
                className="w-52 h-52"/>
              </View>

              {/* degree & description */}
              <View className="gap-3">
                <Text className="text-center text-white font-bold text-6xl ml-4">{current?.temp_c}&#176;</Text>
                <Text className="text-center text-white text-2xl tracking-widest">{current?.condition.text}</Text>
              </View>

              {/* stats */}
              <View className="flex-row justify-between mx-6">
                
                <View className="flex-row gap-1.5 items-center">
                  <Image 
                  source={require('../assets/icons/wind.png')}
                  tintColor={'white'}
                  className="w-7 h-7"/>
                  <Text className="text-white font-medium text-xl">{current?.wind_kph}km</Text>
                </View>

                <View className="flex-row gap-1.5 items-center">
                  <Image 
                  source={require('../assets/icons/drop.png')}
                  tintColor={'white'}
                  className="w-7 h-7"/>
                  <Text className="text-white font-medium text-xl">{current?.humidity}%</Text>
                </View>

                <View className="flex-row gap-1.5 items-center">
                  <Image 
                  source={require('../assets/icons/sun.png')}
                  tintColor={'white'}
                  className="w-7 h-7"/>
                  <Text className="text-white font-medium text-xl">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                </View>

              </View>

            </View>

            {/* forecast for upcoming days */}
            <View className="mb-6">

              <View className="flex-row items-center mx-5 my-3 gap-2">
                <Image 
                source={require('../assets/icons/calendar.png')}
                tintColor={'white'}
                className="w-5 h-5"/>
                <Text className="text-white text-lg">Daily Forecast</Text>
              </View>

              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal: 15}}
              >

                {
                  // display daily forecast
                  weather?.forecast?.forecastday?.map((item, index) => {
                    let date = new Date(item.date);
                    let options = {weekday: 'long'};
                    let dayName = date.toLocaleDateString('en-US', options);
                    dayName = dayName.split(',')[0]

                    return (
                      <View 
                       key={index}
                       className="flex justify-center items-center w-24 rounded-3xl py-3 gap-1 mr-4"
                       style={{backgroundColor: theme.bgWhite(0.15)}}>
                        
                        <Image 
                        source={weatherImages[item?.day?.condition?.text]} 
                        className="w-14 h-14"
                        />
                        <Text className="text-white">{dayName}</Text>
                        <Text className="text-white text-2xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                        
                      </View>
                    )
                  })
                }

              </ScrollView>
            </View>
          </>
        )}

      </SafeAreaView>
        )
      }

      
    </View>
    </SafeAreaProvider>
  );
}
