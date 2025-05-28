import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from './Component/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
const screenHeight = Dimensions.get('window').height;
export default function App() {
  const [result, setresult] = useState('0')
  const [input, setinput] = useState('')
  const [eraseInterval, setEraseInterval] = useState(null);
  const [history, setHistory] = useState([]);

  const buttons = [
    ['%', '^', '.', '⌫'],
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', 'C', '=', '+']
  ];

  const handleeval = (value) => {

    const operators = ['+', '-', '*', '/', '**', '.', '^', '%'];
    if (value === 'C') {
      setinput('')
      setresult('')
    } else if (value === '=') {
      try {
        const res = eval(input);
        setresult(res.toString());
        // console.log(res);

        const newEntry = `${input} = ${res}`;

        if (history[0] !== newEntry) {
          const updatedHistory = [newEntry, ...history];
          setHistory(updatedHistory);
          {
            (async () => {
              await AsyncStorage.setItem('calcHistory', JSON.stringify(updatedHistory));
            })()
          }

        }

      } catch (error) {
        console.error('Eval error:', error);
        setresult('Error');
      }
    }

    else if (value === '%') {
      try {
        const numbers = input.match(/(\d+\.?\d*)$/); // Get last number
        if (numbers) {
          const lastNumber = parseFloat(numbers[0]);
          const percentageValue = lastNumber / 100;
          const updatedInput = input.replace(/(\d+\.?\d*)$/, percentageValue.toString());
          setinput(updatedInput);
          setresult('');
        } else {
          setresult('Error');
        }
      } catch (error) {
        setresult('Error');
      }
    }

    else if (value === '^') {
      const lastChar = input.slice(-1);
      const lastTwoChars = input.slice(-2);
      const operators = ['+', '-', '*', '/', '.', '%', '^'];

      // Prevent adding ** if last is operator or already ends with **
      if (
        input === '' ||                             // Don't start with **
        lastTwoChars === '**' ||                    // Already ended with **
        operators.includes(lastChar)                // Last char is an operator
      ) {
        return; // Do not add power
      }

      setinput(input + '**');
    }

    else if (value === 'erase') {
      setinput(input.slice(0, -1)); // remove last character
    }
    else {
      const lastChar = input.slice(-1);
      const isOperator = operators.includes(value);

      // Prevent double operators (e.g. 1++ or 2**+)
      if (
        isOperator &&
        (operators.includes(lastChar) || lastChar === '' || lastChar === '.')
      ) {
        return; // don't add
      }

      setinput(input + value);
    }
  }
  const getButtonValue = (label) => {
    if (label === '⌫') return 'erase';
    return label;
  };

  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await AsyncStorage.getItem('calcHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    };

    loadHistory();
  }, []);
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('calcHistory'); // Remove from storage
      setHistory([]); // Clear from state
    } catch (error) {
      console.log('Failed to clear history:', error);
    }
  };
  // console.log('resy', history)
  return (
    <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: '#111212', }}>
      <Navbar />
      <View style={{ justifyContent: 'center', width: '100%', height: '100%', marginBottom: 20 }}>
        {
          history &&
          <View style={{ margin: 20, maxHeight: screenHeight * 0.1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
              {history.length > 0 && <Text style={{ color: 'white', fontSize: 18, marginBottom: 10, fontWeight: 700 }}>History</Text>}
              {history.length > 0 && (
                <TouchableOpacity onPress={clearHistory} style={styles.clearHistoryButton}>
                  <Text style={{ color: 'white', fontSize: 18, marginBottom: 10, backgroundColor: '#8a4301', fontWeight: 700, padding: 3, borderRadius: 10 }}>Clear History</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={{ maxHeight: screenHeight * 0.12 }}>

              {history.map((entry, index) => (
                <Pressable key={index}>
                  <Text onPress={() => setinput(entry.split('=')[0])} style={{ color: '#ccc', fontSize: 18, margin: 10 }}>
                    {entry.replaceAll('*', 'x').replaceAll('xx', '^')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }


        <View style={{ alignItems: 'flex-end', padding: 12, marginTop: 10, maxHeight: screenHeight * 0.1 }}>
          <ScrollView>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
              {input === '' ? '0' : input.replaceAll('**', '^').replaceAll('*', ' x ')}
            </Text>

            {input !== '' && (
              <Text onPress={() => setinput(result)} style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
                = {String(Number(result).toLocaleString())}
              </Text>
            )}
          </ScrollView>
        </View>

        <View style={{ borderColor: 'grey', width: '100%', borderWidth: 1 }}></View>
        <View style={{ marginTop: 10 }}> {/* Main container for all rows */}
          {buttons.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={styles.buttonRow} // Apply row styles here
            >
              {row.map((btn) => (

                <TouchableOpacity
                  key={btn}
                  onPress={() => handleeval(getButtonValue(btn))}
                  onPressIn={() => {
                    if (btn === '⌫') {
                      const interval = setInterval(() => {
                        setinput((prev) => prev.slice(0, -1));
                      }, 100); // speed of erase (adjustable)
                      setEraseInterval(interval);
                    }
                  }}
                  onPressOut={() => {
                    if (btn === '⌫' && eraseInterval) {
                      clearInterval(eraseInterval);
                      setEraseInterval(null);
                    }
                  }}
                  style={[styles.button, btn === '=' && styles.equalsButton, ['/', '*', '-', '+'].includes(btn) && styles.operatorButton,
                  btn === 'C' && styles.clearButton, !input && btn === '⌫' && styles.noterase]} // Apply individual button styles here
                >
                  <Text style={styles.buttonText}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    width: '100%', // Ensure the row takes full width
    flexDirection: 'row', // <-- CRITICAL: Arrange items horizontally
    justifyContent: 'space-around', // <-- Now this will space out the buttons
    alignItems: 'center', // Align buttons vertically in the center of the row
    marginBottom: 10, // Space between rows

  },
  button: {
    width: 50, // <-- Set a fixed width for each button
    height: 50, // <-- Set a fixed height for each button
    borderRadius: 25, // Makes it circular
    backgroundColor: '#242423', // Example button background
    justifyContent: 'center', // Center text horizontally within the button
    alignItems: 'center', // Center text vertically within the button
    margin: 3, // Small margin around each button for spacing
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700', // Use string for fontWeight
  },
  equalsButton: {
    backgroundColor: '#07e30e', // Green background for the equals button
  },
  operatorButton: {
    backgroundColor: '#2e1a0b', // Orange background for operators (/, *, -, +)
  },
  clearButton: {
    backgroundColor: '#10a5c7', // Light gray background for 'C'
  },
  noterase: {
    backgroundColor: 'black',
    opacity: 0.5, // make it look inactive
  }

});
