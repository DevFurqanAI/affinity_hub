import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import postService from "../../services/postService.js";
import useAuthStore from "../../store/authStore.js";

function CreatePostBox({ onPostCreated }) {
  const user = useAuthStore((state) => state.user);

  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image upload is supported from this UI for now");
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!caption.trim() && !mediaFile) {
      toast.error("Post must have a caption or image");
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

      toast.success(result.message || "Post created successfully");

      setCaption("");
      setVisibility("public");
      setMediaFile(null);
      setMediaPreview("");

      onPostCreated?.(result.data?.post);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create post";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            avatarText
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="What's happening on Affinity Hub?"
            rows="3"
            maxLength={1000}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Add Image
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>

              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>

          {mediaPreview ? (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200">
              <img
                src={mediaPreview}
                alt="Post preview"
                className="max-h-96 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeMedia}
                className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-sm font-semibold text-white transition hover:bg-slate-950"
              >
                Remove
              </button>
            </div>
          ) : null}

          {isLoading ? <Loader text="Creating post..." /> : null}
        </form>
      </div>
    </section>
  );
}

export default CreatePostBox;