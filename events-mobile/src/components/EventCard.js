import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate, formatPrice } from '../utils/formatDate';

export default function EventCard({ event, onPress }) {
  const formattedPrice = formatPrice(event.price);
  const isFree = formattedPrice === 'Gratuit';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={[styles.price, isFree && styles.priceFree]}>{formattedPrice}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {event.description || 'Aucune description'}
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>📍</Text>
        <Text style={styles.infoText} numberOfLines={1}>
          {event.location || 'Lieu non précisé'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>📅</Text>
        <Text style={styles.infoText}>{formatDate(event.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceFree: {
    color: '#34C759',
    backgroundColor: '#E8F8ED',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    flexShrink: 1,
  },
});
