import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';

/**
 * Simple Android Scroll Test Component
 * Use this to verify basic Android scrolling works
 */
const AndroidScrollTest = () => {
  const { height } = Dimensions.get('window');
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Android Scroll Test</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={false}
        overScrollMode="auto"
        scrollEventThrottle={1}
        bounces={false}
      >
        {/* Generate enough content to require scrolling */}
        {Array.from({ length: 20 }, (_, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>
              Scroll Item {index + 1}
            </Text>
            <Text style={styles.itemSubtext}>
              This is a test item to verify Android scrolling functionality.
              Platform: {Platform.OS}
            </Text>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you can see this, scrolling works! 🎉
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
    color: 'white',
  },
  
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    padding: 16,
  },
  
  item: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  itemSubtext: {
    fontSize: 14,
    color: '#666',
  },
  
  footer: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  
  footerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AndroidScrollTest;
