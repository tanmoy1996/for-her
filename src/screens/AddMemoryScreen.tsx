import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { RootStackParamList } from '../../App';
import { ScreenContainer } from '../components/ScreenContainer';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { addMemory, uploadImage } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMemory'>;

export function AddMemoryScreen({ navigation }: Props) {
  const { session } = useSharedAccount();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Photo permission is required to add an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  };

  const onSaveMemory = async () => {
    if (!session?.relationshipId) {
      setErrorMessage('Connect with your person first so this memory can go into your shared timeline.');
      return;
    }

    if (!title.trim() || !description.trim() || !imageUri) {
      setErrorMessage('Please add image, title, and description before saving.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const imageUrl = await uploadImage(imageUri);

      await addMemory({
        relationshipId: session.relationshipId,
        authorId: session.userId,
        authorName: session.username,
        title: title.trim(),
        description: description.trim(),
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        imageUrl,
      });

      navigation.navigate('Timeline');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save memory. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add Memory</Text>

        <Pressable style={styles.fieldButton} onPress={pickImage}>
          <Text style={styles.fieldButtonText}>{imageUri ? 'Change Image' : 'Pick an Image'}</Text>
        </Pressable>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={[styles.preview, styles.emptyPreview]}>
            <Text style={styles.emptyPreviewText}>No image selected</Text>
          </View>
        )}

        <Text style={styles.label}>Date</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{dayjs(selectedDate).format('MMMM D, YYYY')}</Text>
        </Pressable>

        {showDatePicker ? (
          <DateTimePicker
            mode="date"
            value={selectedDate}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        ) : null}

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="A special moment title"
          style={styles.input}
          placeholderTextColor="#9f8a94"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Write this memory in a few lines..."
          style={[styles.input, styles.multilineInput]}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#9f8a94"
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {isSaving ? <Text style={styles.savingHint}>Saving memory...</Text> : null}

        <Pressable style={[styles.saveButton, isSaving && styles.disabledButton]} onPress={onSaveMemory} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Save Memory</Text>}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4f3c46',
    marginBottom: 6,
  },
  fieldButton: {
    backgroundColor: '#fdd3e1',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#d58ca8',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fieldButtonText: {
    color: '#6f5060',
    fontSize: 15,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#fff1f6',
    shadowColor: '#d58ca8',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emptyPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0ccd9',
  },
  emptyPreviewText: {
    color: '#8d7681',
  },
  label: {
    fontSize: 14,
    color: '#6d5560',
    fontWeight: '600',
    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#f2d8e3',
    backgroundColor: '#fffafd',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#4c3d45',
  },
  input: {
    borderWidth: 1,
    borderColor: '#f2d8e3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#4c3d45',
    backgroundColor: '#fffafd',
  },
  multilineInput: {
    minHeight: 120,
  },
  errorText: {
    color: '#bc4f70',
    marginTop: 4,
  },
  savingHint: {
    color: '#7a6871',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#ee90ad',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#cb6788',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.75,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
