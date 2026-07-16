import { useCallback, useEffect, useState } from "react";
import { uploadDocument, listDocuments } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";

/**
 * Owns the uploaded-PDF list: fetching and uploading. There is no
 * delete/remove here — the backend has no DELETE /documents endpoint,
 * so the list is append-only from the frontend's perspective, matching
 * what the API actually supports.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  return {
    documents,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    upload,
    clearError: () => setError(null),
  };
}
