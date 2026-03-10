import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate, formatPrice } from '../utils/formatDate';

export default function EventCard({ event, onPress }) {
  const free = parseFloat(event.price || 0) === 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={[styles.price, free ? styles.priceFree : null]}>{formatPrice(event.price)}</Text>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {event.description || 'Aucune description'}
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Lieu:</Text>
        <Text style={styles.infoText}>{event.location || 'Non precise'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoText}>{formatDate(event.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b5ed7',
    backgroundColor: '#e7f1ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  priceFree: {
    color: '#0f6b3c',
    backgroundColor: '#e7f8ee',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
  },
});
