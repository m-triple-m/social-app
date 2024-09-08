import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import AddPost from './screens/AddPost';
import Feed from './screens/Feed';
import { NavigationContainer } from '@react-navigation/native';
import { IconButton, useTheme } from 'react-native-paper';
import Signup from './screens/Signup';
import { useEffect, useRef, useState } from 'react';
import Login from './screens/Login';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from './firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

const auth = getAuth(app);
const Tab = createBottomTabNavigator();

export default function App() {
  
  const theme = useTheme();
  const runOnce = useRef(false);
  
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  
  useEffect(() => {
    if(runOnce.current){
      return;
    }
    TimeAgo.addDefaultLocale(en);
    runOnce.current = true;
  }, [])
  

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
      }
    });
  }, [])


  const openLogin = () => {
    setLoginOpen(true);
    setSignupOpen(false);
  }

  const openSignup = () => {
    setSignupOpen(true);
    setLoginOpen(false);
  }

  return (
    <NavigationContainer>
      <Signup visible={signupOpen} setVisible={setSignupOpen} openLogin={openLogin} />
      <Login visible={loginOpen} setVisible={setLoginOpen} openSignup={openSignup} />
      <Tab.Navigator
        screenOptions={({route}) => {
            return {
              tabBarIcon: ({focused}) => {
                let iconName;
                if(route.name === 'Addpost'){
                  iconName = focused ? 'plus-circle' : 'plus-circle-outline';
                }else if(route.name === 'Feed'){
                  iconName = focused ? 'home' : 'home-outline';
                }

                return <Icon name={iconName} size={focused ? 30 : 25} color={focused? theme.colors.primary : 'gray'} />
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray'
            }
        }}
      >
        <Tab.Screen name="Feed" component={Feed} options={{
          
          headerRight: () => !userLoggedIn ? <IconButton
            icon={'account-circle'}
            onPress={() => { setLoginOpen(true); }} />
            :
            <IconButton
              icon={'logout'}
              onPress={() => { setUserLoggedIn(false); }} />
        }} />
        <Tab.Screen name="Addpost" component={AddPost} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
