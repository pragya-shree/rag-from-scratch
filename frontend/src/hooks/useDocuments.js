import { useCallback, useEffect, useState } from "react";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from "../services/api";

/**
 * Owns the uploaded-PDF list: fetching, uploading, deleting, and the
 * loading/error state around each of those actions. Kept separate from
 * chat state (useChat) since documents and conversation are different
 * concerns that happen to share a session.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch (err) {
      setError("Could not load documents.");
      console.error(err);
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
      setError(null);
      try {
        await uploadDocument(file);
        await refresh();
      } catch (err) {
        setError(`Could not upload "${file.name}".`);
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(async (filename) => {
    setError(null);
    try {
      await deleteDocument(filename);
      setDocuments((prev) => prev.filter((doc) => doc.filename !== filename));
    } catch (err) {
      setError(`Could not remove "${filename}".`);
      console.error(err);
    }
  }, []);

  return { documents, isLoading, isUploading, error, upload, remove, refresh };
}
