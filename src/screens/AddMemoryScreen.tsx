import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CommonActions } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
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
import { addMemory, updateMemory, uploadImage } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMemory'>;

export function AddMemoryScreen({ navigation, route }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { session } = useSharedAccount();
  const memoryToEdit = route.params?.memory;
  const isEditing = Boolean(memoryToEdit);
  const [title, setTitle] = useState(memoryToEdit?.title ?? '');
  const [description, setDescription] = useState(memoryToEdit?.description ?? '');
  const [selectedDate, setSelectedDate] = useState(
    memoryToEdit ? dayjs(memoryToEdit.date).toDate() : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(memoryToEdit?.imageUrl ?? null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!memoryToEdit) {
      return;
    }

    setTitle(memoryToEdit.title);
    setDescription(memoryToEdit.description);
    setSelectedDate(dayjs(memoryToEdit.date).toDate());
    setImageUri(memoryToEdit.imageUrl || null);
  }, [memoryToEdit]);

  const pickImage = async () => {
    try {
      setShowDatePicker(false);
      setIsPickingImage(true);
      setErrorMessage(null);

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
    } finally {
      setIsPickingImage(false);
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
      setErrorMessage(
        'Connect with your person first so this memory can go into your shared timeline.',
      );
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage(
        'Please add a title and description before saving.',
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      let imageUrl = imageUri ?? '';

      if (imageUri && !imageUri.startsWith('http')) {
        imageUrl = await uploadImage(imageUri);
      }

      if (isEditing && memoryToEdit) {
        const updatedMemory = {
          ...memoryToEdit,
          title: title.trim(),
          description: description.trim(),
          date: dayjs(selectedDate).format('YYYY-MM-DD'),
          imageUrl,
        };

        await updateMemory(memoryToEdit.id, {
          title: updatedMemory.title,
          description: updatedMemory.description,
          date: updatedMemory.date,
          imageUrl: updatedMemory.imageUrl,
        });

        navigation.dispatch((state) => {
          const routes = state.routes
            .slice(0, -1)
            .map((item) => {
              const routeParams = item.params;
              const hasMemoryParam =
                routeParams &&
                typeof routeParams === 'object' &&
                'memory' in routeParams &&
                routeParams.memory;

              if (
                item.name === 'MemoryDetail' &&
                hasMemoryParam &&
                routeParams.memory.id === memoryToEdit.id
              ) {
                return {
                  ...item,
                  params: { memory: updatedMemory },
                };
              }

              return item;
            });

          return CommonActions.reset({
            ...state,
            routes,
            index: routes.length - 1,
          });
        });
        return;
      }

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
      const message =
        error instanceof Error
          ? error.message
          : 'Could not save memory. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>

            <View style={styles.backButtonSpacer} />
          </View>

          <Text style={styles.title}>{isEditing ? 'Edit Memory' : 'Add Memory'}</Text>

          <Pressable onPress={pickImage}>
            {isPickingImage ? (
              <View style={[styles.preview, styles.emptyPreview]}>
                <ActivityIndicator color="#ef8a8e" />
                <Text style={styles.emptyPreviewText}>Opening your photos...</Text>
              </View>
            ) : imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <View style={[styles.preview, styles.emptyPreview]}>
                <Text style={styles.emptyPreviewText}>Tap to upload an image</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.label}>Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker((currentValue) => !currentValue)}
          >
            <Text style={styles.dateButtonText}>
              {dayjs(selectedDate).format('MMMM D, YYYY')}
            </Text>
          </Pressable>

          {showDatePicker ? (
            Platform.OS === 'ios' ? (
              <View style={styles.datePickerCard}>
                <DateTimePicker
                  mode="date"
                  value={selectedDate}
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
                <Pressable
                  style={styles.datePickerDoneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </Pressable>
              </View>
            ) : (
              <DateTimePicker
                mode="date"
                value={selectedDate}
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )
          ) : null}

          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onFocus={() => {
              setShowDatePicker(false);
              scrollViewRef.current?.scrollTo({ y: 260, animated: true });
            }}
            placeholder="A special moment title"
            style={styles.input}
            placeholderTextColor="#9f8a94"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            onFocus={() => {
              setShowDatePicker(false);
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            placeholder="Write this memory in a few lines..."
            style={[styles.input, styles.multilineInput]}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9f8a94"
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {isSaving ? (
            <Text style={styles.savingHint}>Saving memory...</Text>
          ) : null}

          <Pressable
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={onSaveMemory}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Memory' : 'Save Memory'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
    gap: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbfaf9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5d8d3',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  backButtonText: {
    color: '#6e625e',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
  brandLabel: {
    color: '#ad958d',
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d221f',
    marginBottom: 6,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    backgroundColor: '#efe6e4',
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  emptyPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#f0ccd9',
  },
  emptyPreviewText: {
    color: '#8d7681',
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: '#776861',
    fontWeight: '600',
    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e5d8d3',
    backgroundColor: '#fbfaf9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#4a3f3b',
  },
  datePickerCard: {
    backgroundColor: '#fbfaf9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5d8d3',
    paddingTop: 8,
    paddingBottom: 14,
    shadowColor: '#c8bbb7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  datePickerDoneButton: {
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: '#ef8a8e',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5d8d3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#4a3f3b',
    backgroundColor: '#fbfaf9',
  },
  multilineInput: {
    minHeight: 120,
  },
  errorText: {
    color: '#b5636f',
    marginTop: 4,
  },
  savingHint: {
    color: '#7a6b64',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#ef8a8e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#de8c87',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
