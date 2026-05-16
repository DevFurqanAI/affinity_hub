import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import storyService from "../../services/storyService.js";

function CreateStoryModal({ isOpen, onClose, onStoryCreated }) {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setCaption("");
    setMediaFile(null);
    setMediaPreview("");
    setMediaType("");
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Only image or video files are allowed");
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? "image" : "video");
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mediaFile) {
      toast.error("Please select an image or video for your story");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);

      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const result = await storyService.createStory(formData);

      toast.success(result.message || "Story created successfully");

      onStoryCreated?.(result.data?.story);

      resetForm();
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create story";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Story</h2>
            <p className="mt-1 text-sm text-slate-500">
              Share a moment for 24 hours.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-3 py-1 text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="cursor-pointer block rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:bg-slate-100">
              <p className="text-sm font-bold text-slate-900">
                Choose Image or Video
              </p>
              <p className="mt-1 text-xs text-slate-500">
                JPG, PNG, WEBP, MP4, WEBM, or MOV
              </p>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
          </div>

          {mediaPreview ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Story preview"
                  className="max-h-96 w-full object-cover"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-96 w-full"
                />
              )}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="caption"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Caption
            </label>

            <textarea
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows="3"
              maxLength={300}
              placeholder="Write a short caption..."
              className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {caption.length}/300
            </p>
          </div>

          {isLoading ? <Loader text="Uploading story..." /> : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Story"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStoryModal;