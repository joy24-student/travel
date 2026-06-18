import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { formatBDTCurrency } from '../utils/currency';

interface CurrencyDisplayProps {
  amount: number;
  showSymbol?: boolean;
  style?: object;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  showSymbol = true, 
  style 
}) => {
  const formattedAmount = showSymbol 
    ? formatBDTCurrency(amount) 
    : new Intl.NumberFormat('bn-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

  return (
    <Text style={[styles.text, style]}>{formattedAmount}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CurrencyDisplay;