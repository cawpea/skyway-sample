import {
  FirebaseStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

export const getFileUrlFromStorage = async (
  storage: FirebaseStorage,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, path);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const createFileToStorage = async (
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> => {
  // const uniqueName = getFilenameWithDate(filename);
  const storageRef = ref(storage, path);
  await uploadBytesResumable(storageRef, file);
  const url = await getFileUrlFromStorage(storage, path);
  return url;
};
