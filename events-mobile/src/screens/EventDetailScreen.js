import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import API, { SERVER_BASE_URL } from '../api/axios';
import { formatDate, formatPrice } from '../utils/formatDate';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const isPast = useMemo(() => {
    if (!event?.date) return false;
    return new Date(event.date) < new Date();
  }, [event]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get(`/events/${eventId}`);
        setEvent(response.data);
        navigation.setOptions({ title: response.data.title || 'Detail' });

        try {
          const myInscriptions = await API.get('/inscriptions/me');
          const list = [...(myInscriptions.data?.enCours || []), ...(myInscriptions.data?.passes || [])];
          const already = list.some((ins) => Number(ins.event_id) === Number(eventId));
          setIsRegistered(already);
        } catch {
          setIsRegistered(false);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Evenement introuvable');
        } else if (err.response) {
          setError(err.response.data?.message || `Erreur serveur (${err.response.status})`);
        } else if (err.request) {
          setError('Impossible de joindre le serveur');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigation]);

  const handleRegister = async () => {
    if (registering || isRegistered || isPast) return;

    setRegistering(true);
    try {
      await API.post('/inscriptions', { event_id: eventId });
      setIsRegistered(true);
      Alert.alert('Succes', 'Inscription confirmee');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setIsRegistered(true);
        Alert.alert('Info', message || 'Deja inscrit');
      } else if (status === 400) {
        Alert.alert('Erreur', message || 'Requete invalide');
      } else if (status === 401 || status === 403) {
        Alert.alert('Session', 'Reconnectez-vous');
      } else if (status === 404) {
        Alert.alert('Erreur', 'Evenement introuvable');
      } else if (err.request) {
        Alert.alert('Reseau', 'Impossible de joindre le serveur');
      } else {
        Alert.alert('Erreur', err.message);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = () => {
    Alert.alert('Desinscription', 'Voulez-vous annuler votre inscription ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          try {
            await API.delete(`/inscriptions/by-event/${eventId}`);
            setIsRegistered(false);
            Alert.alert('Ok', 'Desinscription effectuee');
          } catch (err) {
            const message = err.response?.data?.message || err.message || 'Erreur';
            Alert.alert('Erreur', message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0b5ed7" />
        <Text style={styles.loadingText}>Chargement de l evenement...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Evenement introuvable'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {event.photos && event.photos.length > 0 ? (
        <Image source={{ uri: getFullPhotoUrl(event.photos[0]) }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Aucune photo</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={[styles.priceBadge, parseFloat(event.price || 0) === 0 ? styles.priceFree : null]}>
          {formatPrice(event.price)}
        </Text>

        <InfoRow label="Lieu" value={event.location || 'Non precise'} />
        <InfoRow label="Date" value={formatDate(event.date)} />
        <InfoRow label="Cree le" value={formatDate(event.created_at)} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{event.description || 'Aucune description'}</Text>

        {isPast ? (
          <View style={styles.disabledAction}><Text style={styles.disabledActionText}>Evenement termine</Text></View>
        ) : isRegistered ? (
          <View style={styles.registeredContainer}>
            <Text style={styles.registeredText}>Vous etes inscrit</Text>
            <TouchableOpacity style={styles.unregisterButton} onPress={handleUnregister}>
              <Text style={styles.unregisterButtonText}>Se desinscrire</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.registerButton, registering ? styles.registerButtonDisabled : null]}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.registerButtonText}>S inscrire</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getFullPhotoUrl(photoPath) {
  if (!photoPath) return null;
  if (photoPath.startsWith('http')) return photoPath;
  return `${SERVER_BASE_URL}${photoPath}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#0b5ed7',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 220,
  },
  imagePlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
  },
  imagePlaceholderText: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    color: '#0b5ed7',
    backgroundColor: '#e7f1ff',
    fontWeight: '700',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  priceFree: {
    color: '#0f6b3c',
    backgroundColor: '#e7f8ee',
  },
  infoRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: '#111827',
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  registerButton: {
    backgroundColor: '#0b5ed7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  registerButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  registeredContainer: {
    alignItems: 'center',
    gap: 10,
  },
  registeredText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 16,
  },
  unregisterButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unregisterButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabledAction: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledActionText: {
    color: '#6b7280',
    fontWeight: '600',
  },
});
