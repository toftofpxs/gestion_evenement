import React, { useEffect, useState } from 'react';
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
import API, { getServerBaseUrl } from '../api/axios';
import { formatDate, formatPrice } from '../utils/formatDate';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get(`/events/${eventId}`);
        setEvent(response.data);
        navigation.setOptions({ title: response.data.title });

        try {
          const inscriptionsRes = await API.get('/inscriptions/me');
          const { enCours = [], passes = [] } = inscriptionsRes.data || {};
          const allInscriptions = [...enCours, ...passes];
          const normalizedEventId = Number(eventId);
          const alreadyRegistered = allInscriptions.some(
            (ins) => Number(ins.event_id) === normalizedEventId || Number(ins.event?.id) === normalizedEventId
          );
          setIsRegistered(alreadyRegistered);
        } catch (inscErr) {
          console.log("Impossible de vérifier l'inscription:", inscErr.message);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Événement introuvable');
        } else if (err.response) {
          setError(`Erreur serveur (${err.response.status})`);
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
    if (registering || isRegistered) return;

    setRegistering(true);
    try {
      const response = await API.post('/inscriptions', { event_id: Number(eventId) });
      setIsRegistered(true);
      Alert.alert(
        'Inscription confirmée ! ✅',
        `Vous êtes inscrit à "${event?.title}".\nStatut : ${response.data.status}`
      );
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;

        switch (status) {
          case 400:
            Alert.alert('Impossible', message || 'Requête invalide');
            break;
          case 401:
            Alert.alert('Non connecté', 'Veuillez vous reconnecter.');
            break;
          case 403:
            Alert.alert('Session expirée', 'Votre token a expiré. Reconnectez-vous.');
            break;
          case 404:
            Alert.alert('Introuvable', "Cet événement n'existe plus.");
            break;
          case 409:
            setIsRegistered(true);
            Alert.alert('Déjà inscrit', 'Vous êtes déjà inscrit à cet événement.');
            break;
          default:
            Alert.alert('Erreur', message || 'Une erreur est survenue.');
        }
      } else if (err.request) {
        Alert.alert('Erreur réseau', 'Impossible de joindre le serveur.');
      } else {
        Alert.alert('Erreur', err.message);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = () => {
    Alert.alert('Désinscription', `Voulez-vous vraiment vous désinscrire de "${event?.title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se désinscrire',
        style: 'destructive',
        onPress: async () => {
          try {
            setRegistering(true);
            await API.delete(`/inscriptions/by-event/${eventId}`);
            setIsRegistered(false);
            Alert.alert('Désinscription', 'Vous avez été désinscrit avec succès.');
          } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de la désinscription.';
            Alert.alert('Erreur', message);
          } finally {
            setRegistering(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de l'événement...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>{error || 'Événement introuvable'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour à la liste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {event.photos && event.photos.length > 0 ? (
        <Image source={{ uri: getFullPhotoUrl(event.photos[0]) }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>📅</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.priceBadge, parseFloat(event.price) === 0 && styles.priceFree]}>
            {formatPrice(event.price)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <InfoRow icon="📍" label="Lieu" value={event.location || 'Non précisé'} />
          <InfoRow icon="📅" label="Date" value={formatDate(event.date)} />
          <InfoRow icon="👤" label="Organisateur" value={`ID #${event.organizer_id}`} />
          <InfoRow icon="📝" label="Créé le" value={formatDate(event.created_at)} />
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{event.description || 'Aucune description disponible.'}</Text>
        </View>

        {isRegistered ? (
          <View style={styles.registeredContainer}>
            <Text style={styles.registeredText}>✅ Vous êtes inscrit</Text>
            <TouchableOpacity style={styles.unregisterButton} onPress={handleUnregister}>
              <Text style={styles.unregisterButtonText}>Se désinscrire</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.registerButton, registering && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>S'inscrire à cet événement</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function getFullPhotoUrl(photoPath) {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  return `${getServerBaseUrl()}${photoPath}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 220,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  priceBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  priceFree: {
    color: '#34C759',
    backgroundColor: '#E8F8ED',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  registerButtonDisabled: {
    backgroundColor: '#999',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registeredContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  registeredText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 12,
  },
  unregisterButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  unregisterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
