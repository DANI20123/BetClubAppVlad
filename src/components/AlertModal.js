// src/components/AlertModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const AlertModal = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'error', 'warning'
  buttons = [{ text: 'OK', onPress: null }] 
}) => {
  const getIcon = () => {
    switch(type) {
      case 'success': return { name: 'check-circle', color: '#00FF88' };
      case 'error': return { name: 'exclamation-circle', color: '#FF4444' };
      case 'warning': return { name: 'exclamation-triangle', color: '#FFBB33' };
      default: return { name: 'info-circle', color: '#33B5E5' };
    }
  };

  const getGradientColors = () => {
    switch(type) {
      case 'success': return ['#00C851', '#007E33'];
      case 'error': return ['#FF4444', '#CC0000'];
      case 'warning': return ['#FFBB33', '#FF8800'];
      default: return ['#33B5E5', '#0099CC'];
    }
  };

  const { name: iconName, color: iconColor } = getIcon();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={getGradientColors()} style={styles.header}>
            <FontAwesome5 name={iconName} size={30} color="#FFF" />
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>
          
          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.buttons}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index === 0 ? styles.primaryButton : styles.secondaryButton
                ]}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  onClose();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  index === 0 ? styles.primaryButtonText : styles.secondaryButtonText
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF4444',
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
});

export default AlertModal;