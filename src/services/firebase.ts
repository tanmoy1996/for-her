import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import * as ImageManipulator from 'expo-image-manipulator';

const SESSION_STORAGE_KEY = 'for-her/user-session';
const CONNECTION_CODE_LENGTH = 6;
const CONNECTION_CODE_TTL_MS = 15 * 60 * 1000;

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }

  return value;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

export type UserAccount = {
  id: string;
  username: string;
  passcode: string;
  relationshipId: string | null;
  partnerId: string | null;
  createdAt: number;
};

export type UserSession = {
  userId: string;
  username: string;
  relationshipId: string | null;
  partnerId: string | null;
};

export type Relationship = {
  id: string;
  memberIds: string[];
  createdAt: number;
};

export type ConnectionCode = {
  id: string;
  code: string;
  inviterUserId: string;
  expiresAt: number;
  usedAt: number | null;
  createdAt: number;
};

export type Memory = {
  id: string;
  relationshipId: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  createdAt: number;
};

type MemoryInput = Omit<Memory, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: number;
};

const usersCollection = collection(firestore, 'users');
const relationshipsCollection = collection(firestore, 'relationships');
const memoriesCollection = collection(firestore, 'memories');
const connectionCodesCollection = collection(firestore, 'connectionCodes');

export async function createUserAccount(
  username: string,
  passcode: string,
): Promise<UserSession> {
  const normalizedUsername = normalizeUsername(username);
  console.log('normalizedUsername: ', normalizedUsername);
  const existingUserQuery = query(
    usersCollection,
    where('username', '==', normalizedUsername),
  );
  console.log('existingUserQuery: ', existingUserQuery);
  const existingUserSnapshot = await getDocs(existingUserQuery);

  console.log('existingUserSnapshot: ', existingUserSnapshot);

  if (!existingUserSnapshot.empty) {
    throw new Error('That username is already taken.');
  }

  const userRef = doc(usersCollection);
  const userAccount: UserAccount = {
    id: userRef.id,
    username: normalizedUsername,
    passcode,
    relationshipId: null,
    partnerId: null,
    createdAt: Date.now(),
  };

  await setDoc(userRef, {
    ...userAccount,
    createdAtServer: serverTimestamp(),
  });

  const session = toSession(userAccount);
  await saveUserSession(session);
  return session;
}

export async function signInUserAccount(
  username: string,
  passcode: string,
): Promise<UserSession> {
  const normalizedUsername = normalizeUsername(username);
  const userQuery = query(
    usersCollection,
    where('username', '==', normalizedUsername),
  );
  const snapshot = await getDocs(userQuery);

  if (snapshot.empty) {
    throw new Error('No account found with that username.');
  }

  const user = snapshot.docs[0].data() as UserAccount;

  if (user.passcode !== passcode) {
    throw new Error('Incorrect passcode.');
  }

  const session = toSession(user);
  await saveUserSession(session);
  return session;
}

export async function refreshUserSession(
  userId: string,
): Promise<UserSession | null> {
  const snapshot = await getDoc(doc(firestore, 'users', userId));

  if (!snapshot.exists()) {
    await clearUserSession();
    return null;
  }

  const session = toSession(snapshot.data() as UserAccount);
  await saveUserSession(session);
  return session;
}

export async function generateConnectionCode(userId: string): Promise<string> {
  const inviter = await getUserAccount(userId);

  if (!inviter) {
    throw new Error('Could not find your account.');
  }

  if (inviter.relationshipId) {
    throw new Error('Your account is already connected.');
  }

  const existingCodeQuery = query(
    connectionCodesCollection,
    where('inviterUserId', '==', userId),
    where('usedAt', '==', null),
  );
  const existingCodes = await getDocs(existingCodeQuery);
  const now = Date.now();

  for (const item of existingCodes.docs) {
    const codeData = item.data() as ConnectionCode;
    if (codeData.expiresAt > now) {
      return codeData.code;
    }
  }

  const code = await createUniqueConnectionCode();
  const codeRef = doc(firestore, 'connectionCodes', code);
  const connectionCode: ConnectionCode = {
    id: code,
    code,
    inviterUserId: userId,
    expiresAt: now + CONNECTION_CODE_TTL_MS,
    usedAt: null,
    createdAt: now,
  };

  await setDoc(codeRef, {
    ...connectionCode,
    createdAtServer: serverTimestamp(),
  });

  return code;
}

export async function redeemConnectionCode(
  userId: string,
  rawCode: string,
): Promise<UserSession> {
  const code = rawCode.trim().toUpperCase();
  const invitee = await getUserAccount(userId);

  if (!invitee) {
    throw new Error('Could not find your account.');
  }

  if (invitee.relationshipId) {
    throw new Error('Your account is already connected.');
  }

  const codeSnapshot = await getDoc(doc(firestore, 'connectionCodes', code));
  if (!codeSnapshot.exists()) {
    throw new Error('That code is not valid.');
  }

  const codeData = codeSnapshot.data() as ConnectionCode;

  if (codeData.usedAt) {
    throw new Error('That code has already been used.');
  }

  if (codeData.expiresAt < Date.now()) {
    throw new Error('That code has expired.');
  }

  if (codeData.inviterUserId === userId) {
    throw new Error('You cannot use your own code.');
  }

  const inviter = await getUserAccount(codeData.inviterUserId);
  if (!inviter) {
    throw new Error('The account that created this code no longer exists.');
  }

  if (inviter.relationshipId) {
    throw new Error('That person is already connected.');
  }

  const relationshipRef = doc(relationshipsCollection);
  const relationship: Relationship = {
    id: relationshipRef.id,
    memberIds: [inviter.id, invitee.id],
    createdAt: Date.now(),
  };

  await setDoc(relationshipRef, {
    ...relationship,
    createdAtServer: serverTimestamp(),
  });

  await updateDoc(doc(firestore, 'users', inviter.id), {
    relationshipId: relationship.id,
    partnerId: invitee.id,
  });

  await updateDoc(doc(firestore, 'users', invitee.id), {
    relationshipId: relationship.id,
    partnerId: inviter.id,
  });

  await updateDoc(doc(firestore, 'connectionCodes', code), {
    usedAt: Date.now(),
  });

  const updatedInviteeSession = {
    userId: invitee.id,
    username: invitee.username,
    relationshipId: relationship.id,
    partnerId: inviter.id,
  };

  await saveUserSession(updatedInviteeSession);
  return updatedInviteeSession;
}

export async function saveUserSession(session: UserSession) {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function getSavedUserSession(): Promise<UserSession | null> {
  const rawSession = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as Partial<UserSession>;
    if (!session.userId || !session.username) {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return {
      userId: session.userId,
      username: session.username,
      relationshipId: session.relationshipId ?? null,
      partnerId: session.partnerId ?? null,
    };
  } catch {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export async function clearUserSession() {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function getUserAccount(
  userId: string,
): Promise<UserAccount | null> {
  const userSnapshot = await getDoc(doc(firestore, 'users', userId));

  if (!userSnapshot.exists()) {
    return null;
  }

  return userSnapshot.data() as UserAccount;
}

export async function addMemory(memory: MemoryInput): Promise<Memory> {
  const id = memory.id ?? doc(memoriesCollection).id;
  const memoryDoc: Memory = {
    id,
    relationshipId: memory.relationshipId,
    authorId: memory.authorId,
    authorName: memory.authorName,
    title: memory.title,
    description: memory.description,
    date: memory.date,
    imageUrl: memory.imageUrl,
    createdAt: memory.createdAt ?? Date.now(),
  };

  await setDoc(doc(firestore, 'memories', id), {
    ...memoryDoc,
    createdAtServer: serverTimestamp(),
  });
  return memoryDoc;
}

export async function updateMemory(
  memoryId: string,
  memory: Partial<Pick<Memory, 'title' | 'description' | 'date' | 'imageUrl'>>,
): Promise<void> {
  await updateDoc(doc(firestore, 'memories', memoryId), memory);
}

export async function deleteMemory(memoryId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'memories', memoryId));
}

export async function getMemories(relationshipId: string): Promise<Memory[]> {
  const memoriesQuery = query(
    memoriesCollection,
    where('relationshipId', '==', relationshipId),
  );
  const snapshot = await getDocs(memoriesQuery);

  return snapshot.docs
    .map((item) => item.data() as Memory)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function uploadImage(file: string | Blob | File): Promise<string> {
  try {
    if (typeof file !== 'string') {
      throw new Error('Cloudinary upload expects a local image URI.');
    }

    const cloudName = getEnv('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME');
    const uploadPreset = getEnv('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    const compressedUri = await compressImageUri(file);
    const formData = new FormData();

    formData.append('file', {
      uri: compressedUri,
      name: extractFileName(compressedUri),
      type: 'image/jpeg',
    } as unknown as Blob);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'memories');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error('Cloudinary rejected the upload.');
    }

    const payload = (await response.json()) as { secure_url?: string };
    if (!payload.secure_url) {
      throw new Error('Cloudinary response did not include an image URL.');
    }

    return payload.secure_url;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Image upload failed.';
    throw new Error(
      `${message} Check Cloudinary env keys and upload preset settings.`,
    );
  }
}

async function compressImageUri(uri: string): Promise<string> {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1440 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );
  return compressed.uri;
}

async function createUniqueConnectionCode(): Promise<string> {
  while (true) {
    const nextCode = randomCode();
    const snapshot = await getDoc(doc(firestore, 'connectionCodes', nextCode));
    if (!snapshot.exists()) {
      return nextCode;
    }
  }
}

function toSession(user: UserAccount): UserSession {
  return {
    userId: user.id,
    username: user.username,
    relationshipId: user.relationshipId ?? null,
    partnerId: user.partnerId ?? null,
  };
}

function extractFileName(uri: string): string {
  const rawName = uri.split('/').pop() ?? `memory-${Date.now()}.jpg`;
  return rawName.split('?')[0] || `memory-${Date.now()}.jpg`;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < CONNECTION_CODE_LENGTH; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}
