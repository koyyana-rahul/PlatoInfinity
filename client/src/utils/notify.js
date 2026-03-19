import toast from "react-hot-toast";

const DEFAULT_DEDUPE_MS = 1500;
const recentToasts = new Map();

const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}]/gu;
const CHECKMARK_REGEX = /[\u2713\u2705\u2714\u2718\u274C]/g;
const LEADING_MARKS_REGEX = /^[\s\u2713\u2705\u2714\u2718\u274C]+/;

const normalizeMessage = (message) => {
  if (message === undefined || message === null) return "";
  const text = String(message)
    .replace(EMOJI_REGEX, "")
    .replace(CHECKMARK_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .replace(LEADING_MARKS_REGEX, "")
    .trim();

  return text;
};

const getToastId = (type, message, options = {}) => {
  if (options.id) return options.id;
  if (options.dedupeKey) return `${type}:${options.dedupeKey}`;
  if (!message) return undefined;
  return `${type}:${message}`;
};

const shouldSkip = (id, dedupeMs) => {
  if (!id) return false;
  const now = Date.now();
  const last = recentToasts.get(id);
  if (last && now - last < dedupeMs) return true;
  recentToasts.set(id, now);
  return false;
};

const sanitizeOptions = (options = {}) => {
  const next = { ...options };
  if (typeof next.icon === "string" && EMOJI_REGEX.test(next.icon)) {
    delete next.icon;
  }
  delete next.dedupeKey;
  delete next.dedupeMs;
  return next;
};

const rawToast = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
  loading: toast.loading,
  promise: toast.promise,
};

const showWith = (method, type, message, options = {}) => {
  const cleanMessage = normalizeMessage(message);
  const dedupeMs = options.dedupeMs ?? DEFAULT_DEDUPE_MS;
  const id = getToastId(type, cleanMessage, options);

  if (shouldSkip(id, dedupeMs)) return id;

  return method(cleanMessage, {
    ...sanitizeOptions(options),
    id,
  });
};

export const installToastDefaults = () => {
  if (toast.__platoProfessional) return;
  toast.__platoProfessional = true;

  toast.success = (message, options) =>
    showWith(rawToast.success, "success", message, options);
  toast.error = (message, options) =>
    showWith(rawToast.error, "error", message, options);
  toast.info = (message, options) =>
    showWith(rawToast.info, "info", message, options);
  toast.loading = (message, options) =>
    showWith(rawToast.loading, "loading", message, options);
  toast.promise = (promise, messages, options = {}) => {
    const nextMessages = {
      loading: normalizeMessage(messages?.loading),
      success: normalizeMessage(messages?.success),
      error: normalizeMessage(messages?.error),
    };
    const id = options?.id;
    const dedupeKey = options?.dedupeKey;
    const cleanedOptions = sanitizeOptions({ ...options, id, dedupeKey });
    return rawToast.promise(promise, nextMessages, cleanedOptions);
  };
};

export const notify = {
  success: (message, options) =>
    showWith(rawToast.success, "success", message, options),
  error: (message, options) =>
    showWith(rawToast.error, "error", message, options),
  info: (message, options) => showWith(rawToast.info, "info", message, options),
  loading: (message, options) =>
    showWith(rawToast.loading, "loading", message, options),
  dismiss: (toastId) => toast.dismiss(toastId),
  promise: (promise, messages, options = {}) => {
    const nextMessages = {
      loading: normalizeMessage(messages?.loading),
      success: normalizeMessage(messages?.success),
      error: normalizeMessage(messages?.error),
    };
    const id = options?.id;
    const dedupeKey = options?.dedupeKey;
    const cleanedOptions = sanitizeOptions({ ...options, id, dedupeKey });
    return rawToast.promise(promise, nextMessages, cleanedOptions);
  },
};
