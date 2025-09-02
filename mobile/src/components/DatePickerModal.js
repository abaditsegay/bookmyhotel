import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePickerModal = ({ 
  visible, 
  onClose, 
  onDateSelect, 
  selectedDate, 
  minimumDate,
  title = "Select Date"
}) => {
  const [tempDate, setTempDate] = useState(selectedDate);

  const handleDateChange = (event, date) => {
    if (date && event.type !== 'dismissed') {
      setTempDate(date);
    }
  };

  const handleConfirm = () => {
    onDateSelect(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    onClose();
  };

  // Custom date picker for better reliability
  const CustomDatePicker = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const generateDates = () => {
      const dates = [];
      const today = new Date();
      const endDate = new Date();
      endDate.setFullYear(today.getFullYear() + 1);

      let currentDate = new Date(minimumDate || today);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    };

    const formatDateForDisplay = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return {
        day: days[date.getDay()],
        date: date.getDate(),
        month: months[date.getMonth()],
        year: date.getFullYear(),
        fullDate: date
      };
    };

    const dates = generateDates();
    const formattedDates = dates.map(formatDateForDisplay);

    const renderDateItem = ({ item }) => {
      const isSelected = item.fullDate.toDateString() === tempDate.toDateString();
      const isToday = item.fullDate.toDateString() === new Date().toDateString();
      
      return (
        <TouchableOpacity
          style={[
            styles.dateItem,
            isSelected && styles.selectedDateItem,
            isToday && styles.todayDateItem
          ]}
          onPress={() => setTempDate(item.fullDate)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDateText
          ]}>
            {item.day}
          </Text>
          <Text style={[
            styles.dateText,
            isSelected && styles.selectedDateText,
            isToday && styles.todayDateText
          ]}>
            {item.date}
          </Text>
          <Text style={[
            styles.monthText,
            isSelected && styles.selectedDateText
          ]}>
            {item.month}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.customDatePicker}>
        <FlatList
          data={formattedDates.slice(0, 60)} // Show next 60 days
          renderItem={renderDateItem}
          keyExtractor={(item) => item.fullDate.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmButton}>Done</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'ios' ? (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                onChange={handleDateChange}
                style={styles.iosDatePicker}
              />
            </View>
          ) : (
            // Use custom date picker for Android or as fallback
            <CustomDatePicker />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    fontSize: 16,
    color: '#2E7BE6',
    fontWeight: '600',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  iosDatePicker: {
    backgroundColor: '#fff',
    height: 200,
  },
  customDatePicker: {
    paddingVertical: 20,
  },
  dateList: {
    paddingHorizontal: 20,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 70,
  },
  selectedDateItem: {
    backgroundColor: '#2E7BE6',
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: '#2E7BE6',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  monthText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayDateText: {
    color: '#2E7BE6',
    fontWeight: '700',
  },
});

export default DatePickerModal;
