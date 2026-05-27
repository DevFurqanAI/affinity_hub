import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import postService from "../../services/postService.js";
import useAuthStore from "../../store/authStore.js";

const OPEN_CREATE_POST_EVENT = "affinity-open-create-post";
const POST_CREATED_EVENT = "affinity-post-created";

function ImageIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-4.5-4.5L8 19" />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PlusIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function CreatePostBox({
  onPostCreated,
  triggerOnly = false,
  modalOnly = false
}) {
  const user = useAuthStore((state) => state.user);

  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  /*
  |--------------------------------------------------------------------------
  | Global Modal Listener
  |--------------------------------------------------------------------------
  | Only the global modal host should listen to the sidebar/composer event.
  | This prevents two modals opening at once on the Home page.
  */
  useEffect(() => {
    if (triggerOnly) {
      return undefined;
    }

    const handleOpenCreatePost = () => {
      setIsOpen(true);
    };

    window.addEventListener(OPEN_CREATE_POST_EVENT, handleOpenCreatePost);

    return () => {
      window.removeEventListener(
        OPEN_CREATE_POST_EVENT,
        handleOpenCreatePost
      );
    };
  }, [triggerOnly]);

  /*
  |--------------------------------------------------------------------------
  | Home Feed Update Listener
  |--------------------------------------------------------------------------
  | When the global modal creates a post, the visible Home composer can pass
  | the created post back to HomePage through its existing callback.
  */
  useEffect(() => {
    if (!triggerOnly || !onPostCreated) {
      return undefined;
    }

    const handlePostCreated = (event) => {
      onPostCreated(event.detail?.post);
    };

    window.addEventListener(POST_CREATED_EVENT, handlePostCreated);

    return () => {
      window.removeEventListener(POST_CREATED_EVENT, handlePostCreated);
    };
  }, [triggerOnly, onPostCreated]);

  useEffect(() => {
    return () => {
      if (mediaPreview.startsWith("blob:")) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) {
        resetForm();
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading]);

  const handleOpenModal = () => {
    window.dispatchEvent(new Event(OPEN_CREATE_POST_EVENT));
  };

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Only image or video upload is supported");
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
  };

  const resetForm = () => {
    setCaption("");
    setVisibility("public");
    setMediaFile(null);
    setMediaPreview("");
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    resetForm();
    setIsOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!caption.trim() && !mediaFile) {
      toast.error("Post must have a caption or media");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();

      formData.append("caption", caption);
      formData.append("visibility", visibility);

      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const result = await postService.createPost(formData);
      const createdPost = result.data?.post;

      toast.success(result.message || "Post created successfully");

      resetForm();
      setIsOpen(false);

      onPostCreated?.(createdPost);

      window.dispatchEvent(
        new CustomEvent(POST_CREATED_EVENT, {
          detail: {
            post: createdPost
          }
        })
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create post";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Timeline Composer Trigger: shown on Home only */}
      {!modalOnly ? (
        <button
          type="button"
          onClick={handleOpenModal}
          className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-left transition hover:bg-[var(--color-surface-muted)] sm:rounded-xl sm:px-4 sm:py-3"
        >
          <div className="shrink-0 rounded-full bg-gradient-to-tr from-[#fe3b6a] via-[#ff5a3b] to-[#ffaa3b] p-[2px]">
            <div className="rounded-full bg-[var(--color-surface)] p-[2px]">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-xs font-black text-[var(--color-text)] sm:h-9 sm:w-9">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[var(--color-text)]">
              Create Post
            </p>

            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)]">
              What would you like to share with the lounge?
            </p>
          </div>

          <PlusIcon className="h-5 w-5 shrink-0 text-amber-500 transition-transform group-hover:scale-110" />
        </button>
      ) : null}

      {/* Modal: mounted globally in MainLayout only */}
      {!triggerOnly && isOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
            className="max-h-[calc(100dvh-4rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-b-0 border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl sm:max-h-[92vh] sm:rounded-2xl sm:border-b"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">
                  Create Post
                </p>

                <h2
                  id="create-post-title"
                  className="mt-1 text-base font-black text-[var(--color-text)]"
                >
                  Publish to Affinity Hub
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Close create post"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:opacity-50"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 p-4 sm:space-y-4 sm:p-5">
              {/* Author Row */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-xs font-black text-[var(--color-text)]">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarText
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-[var(--color-text)]">
                    {user?.username ? `@${user.username}` : "Your profile"}
                  </p>

                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                    Share an update with your community
                  </p>
                </div>
              </div>

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="What would you like to share?"
                rows="4"
                maxLength={1000}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-rose-500 disabled:opacity-60"
              />

              <p className="-mt-2 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
                {caption.length}/1000
              </p>

              {/* Media Upload */}
              {!mediaPreview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-4 py-5 text-center transition hover:border-rose-500/60 hover:bg-rose-500/5 sm:py-8">
                  <ImageIcon className="h-7 w-7 text-rose-500" />

                  <span className="mt-3 text-xs font-black text-[var(--color-text)]">
                    Add image or video
                  </span>

                  <span className="mt-1 text-[10px] font-semibold text-[var(--color-text-muted)]">
                    JPG, PNG, WEBP, MP4, WEBM or MOV
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    onChange={handleMediaChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-black">
                  {mediaFile?.type?.startsWith("video/") ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="max-h-80 w-full object-contain"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Post preview"
                      className="max-h-80 w-full object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={removeMedia}
                    disabled={isLoading}
                    className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-black disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Visibility and Submit */}
              <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label
                    htmlFor="post-visibility"
                    className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
                  >
                    Visibility
                  </label>

                  <select
                    id="post-visibility"
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value)}
                    disabled={isLoading}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[var(--color-text)] outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>

              {isLoading ? <Loader text="Creating post..." /> : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CreatePostBox;