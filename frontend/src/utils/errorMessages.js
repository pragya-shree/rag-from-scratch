/**
 * Turns an Axios/fetch error into a short, friendly message — never the
 * raw exception. FastAPI's error responses are already human-readable
 * ({ detail: "..." }), so this mostly just extracts that; the fallback
 * branches cover cases where the backend couldn't be reached at all.
 */
export function getErrorMessage(error) {
  // Axios error with a JSON body from FastAPI: { detail: "..." }
  const detail = error?.response?.data?.detail;
  if (detail) return detail;

  // Axios error that reached the network but got no response at all
  if (error?.request && !error?.response) {
    return "Can't reach the backend. Is the server running?";
  }

  // Errors thrown manually in chatStream.js already carry a friendly message
  if (error?.message) return error.message;

  return "Something went wrong. Please try again.";
}
