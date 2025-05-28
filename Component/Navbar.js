import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Navbar = () => {
  return (
    <View>
     <Text
  style={{
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800', // Best to use string for fontWeight
    color: 'white',
    textShadowColor: 'white',   // Shadow color
    textShadowOffset: { width: 0, height: 0 }, // No offset (shadow directly behind)
    textShadowRadius: 15,        // Adjust for desired blur effect
  }}
>
  KriCal
</Text>
    </View>
  )
}

export default Navbar

const styles = StyleSheet.create({})