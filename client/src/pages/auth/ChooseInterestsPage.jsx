import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Loader from "../../components/common/Loader.jsx";
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
  }, []);

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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-xl font-black text-white">
            AH
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Choose your interests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Select at least 3 topics to personalize your Affinity Hub.
          </p>

          <p className="mt-2 text-sm font-bold text-slate-700">
            {selectedIds.length}/{MAX_INTERESTS} selected
          </p>
        </div>

        <Card>
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
                    className={`rounded-3xl border p-4 text-left transition ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold">
                      {interest.displayName || interest.name}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        isSelected ? "text-slate-200" : "text-slate-500"
                      }`}
                    >
                      {interest.description || "Personalize your recommendations."}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-6">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading || selectedIds.length < MIN_INTERESTS}
            >
              {isLoading ? "Saving..." : "Continue to Home"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default ChooseInterestsPage;