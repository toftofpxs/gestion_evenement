import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const USERNAME_REGEX = /^[A-Za-z0-9]+$/;
const PASSWORD_REGEX = /^(?=.{8,64}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/;

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateFields = () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setErrorMessage('Veuillez saisir votre nom utilisateur');
      return false;
    }

    if (!USERNAME_REGEX.test(normalizedName)) {
      setErrorMessage('Le nom doit contenir uniquement lettres et chiffres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setErrorMessage("Format d'email invalide");
      return false;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setErrorMessage('Mot de passe: 8-64 caractères, 1 majuscule, 1 minuscule, 1 chiffre');
      return false;
    }

    if (confirmPassword !== password) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await API.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });

      const { token, user } = response.data;

      if (token && user) {
        await login(token, user);
      } else {
        Alert.alert('Compte créé', 'Inscription réussie, connectez-vous.');
        navigation.navigate('Login');
      }
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || "Erreur lors de l'inscription";
        setErrorMessage(message);
        Alert.alert('Erreur', message);
      } else if (error.request) {
        const message = 'Impossible de joindre le serveur.';
        setErrorMessage(message);
        Alert.alert('Erreur réseau', message);
      } else {
        setErrorMessage(error.message);
        Alert.alert('Erreur', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Inscription rapide</Text>

        <Text style={styles.label}>Nom utilisateur</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: hocin123"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Confirmer mot de passe</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="********"
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
        </TouchableOpacity>

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    marginTop: 12,
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
  },
  linkContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
