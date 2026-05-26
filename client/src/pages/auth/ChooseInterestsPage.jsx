import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import interestService from "../../services/interestService.js";
import useAuthStore from "../../store/authStore.js";
import {
  needsEmailVerification,
  needsProfileSetup,
  needsInterestsSetup
} from "../../utils/onboarding.js";

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 10;

function ChooseInterestsPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const completeInterests = useAuthStore((state) => state.completeInterests);

  const [interests, setInterests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    if (
      !isAuthenticated ||
      needsEmailVerification(user) ||
      needsProfileSetup(user) ||
      !needsInterestsSetup(user)
    ) {
      return undefined;
    }

    const loadInterests = async () => {
      try {
        setIsPageLoading(true);

        const result = await interestService.getInterests();

        setInterests(result.data?.interests || []);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load interests";

        toast.error(message);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadInterests();

    return undefined;
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsEmailVerification(user)) {
    return <Navigate to="/verify-email" replace />;
  }

  if (needsProfileSetup(user)) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!needsInterestsSetup(user)) {
    return <Navigate to="/home" replace />;
  }

  const toggleInterest = (interestId) => {
    setSelectedIds((previousSelectedIds) => {
      const alreadySelected = previousSelectedIds.includes(interestId);

      if (alreadySelected) {
        return previousSelectedIds.filter((id) => id !== interestId);
      }

      if (previousSelectedIds.length >= MAX_INTERESTS) {
        toast.error(`You can select up to ${MAX_INTERESTS} interests`);
        return previousSelectedIds;
      }

      return [...previousSelectedIds, interestId];
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length < MIN_INTERESTS) {
      toast.error(`Please select at least ${MIN_INTERESTS} interests`);
      return;
    }

    const success = await completeInterests(selectedIds);

    if (success) {
      navigate("/home", { replace: true });
    }
  };

  return (
    <AuthShell
      wide
      eyebrow="Personalize Your Timeline"
      title="Choose your interests"
      description="Select at least three topics to build a feed that feels relevant to you."
      footer={
        <p className="text-xs">
          You can discover more communities after entering Affinity Hub.
        </p>
      }
    >
      <div className="mb-7 flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            Final Step
          </p>

          <p className="mt-1 text-xs font-bold text-[var(--color-text)]">
            Select {MIN_INTERESTS} to {MAX_INTERESTS} interests
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-xs font-black text-[var(--color-text-muted)]">
            <span className="text-rose-500">{selectedIds.length}</span>/
            {MAX_INTERESTS} selected
          </p>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-7 rounded-full bg-rose-500" />
            <span className="h-1.5 w-7 rounded-full bg-rose-500" />
            <span className="h-1.5 w-7 rounded-full bg-rose-500" />
          </div>
        </div>
      </div>

      {isPageLoading ? <Loader text="Loading interests..." /> : null}

      {!isPageLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => {
            const isSelected = selectedIds.includes(interest._id);

            return (
              <button
                key={interest._id}
                type="button"
                onClick={() => toggleInterest(interest._id)}
                className={`relative min-h-28 rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-rose-500/40 bg-rose-500/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-rose-500/25 hover:bg-[var(--color-surface-elevated)]"
                }`}
              >
                {isSelected ? (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : null}

                <p
                  className={`pr-7 text-sm font-black ${
                    isSelected
                      ? "text-rose-500"
                      : "text-[var(--color-text)]"
                  }`}
                >
                  {interest.displayName || interest.name}
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                  {interest.description ||
                    "Personalize your recommendations."}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-7 flex justify-end">
        <Button
          className="w-full sm:w-auto sm:min-w-56 !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          onClick={handleSubmit}
          disabled={isLoading || selectedIds.length < MIN_INTERESTS}
        >
          {isLoading ? "Saving..." : "Continue to Home"}
        </Button>
      </div>
    </AuthShell>
  );
}

export default ChooseInterestsPage;