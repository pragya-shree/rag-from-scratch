import { useCallback, useEffect, useState } from "react";
import { uploadDocument, listDocuments, deleteDocument } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";

/**
 * Owns the uploaded-PDF list: fetching, uploading, and deleting.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingFilename, setDeletingFilename] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = useCallback(
    async (file) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      try {
        await uploadDocument(file, (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }
        });
        await refresh(); // backend re-ingests everything on every upload
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        return { success: false, message };
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (filename) => {
      setDeletingFilename(filename);
      setError(null);
      try {
        await deleteDocument(filename);
        await refresh(); // same pattern as upload(): trust the server's list, don't guess
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        return { success: false, message };
      } finally {
        setDeletingFilename(null);
      }
    },
    [refresh]
  );

  return {
    documents,
    isLoading,
    isUploading,
    uploadProgress,
    deletingFilename,
    error,
    upload,
    remove,
    clearError: () => setError(null),
  };
}
