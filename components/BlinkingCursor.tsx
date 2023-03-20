import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisible((prevVisible) => !prevVisible);
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.cursor, {
        opacity: visible ? 1 : 0
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginRight: 0,
    // marginLeft: 'auto',
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  cursor: {
    width: 8,
    height: 16,
    backgroundColor: 'white',
  },
});

export default BlinkingCursor;