import { useState, startTransition, useEffect, useRef } from "react";
import { AffinityHubLogo } from "../../components/AffinityHubLogo";
import {
  Home,
  Compass,
  Search,
  MessageSquare,
  Heart,
  Bookmark,
  Plus,
  MoreHorizontal,
  Image as ImageIcon,
  Sparkles,
  X,
  User as UserIcon,
  Shield,
  Palette,
  Settings,
  HelpCircle,
  Send,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Check
} from "lucide-react";

// Predefined gorgeous photography assets (Affinity Hub student campus views)
const PRESET_GRAPHICS = [
  {
    name: "Autonomous Robotics Lab",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    name: "Collaborative Design Space",
    url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    name: "Sunset Campus Binders",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    name: "Modern Code Workspace",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    name: "Quiet Library Lounge",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    name: "Brutalist Space Loft",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&h=600&q=80"
  }
];

// Rich, high-fidelity mock stories with colorful gradients
const INITIAL_STORIES = [
  {
    id: "self",
    name: "Your Story",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Building something incredible today. Code, design, and beautiful experiences.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&h=1000&q=80"
  },
  {
    id: "a_qahar1",
    name: "a_qahar1",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Lunch break view on the roof. Beautiful city line.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&h=1000&q=80"
  },
  {
    id: "atarabyte",
    name: "atarabyte",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Working on some neural architecture parameters. Exciting research coming up!",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=1000&q=80"
  },
  {
    id: "assim_lab",
    name: "assim_lab",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Sunset at the computer lab. Still parsing files...",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&h=1000&q=80"
  },
  {
    id: "laufey",
    name: "laufey",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Sipping coffee and looking over my database sheets.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&h=1000&q=80"
  },
  {
    id: "finneas",
    name: "finneas",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Synthesizer setups in the creative lounge.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&h=1000&q=80"
  },
  {
    id: "ahmadray",
    name: "ahmadray",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Just launched a new UI experiment! Tell me what you think.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=1000&q=80"
  }
];

// High fidelity social timeline posts
const INITIAL_POSTS = [
  {
    id: 1,
    author: {
      name: "airbusinesscircle",
      username: "airbusinesscircle",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
    },
    caption: "Air University Multan Campus presents BRANDSCAPE - Be the Brain behind the Brand! Join us in the collaborative auditorium tomorrow at 10 AM. Hosted by the Air Business Circle and aumc_startupclub! 🚀✨",
    media: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&h=600&q=80",
    likesCount: 56,
    commentsCount: 2,
    isLikedByMe: false,
    isBookmarked: false,
    time: "1w",
    comments: [
      { id: 101, author: "hamza", text: "This looks great! Looking forward to participating." },
      { id: 102, author: "ayesha", text: "Brilliant campaign layout, see you there!" }
    ],
    visibility: "public"
  },
  {
    id: 2,
    author: {
      name: "Furqan Arshad",
      username: "furqan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    },
    caption: "Polishing our academic Affinity Hub layout with smooth, hardware-accelerated animations, live floating client messengers, responsive double-tap-to-like mechanisms, and full-width customizable student profile view grid systems! Try hovering on the sidebar menu.",
    media: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=600&q=80",
    likesCount: 142,
    commentsCount: 1,
    isLikedByMe: true,
    isBookmarked: true,
    time: "2h",
    comments: [
      { id: 103, author: "maham", text: "The interactive messenger on the bottom right feels absolutely flawless!" }
    ],
    visibility: "public"
  },
  {
    id: 3,
    author: {
      name: "Ayesha Khan",
      username: "ayesha",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
    },
    caption: "Deep diving into UI design references. High-density grids paired with elegant micro-interactions make for pure bliss. Sunset views right outside the design lab workspace.",
    media: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=600&q=80",
    likesCount: 89,
    commentsCount: 0,
    isLikedByMe: false,
    isBookmarked: false,
    time: "1d",
    comments: [],
    visibility: "public"
  }
];

// Suggested accounts matching the screenshot
const SUGGESTED_ACCOUNTS_DUMMY = []; // Placeholder

export default function UiLabPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [activeView, setActiveView] = useState<"feed" | "explore" | "profile" | "settings" | "onboarding">("feed");
  
  // Hover state of sidebar triggers width expansion smoothly
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // States
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedTab, setSelectedFeedTab] = useState<"forYou" | "following">("forYou");

  // Notifications and Drawers
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "following" | "comments" | "follows">("all");

  // Replicated Recent Searches list matches first screenshot
  const [recentSearches, setRecentSearches] = useState([
    {
      id: "rec-1",
      type: "user",
      username: "b9_bis",
      displayName: "Bisma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "BisMa • Followed by rabiazeeshan786"
    },
    {
      id: "rec-2",
      type: "user",
      username: "am_organic_wonders",
      displayName: "AM Organic Wonders",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "AM Organic Wonders | Organic Hair & Skin Products",
      isVerified: true
    },
    {
      id: "rec-3",
      type: "query",
      query: "am organic wonders"
    },
    {
      id: "rec-4",
      type: "user",
      username: "am.organics",
      displayName: "AM .Organics",
      avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "AM .Organics"
    },
    {
      id: "rec-5",
      type: "user",
      username: "izzatrehman_",
      displayName: "izzat",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "izzat • Followed by saleha.khuram + 4 more"
    },
    {
      id: "rec-6",
      type: "user",
      username: "muhammad_izzat_ali_khan",
      displayName: "محمد عزت علی خان",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "محمد عزت علی خان 🌹"
    },
    {
      id: "rec-7",
      type: "user",
      username: "izzat_paints",
      displayName: "Izzat Rehman",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "Followed by iamrasba + 3 more"
    },
    {
      id: "rec-8",
      type: "user",
      username: "cooking__chaos_",
      displayName: "cooking_chaos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      subtext: "cooking_chaos • Followed by iamrasba + 3 more"
    }
  ]);

  // High-fidelity notifications state matches the seconds screenshot
  const [notifications, setNotifications] = useState([
    {
      id: "not-1",
      timePeriod: "today",
      type: "like",
      users: [
        { username: "b9_bis", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
        { username: "ahsan_nawazz26", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
      ],
      count: 9,
      text: " liked your story.",
      time: "1h",
      mediaPreview: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&h=150&q=80",
      category: "comments" // treated under likes & stories
    },
    {
      id: "not-2",
      timePeriod: "week",
      type: "like",
      users: [
        { username: "sarfarazali007_", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
        { username: "saleha.khuram", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" }
      ],
      count: 2,
      text: " liked your story.",
      time: "1d",
      mediaPreview: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&h=150&q=80",
      category: "comments"
    },
    {
      id: "not-3",
      timePeriod: "week",
      type: "like",
      users: [
        { username: "wistfulrms22", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
        { username: "arozekhan_", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" }
      ],
      count: 19,
      text: " liked your story.",
      time: "1d",
      mediaPreview: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=150&h=150&q=80",
      category: "comments"
    },
    {
      id: "not-4",
      timePeriod: "week",
      type: "follow_request",
      user: {
        username: "bilal_rajput_r",
        name: "Bilal Rajput",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
      },
      text: "requested to follow you.",
      time: "3d",
      status: "pending", // "pending" | "confirmed" | "deleted"
      category: "follows"
    },
    {
      id: "not-5",
      timePeriod: "week",
      type: "like",
      users: [
        { username: "b9_bis", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
        { username: "anosha.gul", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
      ],
      count: 2,
      text: " liked your story.",
      time: "4d",
      mediaPreview: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=150&h=150&q=80",
      category: "comments"
    },
    {
      id: "not-6",
      timePeriod: "week",
      type: "follow",
      user: {
        username: "hx.mm512",
        name: "hx.mm512",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
      },
      text: "started following you.",
      time: "5d",
      isFollowing: false,
      category: "follows"
    }
  ]);

  // New Post Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostMedia, setNewPostMedia] = useState("");
  const [composerVisibility, setComposerVisibility] = useState("public");

  // Active user profile state (customized for Furqan Arshad)
  const [displayName, setDisplayName] = useState("Furqan Arshad");
  const [username, setUsername] = useState("im_furqan._");
  const [bio, setBio] = useState("Student. Refining high-contrast frontend applications.");
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80");

  // Floating Heart Animation states mapping for feed post double-tap
  const [popHeartPostId, setPopHeartPostId] = useState<number | null>(null);

  // Saved bookmark notification toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Interactive Story Carousel Ref
  const storiesScrollContainer = useRef<HTMLDivElement>(null);

  // Interactive active story progress parameters
  const [activeStory, setActiveStory] = useState<typeof INITIAL_STORIES[0] | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Comments temporary state per post
  const [newCommentInputs, setNewCommentInputs] = useState<{ [postId: number]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: number]: boolean }>({});

  // Suggested accounts matching the screenshot exactly
  const [suggestedUsers, setSuggestedUsers] = useState([
    { id: 1, name: "Aima", username: "Aima", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80", note: "Followed by saleha.khuram + 1 more", isFollowing: false },
    { id: 2, name: "Computer Science...", username: "Computer Science...", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80", note: "Followed by muhammad._kf", isFollowing: false },
    { id: 3, name: "Duaa Hayat", username: "Duaa Hayat", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80", note: "Followed by izzatrehman_an", isFollowing: false },
    { id: 4, name: "Nasha Wanich", username: "Nasha Wanich", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80", note: "Followed by hx.mm512 and 1 more", isFollowing: false, isVerified: true },
    { id: 5, name: "Todd Smith", username: "Todd Smith", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80", note: "Suggested for you", isFollowing: false }
  ]);

  // Sliding search drawer state & More options overlay state
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Captcha firewall simulation
  const [captchaStatus, setCaptchaStatus] = useState<"idle" | "verifying" | "complete">("idle");
  const [captchaVal, setCaptchaVal] = useState(10);

  // Edit profile dialog
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Settings view inner sub-tab matching mock-screen aesthetics
  const [settingsInnerTab, setSettingsInnerTab] = useState<"edit-profile" | "change-avatar" | "theme-preferences">("edit-profile");

  // Slideshow progress bar trigger for active stories
  useEffect(() => {
    let timer: any;
    if (activeStory) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress((p) => {
          if (p >= 100) {
            setActiveStory(null);
            return 0;
          }
          return p + 2.5;
        });
      }, 100);
    } else {
      setStoryProgress(0);
    }
    return () => clearInterval(timer);
  }, [activeStory]);

  // Set a few second timer on the notification so that it appears after the page fully loads and disappears after a few seconds
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setHasUnreadNotification(true);
      
      const hideTimer = setTimeout(() => {
        setHasUnreadNotification(false);
      }, 5000); // Auto-hide after 5 seconds

      return () => clearTimeout(hideTimer);
    }, 3000); // Shows after 3 seconds on page load

    return () => clearTimeout(showTimer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const l = !p.isLikedByMe;
          return {
            ...p,
            isLikedByMe: l,
            likesCount: l ? p.likesCount + 1 : p.likesCount - 1
          };
        }
        return p;
      })
    );
  };

  const handleDoubleTapLike = (postId: number) => {
    setPopHeartPostId(postId);
    // Force like status
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && !p.isLikedByMe) {
          return {
            ...p,
            isLikedByMe: true,
            likesCount: p.likesCount + 1
          };
        }
        return p;
      })
    );
    setTimeout(() => {
      setPopHeartPostId(null);
    }, 850);
  };

  const handleBookmark = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const b = !p.isBookmarked;
          triggerToast(b ? "Link bookmarked into Saved collection!" : "Bookmark removed.");
          return { ...p, isBookmarked: b };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: number) => {
    const text = newCommentInputs[postId] || "";
    if (!text.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [
              ...p.comments,
              { id: Date.now(), author: "furqan", text: text }
            ]
          };
        }
        return p;
      })
    );

    setNewCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    triggerToast("Comment added cleanly.");
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) {
      triggerToast("Please add visual captions first.");
      return;
    }

    const nId = posts.length + 1;
    const item = {
      id: nId,
      author: {
        name: displayName,
        username: "furqan",
        avatar: avatar
      },
      caption: newPostText,
      media: newPostMedia || null,
      likesCount: 0,
      commentsCount: 0,
      isLikedByMe: false,
      isBookmarked: false,
      time: "Just now",
      comments: [],
      visibility: composerVisibility
    };

    setPosts([item, ...posts]);
    setNewPostText("");
    setNewPostMedia("");
    setShowCreateModal(false);
    triggerToast("Idea published onto central feed!");
  };

  const handleToggleFollow = (id: number, usernameStr: string) => {
    setSuggestedUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = !u.isFollowing;
          triggerToast(next ? `Now following @${usernameStr}` : `Unfollowed @${usernameStr}`);
          return { ...u, isFollowing: next };
        }
        return u;
      })
    );
  };

  const startCaptchaChallenge = () => {
    if (captchaStatus === "complete") return;
    setCaptchaStatus("verifying");
    setCaptchaVal(10);
    const pulse = setInterval(() => {
      setCaptchaVal((v) => {
        if (v >= 100) {
          clearInterval(pulse);
          setCaptchaStatus("complete");
          triggerToast("Cloudflare Security check passed! Secure connection created.");
          return 100;
        }
        return v + 15;
      });
    }, 120);
  };

  const scrollStories = (direction: "left" | "right") => {
    if (storiesScrollContainer.current) {
      const scrollAmt = direction === "left" ? -280 : 280;
      storiesScrollContainer.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  const renderNotificationItem = (not: any) => {
    if (not.status === "deleted") return null;

    return (
      <div key={not.id} className="flex items-center justify-between gap-3 text-xs py-1.5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Circular avatar head(s) */}
          {not.users ? (
            <div className="relative w-10 h-10 shrink-0">
              <img
                src={not.users[0].avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-white dark:border-zinc-950 absolute top-0 left-0 z-10"
              />
              <img
                src={not.users[1]?.avatar || not.users[0].avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-white dark:border-zinc-950 absolute bottom-0 right-0"
              />
            </div>
          ) : (
            <img
              src={not.user.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-850 shrink-0 shadow-xs"
            />
          )}

          {/* Action description text */}
          <div className="text-left leading-normal min-w-0 flex-1 mt-0.5">
            <p className={`${isDark ? "text-zinc-100" : "text-neutral-900"}`}>
              {not.users ? (
                <span className="font-bold">
                  {not.users[0].username} and {not.count} others
                </span>
              ) : (
                <span className="font-bold">{not.user.username}</span>
              )}
              <span className={`${isDark ? "text-zinc-300" : "text-neutral-600"} font-medium`}>
                {not.status === "confirmed" ? " Follow request approved." : not.text}
              </span>
              <span className="text-zinc-500 font-mono text-[9px] ml-1">{not.time}</span>
            </p>
          </div>
        </div>

        {/* Action item on right side */}
        <div className="shrink-0">
          {not.status === "pending" ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => n.id === not.id ? { ...n, status: "confirmed" } : n));
                  triggerToast(`Approved follow request from @${not.user.username}`);
                }}
                className="px-3 py-1.5 bg-[#0095f6] hover:bg-blue-600 text-white font-extrabold rounded-lg text-[10px] tracking-wide transition-all cursor-pointer leading-tight"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => n.id === not.id ? { ...n, status: "deleted" } : n));
                  triggerToast("Follow request ignored.");
                }}
                className={`px-3 py-1.5 font-bold rounded-lg text-[10px] transition-all cursor-pointer leading-tight ${
                  isDark
                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-750"
                    : "bg-neutral-100 text-neutral-800 hover:bg-[#e4e4e6]"
                }`}
              >
                Delete
              </button>
            </div>
          ) : not.type === "follow" ? (
            <button
              onClick={() => {
                setNotifications(prev => prev.map(n => n.id === not.id ? { ...n, isFollowing: !n.isFollowing } : n));
                triggerToast(not.isFollowing ? `Unfollowed @${not.user.username}` : `Following @${not.user.username}`);
              }}
              className={`px-3.5 py-1.5 font-bold rounded-lg text-[10px] transition-all cursor-pointer shrink-0 leading-tight ${
                not.isFollowing
                  ? (isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-750" : "bg-neutral-100 text-neutral-800 hover:bg-[#e4e4e6]")
                  : "bg-[#0095f6] text-white hover:bg-blue-600"
              }`}
            >
              {not.isFollowing ? "Following" : "Follow"}
            </button>
          ) : not.mediaPreview ? (
            <button
              onClick={() => {
                const s = stories.find(st => st.id === "self");
                if (s) {
                  setActiveStory(s);
                  triggerToast("Playing story update preview.");
                }
              }}
              className="w-10 h-10 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <img src={not.mediaPreview} alt="" className="w-full h-full object-cover" />
            </button>
          ) : null}
        </div>
      </div>
    );
  };



  // Filter based on Search key or timeline bookmarks query
  const displayedPosts = posts.filter((p) => {
    const s = searchQuery.toLowerCase().trim();
    if (s) {
      return (
        p.caption.toLowerCase().includes(s) ||
        p.author.username.toLowerCase().includes(s)
      );
    }
    if (selectedFeedTab === "following") return p.author.username !== "furqan";
    return true; // "forYou" shows everything
  });

  const isDark = themeMode === "dark";

  return (
    <div
      id="root-ui-container"
      className={`min-h-screen text-sm transition-colors duration-300 antialiased selection:bg-rose-500/30 font-sans ${
        isDark ? "bg-[#000000] text-zinc-100" : "bg-[#ffffff] text-neutral-900"
      }`}
    >
      
      {/* GLOBAL TOAST BANNER */}
      {toastMsg && (
        <div
          id="global-visual-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center bg-zinc-950 border border-zinc-900 text-neutral-100 rounded-lg px-4.5 py-3 shadow-2xl text-xs font-semibold animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500 mr-2.5 shrink-0 animate-spin" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-3 text-zinc-500 hover:text-zinc-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PARENT FLEX VIEW CHASSIS */}
      <div className="flex min-h-screen relative">
        
        {/* LEFT HOVERABLE INSTAGRAM-STYLE EXPANSED SIDEBAR */}
        <aside
          id="instagram-sidebar"
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col justify-between border-r transition-all duration-300 ease-in-out select-none ${
            (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "w-[244px]" : "w-[72px]"
          } ${
            isDark 
              ? "bg-[#000000] border-zinc-900" 
              : "bg-[#ffffff] border-neutral-200"
          }`}
        >
          {/* BRAND LOGO SPACE */}
          <div className="p-4 pt-7 flex flex-col items-start px-5">
            <div 
              onClick={() => {
                setSearchDrawerOpen(false);
                setNotificationOpen(false);
                setActiveView("feed");
                triggerToast("Navigated to Home Timeline Feed.");
              }}
              className="flex items-center gap-3.5 cursor-pointer w-full select-none"
            >
              {/* Collapsed logo glyph vs Expanded branding text */}
              <AffinityHubLogo className="w-9 h-9 shrink-0" />
              
              <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap origin-left ${
                (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
              }`}>
                <span className="text-sm font-black tracking-tight uppercase bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-transparent leading-none">
                  Affinity Hub
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 leading-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  Student Lounge
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC NAVIGATION LINKS */}
          <div className="flex-1 px-3 py-6 space-y-1.5 flex flex-col justify-start">
            
            {/* BUTTON: HOME */}
            <button
              id="sidebar-btn-home"
              onClick={() => {
                setSearchDrawerOpen(false);
                setNotificationOpen(false);
                startTransition(() => {
                  setActiveView("feed");
                  setSelectedFeedTab("forYou");
                });
              }}
              className={`w-full flex items-center gap-4.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-205 group relative ${
                activeView === "feed" && !searchDrawerOpen && !notificationOpen
                  ? "bg-zinc-900/[0.08] text-black dark:bg-zinc-900 dark:text-white font-black"
                  : isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-950"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <Home className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                activeView === "feed" && !searchDrawerOpen && !notificationOpen ? "text-rose-500" : ""
              }`} />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ${
                (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
              }`}>
                Home
              </span>
            </button>

            {/* BUTTON: SEARCH (Opens modern sliding Search Drawer on left side) */}
            <button
              id="sidebar-btn-search"
              onClick={() => {
                setSearchDrawerOpen(!searchDrawerOpen);
                setNotificationOpen(false);
              }}
              className={`w-full flex items-center gap-4.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-205 group relative ${
                searchDrawerOpen
                  ? "bg-zinc-900/[0.08] text-black dark:bg-zinc-900 dark:text-white font-black"
                  : isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-950"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <Search className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                searchDrawerOpen ? "text-rose-500" : ""
              }`} />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ${
                (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
              }`}>
                Search
              </span>
            </button>

            {/* BUTTON: EXPLORE */}
            <button
              id="sidebar-btn-explore"
              onClick={() => {
                setSearchDrawerOpen(false);
                setNotificationOpen(false);
                startTransition(() => {
                  setActiveView("explore");
                });
              }}
              className={`w-full flex items-center gap-4.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-205 group relative ${
                activeView === "explore" && !searchDrawerOpen && !notificationOpen
                  ? "bg-zinc-900/[0.08] text-black dark:bg-zinc-900 dark:text-white font-black"
                  : isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-950"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <Compass className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                activeView === "explore" && !searchDrawerOpen && !notificationOpen ? "text-rose-500" : ""
              }`} />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ${
                (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
              }`}>
                Explore
              </span>
            </button>

            {/* BUTTON: NOTIFICATIONS */}
            <div className="relative w-full">
              <button
                id="sidebar-btn-notifications"
                onClick={() => {
                  setSearchDrawerOpen(false);
                  setNotificationOpen(!notificationOpen);
                  setHasUnreadNotification(false);
                  triggerToast("Peer notifications panel.");
                }}
                className={`w-full flex items-center gap-4.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-205 group ${
                  notificationOpen
                    ? "bg-zinc-900/[0.08] text-black dark:bg-zinc-900 dark:text-white font-black"
                    : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-950"
                      : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <div className="relative shrink-0">
                  <Heart className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                    notificationOpen ? "text-rose-500 fill-rose-500" : ""
                  }`} />
                  {hasUnreadNotification && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-650 border border-white dark:border-zinc-955 flex items-center justify-center text-[8px] text-white font-extrabold animate-pulse">
                      1
                    </span>
                  )}
                </div>
                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ${
                  (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
                }`}>
                  Notifications
                </span>
              </button>
            </div>

            {/* BUTTON: CREATE POST */}
            <button
              id="sidebar-btn-create"
              onClick={() => {
                setSearchDrawerOpen(false);
                setNotificationOpen(false);
                setShowCreateModal(true);
              }}
              className={`w-full flex items-center gap-4.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-205 group relative ${
                isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-950" : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <PlusCircle className="w-5 h-5 text-amber-500 hover:scale-110 transition-transform shrink-0" />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ${
                (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
              }`}>
                Create
              </span>
            </button>

            {/* BUTTON: USER VIEW PROFILE */}
            <button
              id="sidebar-btn-profile"
              onClick={() => {
                setSearchDrawerOpen(false);
                setNotificationOpen(false);
                startTransition(() => {
                  setActiveView("profile");
                });
              }}
              className={`w-full flex items-center gap-4.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-205 group relative ${
                activeView === "profile" && !searchDrawerOpen && !notificationOpen
                  ? "bg-zinc-900/[0.08] text-black dark:bg-zinc-900 dark:text-white font-black"
                  : isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-950"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <img
                src={avatar}
                alt="Me mini avatar outline"
                className={`w-6.5 h-6.5 rounded-full object-cover border-2 transition-transform duration-205 group-hover:scale-105 shrink-0 ${
                  activeView === "profile" && !searchDrawerOpen && !notificationOpen ? "border-rose-500" : "border-zinc-800"
                }`}
              />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ml-0.5 ${
                (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
              }`}>
                Profile
              </span>
            </button>

          </div>

          {/* LOWER SYSTEM PREFERENCE OPTIONS */}
          <div className="p-3.5 space-y-2">
            
            {/* BUTTON: MORE (Settings, Switch Appearance, Log out Popup) */}
            <div className="relative">
              <button
                id="sidebar-btn-more"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`w-full flex items-center gap-4.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-205 group relative ${
                  moreMenuOpen || activeView === "settings"
                    ? "bg-zinc-900/[0.08] text-black dark:bg-zinc-900 dark:text-white font-black"
                    : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-950"
                      : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <MoreHorizontal className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0" />
                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden origin-left ${
                  (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
                }`}>
                  More
                </span>
              </button>

              {/* FLOATING CONTEXT MENU FOR MORE OPTIONS */}
              {moreMenuOpen && (
                <div
                  className={`absolute bottom-full left-1 mb-2.5 w-56 rounded-2xl shadow-2xl border p-1.5 z-55 animate-in slide-in-from-bottom-2 duration-200 ${
                    isDark ? "bg-[#09090b] border-zinc-850 text-neutral-100" : "bg-[#ffffff] border-neutral-250 text-black shadow-xl"
                  }`}
                >
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setSearchDrawerOpen(false);
                      setNotificationOpen(false);
                      setActiveView("settings");
                      triggerToast("Opened configuration settings panel.");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer select-none transition-colors ${
                      isDark ? "hover:bg-zinc-900 text-zinc-300 hover:text-white" : "hover:bg-neutral-100 text-neutral-700 hover:text-black"
                    }`}
                  >
                    <Settings className="w-4.5 h-4.5 text-zinc-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setThemeMode(isDark ? "light" : "dark");
                      triggerToast(`Switched workspace to ${isDark ? "Light" : "Dark"} mode.`);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer select-none transition-colors ${
                      isDark ? "hover:bg-zinc-900 text-zinc-300 hover:text-white" : "hover:bg-neutral-100 text-neutral-700 hover:text-black"
                    }`}
                  >
                    <Palette className="w-4.5 h-4.5 text-amber-500" />
                    <span>Switch Appearance</span>
                  </button>

                  <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-1.5" />

                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      triggerToast("Offline simulation: log out complete.");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer select-none transition-colors text-rose-500 ${
                      isDark ? "hover:bg-rose-950/20" : "hover:bg-rose-50"
                    }`}
                  >
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer stamp (smooth vertical collapse on collapse) */}
            <div className={`px-3.5 text-[9px] text-[#888] border-t border-zinc-200 dark:border-zinc-900/80 pt-3 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap origin-bottom ${
              (sidebarHovered && !searchDrawerOpen && !notificationOpen) ? "opacity-100 max-h-16 mt-2 pb-1" : "opacity-0 max-h-0 py-0 mt-0 pointer-events-none border-transparent"
            }`}>
              <p className="font-sans leading-none text-zinc-500">Affinity Core Platform</p>
              <p className="text-zinc-650 tracking-wide mt-1.5">© 2026 AFFINITY HUB</p>
            </div>
          </div>
        </aside>

        {/* SLIDING INSTAGRAM-STYLE LEFT SEARCH DRAWER */}
        {searchDrawerOpen && (
          <>
            {/* Click-away backdrop overlay */}
            <div
              className="fixed inset-0 z-30 bg-black/15 dark:bg-black/50 animate-fade-in duration-200"
              onClick={() => setSearchDrawerOpen(false)}
            />
            <div
              id="instagram-search-drawer"
              className={`fixed top-0 bottom-0 left-[72px] w-[390px] z-40 border-r shadow-2wrap flex flex-col p-6 animate-in slide-in-from-left duration-300 ${
                isDark ? "bg-[#000000] border-zinc-900 text-white" : "bg-[#ffffff] border-[#efefef] text-black"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold tracking-tight px-1">Search</h2>
                <button
                  onClick={() => setSearchDrawerOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search query field exactly matching mock screen */}
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs pl-10 pr-9 py-2.5 rounded-lg focus:outline-none transition-all ${
                    isDark
                      ? "bg-zinc-900 text-white border border-transparent focus:bg-zinc-850"
                      : "bg-[#f5f5f5] text-black border border-transparent focus:bg-[#ebebeb] font-semibold"
                  }`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Drawer results container matching mock screen */}
              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {searchQuery ? (
                  <>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold px-1">
                      Found Results
                    </p>
                    <div className="space-y-3">
                      {displayedPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            setSearchDrawerOpen(false);
                            setActiveView("feed");
                            triggerToast(`Viewing post by @${post.author.username}`);
                          }}
                          className={`p-3 rounded-xl border select-none cursor-pointer transition-colors flex gap-3.5 items-center ${
                            isDark ? "bg-zinc-950 border-zinc-900 hover:bg-zinc-900" : "bg-[#fafafa] border-[#efefef] hover:bg-[#f2f2f2]"
                          }`}
                        >
                          <img
                            src={post.author.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <span className="text-xs font-black text-rose-500 block leading-none">@{post.author.username}</span>
                            <p className="text-[11px] text-zinc-400 leading-normal truncate mt-1">{post.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold">Recent</span>
                      {recentSearches.length > 0 && (
                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            triggerToast("Cleared all recent searches.");
                          }}
                          className="text-xs text-[#0095f6] hover:text-[#005f96] font-bold"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {recentSearches.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 dark:text-zinc-500">
                        <p className="text-xs font-semibold">No recent searches.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentSearches.map((item) => (
                          <div key={item.id} className="flex items-center justify-between group">
                            {item.type === "query" ? (
                              <div
                                className="flex-1 flex items-center gap-3 cursor-pointer"
                                onClick={() => {
                                  setSearchQuery(item.query || "");
                                }}
                              >
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                                  isDark ? "bg-[#262626]" : "bg-neutral-100"
                                }`}>
                                  <Search className={`w-5 h-5 ${isDark ? "text-zinc-200" : "text-neutral-700"}`} />
                                </div>
                                <div className="text-left">
                                  <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                                    {item.query}
                                  </p>
                                  <p className="text-[11px] text-zinc-400">Search query</p>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="flex-1 flex items-center gap-3 cursor-pointer"
                                onClick={() => {
                                  setSearchQuery(item.username || "");
                                }}
                              >
                                <img
                                  src={item.avatar}
                                  alt=""
                                  className="w-11 h-11 rounded-full object-cover shrink-0 border border-zinc-250 dark:border-zinc-800"
                                />
                                <div className="text-left flex-1 min-w-0">
                                  <p className={`text-sm font-semibold truncate flex items-center gap-1 ${isDark ? "text-white" : "text-neutral-900"}`}>
                                    <span>{item.username}</span>
                                    {item.isVerified && (
                                      <span className="w-3 h-3 rounded-full bg-sky-500 text-white flex items-center justify-center text-[7px]" title="Verified">✓</span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 truncate pr-2">{item.subtext}</p>
                                </div>
                              </div>
                            )}
                            
                            <button
                              onClick={() => {
                                setRecentSearches(recentSearches.filter(r => r.id !== item.id));
                                triggerToast("Removed from history.");
                              }}
                              className="text-zinc-500 hover:text-rose-500 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* SLIDING INSTAGRAM-STYLE LEFT NOTIFICATIONS DRAWER */}
        {notificationOpen && (
          <>
            {/* Click-away backdrop overlay */}
            <div
              className="fixed inset-0 z-30 bg-black/15 dark:bg-black/50 animate-fade-in duration-200"
              onClick={() => setNotificationOpen(false)}
            />
            <div
              id="instagram-notifications-drawer"
              className={`fixed top-0 bottom-0 left-[72px] w-[390px] z-40 border-r shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300 ${
                isDark ? "bg-[#000000] border-zinc-900 text-white" : "bg-[#ffffff] border-[#efefef] text-black"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold tracking-tight px-1 font-sans">Notifications</h2>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white animate-pulse"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Category Tabs / Chips matching second screenshot */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-zinc-150 dark:border-zinc-900 no-scrollbar select-none">
                {[
                  { key: "all", label: "All" },
                  { key: "following", label: "Following" },
                  { key: "comments", label: "Comments" },
                  { key: "follows", label: "Followers" }
                ].map((chip) => {
                  const active = notifFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => {
                        setNotifFilter(chip.key as any);
                        triggerToast(`Filtered notifications: ${chip.label}`);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-150 cursor-pointer select-none leading-none ${
                        active
                          ? (isDark ? "bg-white text-black" : "bg-black text-white")
                          : (isDark ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Follow Requests group card on top */}
              {notifFilter !== "comments" && (
                <div
                  onClick={() => {
                    setNotifFilter("follows");
                    triggerToast("Filtered to Followers requests.");
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2.5 ${
                    isDark ? "bg-zinc-950 hover:bg-zinc-900/80" : "bg-[#fcfcfc] hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center shrink-0">
                      <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-[#fe3b6a] to-[#ffaa3b] z-10 shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
                          alt="Pending request 1"
                          className="w-7 h-7 rounded-full object-cover border border-white dark:border-black"
                        />
                      </div>
                      <div className="absolute top-0 left-4 p-[1.5px] rounded-full bg-gradient-to-tr from-[#fe3b6a] to-[#ffaa3b] shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                          alt="Pending request 2"
                          className="w-7 h-7 rounded-full object-cover border border-white dark:border-black"
                        />
                      </div>
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white dark:border-black absolute -bottom-1 -right-1 flex items-center justify-center text-[7px] text-white font-extrabold shadow z-20">
                        1
                      </span>
                    </div>
                    <div className="text-left ml-4">
                      <p className="text-xs font-bold leading-none">Follow requests</p>
                      <p className={`text-[10px] mt-1 ${isDark ? "text-zinc-500" : "text-neutral-500"}`}>
                        Approve or ignore requests
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isDark ? "text-zinc-650" : "text-neutral-400"}`} />
                </div>
              )}

              {/* Notifications scroll list */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar mt-2">
                {(() => {
                  const filtered = notifications.filter((not) => {
                    if (notifFilter === "all") return true;
                    if (notifFilter === "following") return not.type === "like";
                    if (notifFilter === "comments") return not.category === "comments";
                    if (notifFilter === "follows") return not.category === "follows";
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                        <p className="text-xs italic font-medium">No notifications matching criteria</p>
                      </div>
                    );
                  }

                  const todayItems = filtered.filter(f => f.timePeriod === "today");
                  const weekItems = filtered.filter(f => f.timePeriod === "week");

                  return (
                    <div className="space-y-4">
                      {/* Today Section */}
                      {todayItems.length > 0 && (
                        <div>
                          <p className={`text-xs font-extrabold px-1 mb-2.5 ${isDark ? "text-zinc-400" : "text-neutral-500"}`}>
                            Today
                          </p>
                          <div className="space-y-3.5">
                            {todayItems.map((not) => renderNotificationItem(not))}
                          </div>
                        </div>
                      )}

                      {/* This Week Section */}
                      {weekItems.length > 0 && (
                        <div className="pt-2">
                          <p className={`text-xs font-extrabold px-1 mb-2.5 ${isDark ? "text-zinc-400" : "text-neutral-500"}`}>
                            This week
                          </p>
                          <div className="space-y-3.5">
                            {weekItems.map((not) => renderNotificationItem(not))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {/* MAIN BODY LAYOUT AREA: OFFSET WIDTH TO PREVENT OVERLAP */}
        <div id="timeline-body-wrapper" className="flex-1 pl-[72px] min-h-screen flex flex-col justify-between">
          
          <div>
            {/* HERO UPPER SECTION BANNER */}
            <header className={`px-6 md:px-12 py-5 border-b sticky top-0 h-20 backdrop-blur-md z-30 flex items-center ${
              isDark ? "border-zinc-900 text-zinc-200 bg-[#000000]/85" : "bg-white/95 border-neutral-200 text-neutral-950"
            }`}>
              <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
                <main>
                  <p className="text-[9px] text-rose-500 tracking-widest font-extrabold uppercase font-mono leading-none">
                    Air University Sandbox
                  </p>
                  <h1 className={`text-base font-bold tracking-tight mt-1 flex items-center gap-2 ${
                    isDark ? "text-neutral-50" : "text-black"
                  }`}>
                    <span>Affinity Central Timeline</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md animate-ping" title="Service synchronous online" />
                  </h1>
                </main>

                <div className="flex items-center gap-3">
                  {searchQuery && (
                    <span className="bg-[#fe3b6a]/10 text-[#fe3b6a] border border-[#fe3b6a]/20 px-2 rounded-lg text-[10px] font-mono py-1 flex items-center gap-1.5 animate-pulse">
                      "{searchQuery.slice(0, 10)}"
                      <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSearchQuery("")} />
                    </span>
                  )}
                </div>
              </div>
            </header>

            {/* INTEGRATED ROUTER VIEWS GRID CONTROLLERS */}
            <div className="max-w-4xl mx-auto px-6 py-6 md:py-8">
              
              {/* DYNAMIC SHAPE-SHIFT GRID: Home View splits into 2 columns (posts 8, recommendations 4)
                  While Profile, Explore, Settings use 12 columns for an elegant and clean desktop display!
              */}
              <div className={`grid grid-cols-1 gap-8 ${activeView === "feed" ? "lg:grid-cols-12" : "grid-cols-1"}`}>
                
                {/* ACTIVE TAB CONTAINER */}
                <div className={`${activeView === "feed" ? "lg:col-span-8 space-y-8" : "w-full"}`}>
                  
                  {/* VIEW 1: DISPATCH FEED WITH MULTIPLE STORIES CAROUSEL */}
                  {activeView === "feed" && (
                    <div className="space-y-6.5 animate-in fade-in duration-300">
                      
                      {/* STORY ROW WRAPPER WITH NEXT/PREV TRANSITS AS DIRECTED BY THE KEY SCREENSHOT */}
                      <div className="relative group/stories">
                        
                        {/* LEFT NAV CHEVRON */}
                        <button
                          onClick={() => scrollStories("left")}
                          className="absolute -left-3 top-7 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-neutral-900 text-white flex items-center justify-center border border-zinc-805 shadow-xl transition-all opacity-0 group-hover/stories:opacity-100 active:scale-90"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div
                          ref={storiesScrollContainer}
                          className="flex items-center gap-4.5 overflow-x-auto pb-3 mx-1 no-scrollbar select-none scroll-smooth"
                        >
                          {stories.map((st) => {
                            const isSelf = st.id === "self";
                            return (
                              <div
                                key={st.id}
                                onClick={() => {
                                  setActiveStory(st);
                                  triggerToast(`Streaming update from @${st.name}`);
                                }}
                                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 transition-transform active:scale-95 group/avatar"
                              >
                                {/* Gradient circular ring autour user avatar image */}
                                <div className="relative">
                                  <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 hover:rotate-6 transition-all duration-300">
                                    <div className="p-[2.5px] bg-black rounded-full">
                                      <img
                                        src={st.avatar}
                                        alt={st.name}
                                        className="w-13 h-13 rounded-full object-cover group-hover/avatar:brightness-110 transition-all"
                                      />
                                    </div>
                                  </div>
                                  {isSelf && (
                                    <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-black flex items-center justify-center shadow-lg">
                                      <Plus className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-400 font-bold truncate max-w-[66px] leading-tight text-center">
                                  {st.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* RIGHT NAV CHEVRON */}
                        <button
                          onClick={() => scrollStories("right")}
                          className="absolute -right-3 top-7 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-neutral-900 text-white flex items-center justify-center border border-zinc-805 shadow-xl transition-all opacity-0 group-hover/stories:opacity-100 active:scale-90"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* SOCIAL TIMELINE SELECTION MARKERS */}
                      <div className="flex items-center gap-6 border-b border-zinc-900 pb-0.5 mt-2">
                        <button
                          onClick={() => setSelectedFeedTab("forYou")}
                          className={`pb-2 px-1 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            selectedFeedTab === "forYou"
                              ? "text-rose-500 border-b-2 border-rose-500"
                              : "text-zinc-500 hover:text-zinc-200"
                          }`}
                        >
                          🔥 For You
                        </button>
                        <button
                          onClick={() => setSelectedFeedTab("following")}
                          className={`pb-2 px-1 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            selectedFeedTab === "following"
                              ? "text-rose-500 border-b-2 border-rose-500"
                              : "text-zinc-500 hover:text-zinc-200"
                          }`}
                        >
                          👥 Following
                        </button>
                        <button
                          onClick={() => setSelectedFeedTab("bookmarks")}
                          className={`pb-2 px-1 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            selectedFeedTab === "bookmarks"
                              ? "text-rose-500 border-b-2 border-rose-500"
                              : "text-zinc-500 hover:text-zinc-200"
                          }`}
                        >
                          🔖 Saved
                        </button>
                      </div>

                      {/* FEED LIST POST STREAM CONTAINER */}
                      <div className="space-y-7.5">
                        {displayedPosts.length === 0 ? (
                          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500 italic">
                            No active posts match selected tab filters.
                          </div>
                        ) : (
                          displayedPosts.map((post) => {
                            const cVal = newCommentInputs[post.id] || "";
                            return (
                              <article
                                key={post.id}
                                className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                                  isDark 
                                    ? "bg-[#000000] border-transparent"
                                    : "bg-white border-neutral-150 hover:shadow-xs"
                                }`}
                              >
                                {/* HEADER CARD INFO */}
                                <div className={`flex items-center justify-between p-3.5 border-b ${
                                  isDark ? "border-transparent" : "border-neutral-100"
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-[#fe3b6a] to-[#ffaa3b]">
                                      <div className={`p-0.5 rounded-full ${isDark ? "bg-black" : "bg-white"}`}>
                                        <img
                                          src={post.author.avatar}
                                          alt="Header identity"
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-xs font-black hover:underline cursor-pointer ${
                                          isDark ? "text-white" : "text-neutral-900"
                                        }`}>
                                          {post.author.username}
                                        </span>
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#0095f6] text-white flex items-center justify-center text-[8px]" title="Peer Verified Team">
                                          ✓
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-zinc-500 font-semibold">{post.time} ago</p>
                                    </div>
                                  </div>
                                  
                                  <button onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    triggerToast("Timeline link copied to clipboard!");
                                  }} className="text-zinc-400 hover:text-rose-500 cursor-pointer">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* PRIMARY IMAGE MEDIA CAPSER (Supports double-tap-to-like) */}
                                {post.media && (
                                  <div
                                    className="relative aspect-video max-h-[380px] overflow-hidden bg-[#050505] cursor-pointer group select-none"
                                    onDoubleClick={() => handleDoubleTapLike(post.id)}
                                  >
                                    <img
                                      src={post.media}
                                      alt="Student narrative content"
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                                    />

                                    {/* Centered popup flying Heart animation */}
                                    {popHeartPostId === post.id && (
                                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in duration-300">
                                        <Heart className="w-20 h-20 text-red-500 fill-red-500 stroke-transparent drop-shadow-2xl animate-bounce scale-110" />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* ROW SOCIAL BUTTONS */}
                                <div className="p-3.5 flex items-center justify-between pb-1.5">
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => handleLike(post.id)}
                                      className="active:scale-90 transition-transform cursor-pointer"
                                    >
                                      <Heart
                                        className={`w-5.5 h-5.5 transition-colors ${
                                          post.isLikedByMe
                                            ? "text-red-500 fill-red-500"
                                            : "text-zinc-400 hover:text-red-400"
                                        }`}
                                      />
                                    </button>

                                    <button
                                      onClick={() => {
                                        const isNowOpen = !expandedComments[post.id];
                                        setExpandedComments(prev => ({ ...prev, [post.id]: isNowOpen }));
                                        triggerToast(isNowOpen ? "Comments opened for view/send." : "Comments hidden.");
                                      }}
                                      className="text-zinc-400 hover:text-cyan-400 cursor-pointer"
                                    >
                                      <MessageSquare className="w-5.5 h-5.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* CAPTION CONTENT SPACE */}
                                <div className="px-3.5 pb-2.5">
                                  <p className="text-xs font-black text-rose-500 mb-1 leading-none">
                                    {post.likesCount} student reactions
                                  </p>
                                  <p className="text-xs leading-relaxed mt-2">
                                    <span className="text-rose-400 font-extrabold mr-2">
                                      {post.author.username}
                                    </span>
                                    <span className={isDark ? "text-zinc-200" : "text-zinc-800 font-medium"}>
                                      {post.caption}
                                    </span>
                                  </p>
                                </div>

                                {/* VIEW COMMENTS OPTION LINK */}
                                <div className="px-3.5 pb-3">
                                  <button
                                    onClick={() => {
                                      const isNowOpen = !expandedComments[post.id];
                                      setExpandedComments(prev => ({ ...prev, [post.id]: isNowOpen }));
                                    }}
                                    className="text-xs font-bold text-rose-500 cursor-pointer hover:underline"
                                  >
                                    {expandedComments[post.id] ? "Hide comments" : `View comments (${post.comments?.length || 0})`}
                                  </button>
                                </div>

                                {/* RECENT COMMENTS INNER ELEMENT & INPUT CHAT */}
                                {expandedComments[post.id] && (
                                  <div className={`border-t ${
                                    isDark ? "border-transparent bg-zinc-950/20" : "border-neutral-100 bg-neutral-50/50"
                                  }`}>
                                    {post.comments && post.comments.length > 0 ? (
                                      <div className={`px-3.5 py-2.5 text-xs space-y-1.5 border-b ${
                                        isDark ? "text-zinc-400 bg-zinc-950/45 border-transparent" : "text-neutral-600 bg-neutral-50 border-neutral-100"
                                      }`}>
                                        {post.comments.map((comment) => (
                                          <p key={comment.id} className="text-[11px] leading-relaxed">
                                            <span className={`font-extrabold mr-2 ${
                                              isDark ? "text-zinc-300" : "text-neutral-800"
                                            }`}>
                                              @{comment.author}
                                            </span>
                                            <span className={isDark ? "text-zinc-400" : "text-neutral-700"}>
                                              {comment.text}
                                            </span>
                                          </p>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-zinc-500 px-3.5 py-3.5 italic">
                                        No comments yet. Be the first to add one!
                                      </p>
                                    )}

                                    {/* INTERACTIVE ACTION COMMENT ADDER */}
                                    <div className={`p-3 flex items-center gap-3 border-t ${
                                      isDark ? "bg-[#070707] border-transparent" : "bg-neutral-50/80 border-neutral-100"
                                    }`}>
                                      <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={cVal}
                                        onChange={(e) =>
                                          setNewCommentInputs({ ...newCommentInputs, [post.id]: e.target.value })
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleAddComment(post.id);
                                        }}
                                        className={`flex-1 bg-transparent text-xs focus:outline-none ${
                                          isDark ? "text-zinc-300 placeholder-zinc-500" : "text-neutral-800 placeholder-neutral-400 font-medium"
                                        }`}
                                      />
                                      <button
                                        onClick={() => handleAddComment(post.id)}
                                        className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 active:scale-95 transition-transform cursor-pointer"
                                      >
                                        Publish
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </article>
                            );
                          })
                        )}
                      </div>

                    </div>
                  )}

                  {/* VIEW 2: INSTAGRAM-STYLE BENTO GRID COVERS FOR CAMPUS VIEW */}
                  {activeView === "explore" && (
                    <div className="space-y-6.5 animate-in fade-in duration-300 w-full">
                      <div className="text-center py-5">
                        <p className="text-[10px] uppercase text-rose-500 font-mono tracking-widest font-black">
                          Explore Academic Assets
                        </p>
                        <h2 className={`font-display text-lg font-bold mt-1.5 ${isDark ? "text-white" : "text-black"}`}>
                          Campus Library Binders
                        </h2>
                        <p className="text-xs text-zinc-550 max-w-md mx-auto mt-1">
                          Aesthetic student research captures and high color resolution architectural renderings. Click any image to instantly adapt it into your active card post drafts.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                        {PRESET_GRAPHICS.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setNewPostMedia(item.url);
                              setNewPostText(`Reflecting on the inspiring ${item.name} inside the sandbox workspace code. `);
                              setShowCreateModal(true);
                              triggerToast(`Draft setup with ${item.name} image cover.`);
                            }}
                            className="relative border border-zinc-900 rounded-xl overflow-hidden aspect-square cursor-pointer group/bento bg-zinc-950"
                          >
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/bento:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              <span className="text-[9px] font-mono text-amber-500 font-extrabold uppercase">
                                Grid Space #{index + 1}
                              </span>
                              <h3 className="text-xs font-black text-white leading-tight mt-1">
                                {item.name}
                              </h3>
                              <p className="text-[10px] text-rose-400 font-bold mt-2 leading-none uppercase tracking-widest">
                                CLICK TO POST
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIEW 3: FULL WIDE PROFILE SCREEN CARD & SQUARE POST GRID */}
                  {activeView === "profile" && (
                    <div className="space-y-8 animate-in fade-in duration-300 w-full">
                      
                      {/* USER INFO PROFILE VIEW */}
                      <div className={`p-6.5 rounded-xl border ${
                        isDark ? "border-transparent bg-zinc-950/40" : "border-neutral-150 bg-[#fafafa]"
                      }`}>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                          
                          {/* Left Avatar circle profile */}
                          <div className="p-[3.5px] rounded-full bg-gradient-to-tr from-[#fe3b6a] via-[#ff5a3b] to-[#ffaa3b] hover:rotate-6 transition-all duration-300">
                            <div className={`p-0.5 rounded-full ${isDark ? "bg-black" : "bg-white"}`}>
                              <img
                                src={avatar}
                                alt="Student user major profile face"
                                className="w-22 h-22 rounded-full object-cover"
                              />
                            </div>
                          </div>

                          {/* Detail fields elements */}
                          <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
                              <h2 className={`text-base font-black tracking-tight font-mono ${
                                isDark ? "text-white" : "text-neutral-900"
                              }`}>
                                {username}
                              </h2>
                              <button
                                onClick={() => setIsEditProfileModalOpen(true)}
                                className={`px-4.5 py-1.5 rounded border text-[10px] font-extrabold uppercase active:scale-95 transition-all cursor-pointer ${
                                  isDark
                                    ? "bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-850"
                                    : "bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200 shadow-xs"
                                }`}
                              >
                                Edit Profile
                              </button>
                            </div>

                            {/* Standard stats lines */}
                            <div className={`flex items-center justify-center md:justify-start gap-6 text-xs ${
                              isDark ? "text-zinc-300" : "text-neutral-600 font-medium"
                            }`}>
                              <div>
                                <span className={`font-extrabold mr-1 ${isDark ? "text-[#fdfdfd]" : "text-neutral-900"}`}>
                                  {posts.filter((p) => p.author.username === "furqan").length}
                                </span> 
                                posts
                              </div>
                              <div>
                                <span className={`font-extrabold mr-1 ${isDark ? "text-[#fdfdfd]" : "text-neutral-900"}`}>1,424</span> followers
                              </div>
                              <div>
                                <span className={`font-extrabold mr-1 ${isDark ? "text-[#fdfdfd]" : "text-neutral-900"}`}>1,180</span> following
                              </div>
                            </div>

                            {/* bio notes */}
                            <div>
                              <p className={`font-extrabold text-xs ${isDark ? "text-rose-500" : "text-rose-600"}`}>
                                {displayName}
                              </p>
                              <p className={`text-xs leading-relaxed max-w-md font-medium mt-1 ${
                                isDark ? "text-zinc-400" : "text-neutral-600"
                              }`}>
                                {bio}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* 3-COLUMN USER ARCHIVE SQUEAR GRID FROM SCREENSHOTS */}
                      <div className={`space-y-4 border-t pt-3 ${isDark ? "border-transparent" : "border-neutral-200"}`}>
                        <div className="flex items-center justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-[#888] font-bold">
                          <span className={`pt-2.5 flex items-center gap-1.5 border-t ${isDark ? "text-white border-white" : "text-neutral-900 border-neutral-900"}`}>
                            <ImageIcon className="w-4.5 h-4.5" /> Published Posts
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {posts
                            .filter((postItem) => postItem.author.username === "furqan")
                            .map((uPost) => (
                              <div
                                key={uPost.id}
                                className={`relative aspect-square border rounded-lg overflow-hidden cursor-pointer group ${
                                  isDark ? "border-transparent bg-zinc-950" : "border-neutral-150 bg-neutral-50"
                                }`}
                                onClick={() => triggerToast(`Visual draft active. Reactions: ${uPost.likesCount}`)}
                              >
                                <img
                                  src={uPost.media || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&h=400&q=80"}
                                  alt="My published photography item"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white text-xs font-black">
                                  <span className="text-rose-400 flex items-center gap-1">
                                    ❤️ {uPost.likesCount}
                                  </span>
                                  <span className="text-cyan-400 flex items-center gap-1">
                                    💬 {uPost.commentsCount}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* VIEW 4: SYSTEM ACCOUNT SETTINGS */}
                  {activeView === "settings" && (
                    <div className="space-y-6 animate-in fade-in duration-300 w-full text-xs">
                      <div className="mb-6">
                        <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                          Settings
                        </h1>
                        <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-500" : "text-neutral-500"}`}>
                          Manage your student sandbox configurations, central identity credentials, and appearance preferences.
                        </p>
                      </div>

                      {/* Flex layout with Left-sidebar and Right-content panel matching screenshots */}
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        
                        {/* Settings Sub-navigation panel */}
                        <div className={`w-full md:w-56 shrink-0 rounded-2xl border p-2 space-y-1 ${
                          isDark ? "bg-[#050505] border-zinc-900" : "bg-neutral-50 border-neutral-200"
                        }`}>
                          <button
                            onClick={() => setSettingsInnerTab("edit-profile")}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-bold transition-all ${
                              settingsInnerTab === "edit-profile"
                                ? (isDark ? "bg-zinc-900 text-white" : "bg-white text-black shadow-xs border border-neutral-200/50")
                                : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-950/50" : "text-neutral-500 hover:text-black hover:bg-neutral-100")
                            }`}
                          >
                            <UserIcon className="w-4.5 h-4.5 text-rose-500" />
                            <span>Edit profile</span>
                          </button>

                          <button
                            onClick={() => setSettingsInnerTab("change-avatar")}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-bold transition-all ${
                              settingsInnerTab === "change-avatar"
                                ? (isDark ? "bg-zinc-900 text-white" : "bg-white text-black shadow-xs border border-neutral-200/50")
                                : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-950/50" : "text-neutral-500 hover:text-black hover:bg-neutral-100")
                            }`}
                          >
                            <ImageIcon className="w-4.5 h-4.5 text-amber-500" />
                            <span>Change profile photo</span>
                          </button>

                          <button
                            onClick={() => setSettingsInnerTab("theme-preferences")}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-bold transition-all ${
                              settingsInnerTab === "theme-preferences"
                                ? (isDark ? "bg-zinc-900 text-white" : "bg-white text-black shadow-xs border border-neutral-200/50")
                                : (isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-950/50" : "text-neutral-500 hover:text-black hover:bg-neutral-100")
                            }`}
                          >
                            <Palette className="w-4.5 h-4.5 text-violet-500" />
                            <span>Preferences</span>
                          </button>
                        </div>

                        {/* Settings Active Sub-page panel */}
                        <div className={`flex-1 w-full rounded-2xl border p-6 min-h-[340px] ${
                          isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-neutral-200 shadow-xs"
                        }`}>
                          
                          {/* SUB-PAGE 1: EDIT PROFILE FIELDS */}
                          {settingsInnerTab === "edit-profile" && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                              <div className="flex items-center gap-4 border-b border-zinc-150 dark:border-zinc-900 pb-5">
                                <img
                                  src={avatar}
                                  alt=""
                                  className="w-14 h-14 rounded-full object-cover border-2 border-rose-500 shadow-sm shrink-0"
                                />
                                <div className="text-left">
                                  <h3 className={`text-base font-black leading-tight ${isDark ? "text-white" : "text-black"}`}>
                                    {username}
                                  </h3>
                                  <button
                                    onClick={() => {
                                      setSettingsInnerTab("change-avatar");
                                      triggerToast("Curated student avatars active.");
                                    }}
                                    className="text-[11px] text-[#0095f6] hover:text-[#005f96] font-bold mt-1 block"
                                  >
                                    Change profile photo
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4 pt-1">
                                <label className="block">
                                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-450 block mb-1.5">DisplayName</span>
                                  <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className={`w-full rounded-lg p-3 focus:outline-none focus:border-rose-500 font-bold transition-all ${
                                      isDark ? "bg-zinc-900 border border-zinc-800 text-zinc-200" : "bg-[#fcfcfc] border border-neutral-200 text-neutral-800"
                                    }`}
                                  />
                                </label>

                                <label className="block">
                                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-450 block mb-1.5">Username</span>
                                  <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full rounded-lg p-3 text-[11px] focus:outline-none focus:border-rose-500 font-mono transition-all ${
                                      isDark ? "bg-zinc-900 border border-zinc-800 text-zinc-200" : "bg-[#fcfcfc] border border-neutral-200 text-neutral-800"
                                    }`}
                                  />
                                </label>

                                <label className="block">
                                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-450 block mb-1.5">Biography Statement</span>
                                  <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    placeholder="Tell the lounge about yourself..."
                                    className={`w-full rounded-lg p-3 focus:outline-none focus:border-rose-500 resize-none transition-all ${
                                      isDark ? "bg-zinc-900 border border-zinc-800 text-zinc-200" : "bg-[#fcfcfc] border border-neutral-200 text-neutral-800"
                                    }`}
                                  />
                                </label>

                                <button
                                  onClick={() => triggerToast("Personal details updated on central grid!")}
                                  className="w-full py-3 bg-[#0095f6] hover:bg-blue-600 text-white font-extrabold rounded-lg text-xs transition-colors cursor-pointer"
                                >
                                  Submit Updates
                                </button>
                              </div>
                            </div>
                          )}

                          {/* SUB-PAGE 2: SELECT FROM CURATED HIGH-FIDELITY AVATARS */}
                          {settingsInnerTab === "change-avatar" && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                              <div>
                                <h3 className={`text-base font-black ${isDark ? "text-white" : "text-black"}`}>
                                  Change profile photo
                                </h3>
                                <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-neutral-500"} mt-1`}>
                                  Select from curated high-fidelity peer student personas. Updates instantly across the application network.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-3">
                                {[
                                  { label: "Male Peer", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
                                  { label: "Artistic Student", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
                                  { label: "Research Scholar", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" },
                                  { label: "Coding Assistant", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
                                  { label: "Design Student", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
                                  { label: "Creative Writer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" }
                                ].map((avOption, idx) => {
                                  const isActive = avatar === avOption.url;
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        setAvatar(avOption.url);
                                        triggerToast(`Profile avatar changed to ${avOption.label}`);
                                      }}
                                      className={`p-2.5 rounded-xl border cursor-pointer text-center select-none transition-all hover:scale-[1.03] ${
                                        isActive
                                          ? "border-rose-500 bg-rose-500/5"
                                          : (isDark ? "bg-zinc-900/40 border-zinc-805 hover:bg-zinc-850" : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100")
                                      }`}
                                    >
                                      <div className="relative inline-block">
                                        <img
                                          src={avOption.url}
                                          alt=""
                                          className="w-12 h-12 rounded-full object-cover border-2 border-transparent mx-auto"
                                        />
                                        {isActive && (
                                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full w-4.5 h-4.5 text-[8px] flex items-center justify-center font-bold border border-white dark:border-zinc-950">
                                            ✓
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] font-bold mt-1.5 truncate text-zinc-400 dark:text-zinc-305">
                                        {avOption.label}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* SUB-PAGE 3: APPEARANCE VISUAL MODES */}
                          {settingsInnerTab === "theme-preferences" && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                              <div>
                                <h3 className={`text-base font-black ${isDark ? "text-white" : "text-black"}`}>
                                  Appearance preferences
                                </h3>
                                <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-neutral-500"} mt-1`}>
                                  Toggle the student lounge visual theme interface scheme. Adaptable synchronously with eye strain level.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-3 select-none">
                                {/* Light card toggle */}
                                <div
                                  onClick={() => {
                                    setThemeMode("light");
                                    triggerToast("Workspace updated to Light design mode.");
                                  }}
                                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col items-center gap-3 ${
                                    !isDark
                                      ? "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500"
                                      : "bg-zinc-900/40 border-zinc-850 hover:bg-zinc-800"
                                  }`}
                                >
                                  <div className="w-full h-16 rounded-md bg-[#fafafa] border border-neutral-200 flex flex-col gap-1 p-2 justify-center">
                                    <div className="h-2 w-1/3 bg-neutral-300 rounded" />
                                    <div className="h-1.5 w-full bg-neutral-200 rounded" />
                                    <div className="h-1.5 w-2/3 bg-[#ebebeb] rounded" />
                                  </div>
                                  <span className={`text-[11px] font-bold ${!isDark ? "text-rose-500" : "text-zinc-400"}`}>
                                    Light Theme
                                  </span>
                                </div>

                                {/* Dark card toggle */}
                                <div
                                  onClick={() => {
                                    setThemeMode("dark");
                                    triggerToast("Workspace updated to Cosmic Dark mode.");
                                  }}
                                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col items-center gap-3 ${
                                    isDark
                                      ? "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500"
                                      : "bg-[#fcfcfc] border-neutral-200 hover:bg-neutral-50"
                                  }`}
                                >
                                  <div className="w-full h-16 rounded-md bg-[#000000] border border-zinc-900 flex flex-col gap-1 p-2 justify-center">
                                    <div className="h-2 w-1/3 bg-zinc-800 rounded" />
                                    <div className="h-1.5 w-full bg-zinc-900 rounded" />
                                    <div className="h-1.5 w-2/3 bg-zinc-850 rounded" />
                                  </div>
                                  <span className={`text-[11px] font-bold ${isDark ? "text-rose-500" : "text-neutral-700"}`}>
                                    Dark Theme
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  )}



                </div>

                {/* RIGHT-HAND COLUMN RECOMMENDATIONS: Rendered only on Home Timeline Feed as custom Instagram */}
                {activeView === "feed" && (
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* ACTIVE STUDENT CARD HIGHLIGHT */}
                    <div className={`flex items-center justify-between p-3.5 rounded-xl border font-sans ${
                      isDark ? "bg-zinc-950/20 border-zinc-900/60" : "bg-[#fafafa] border-[#efefef]"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={avatar}
                          alt="Under profile tag"
                          className={`w-9 h-9 rounded-full object-cover border ${
                            isDark ? "border-zinc-800" : "border-neutral-200"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-1 leading-none">
                            <span className={`text-xs font-black hover:underline cursor-pointer ${
                              isDark ? "text-white" : "text-neutral-800"
                            }`}>
                              {username}
                            </span>
                          </div>
                          <p className={`text-[10px] font-bold leading-normal ${
                            isDark ? "text-rose-500" : "text-rose-600"
                          }`}>
                            {displayName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SUGGESTIONS LIST REPLICATED DIRECTLY FROM SCREENSHOT */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between px-1 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span>Suggested for you</span>
                        <button
                          onClick={() => triggerToast("Already viewing all featured campus suggestions.")}
                          className="text-rose-500 hover:text-rose-400 hover:underline transition-all lowercase cursor-pointer"
                        >
                          See All
                        </button>
                      </div>

                      <div className={`space-y-3 p-3.5 rounded-xl border text-xs ${
                        isDark ? "bg-zinc-950/40 border-zinc-900" : "bg-[#fafafa] border-[#efefef]"
                      }`}>
                        {suggestedUsers.map((su) => (
                          <div
                            key={su.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-[1.2px] rounded-full bg-gradient-to-tr from-rose-500 to-amber-400">
                                <div className={`p-0.5 rounded-full ${isDark ? "bg-black" : "bg-white"}`}>
                                  <img
                                    src={su.avatar}
                                    alt="Recommendation face"
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                </div>
                              </div>
                              <div>
                                <p className={`font-extrabold leading-normal flex items-center gap-1 ${
                                  isDark ? "text-white" : "text-neutral-800"
                                }`}>
                                  <span>{su.username}</span>
                                  {su.isVerified && (
                                    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-sky-500 text-white text-[7px]" title="Verified badge">✓</span>
                                  )}
                                </p>
                                <p className={`text-[9px] leading-none mt-0.5 truncate max-w-[130px] ${
                                  isDark ? "text-zinc-500" : "text-neutral-500"
                                }`} title={su.note}>
                                  {su.note}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleFollow(su.id, su.username)}
                              className={`text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                                su.isFollowing
                                  ? (isDark ? "text-zinc-600" : "text-zinc-400")
                                  : "text-[#0095f6] hover:text-blue-500"
                              }`}
                            >
                              {su.isFollowing ? "Following" : "Follow"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>

          {/* MINIMAL FOOTER LABEL */}
          <footer className={`py-6 text-center text-[10px] uppercase font-mono tracking-widest border-t ${
            isDark ? "border-zinc-950 text-zinc-600 bg-black" : "border-neutral-200 text-neutral-400 bg-neutral-50"
          }`}>
            <span>Affinity Hub Core Interface Playground • Active Port 3000 Ingress</span>
          </footer>

        </div>

      </div>

      {/* DETAILED HORIZONTAL STORY SLIDESHOW PLAYER */}
      {activeStory && (
        <div
          id="visual-story-overlay"
          className="fixed inset-0 z-50 bg-[#000000]/95 flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-sm bg-[#121212] rounded-2xl overflow-hidden border border-zinc-900 text-white shadow-2xl flex flex-col justify-between aspect-[9/16] animate-in zoom-in-95 duration-250">
            
            {/* Top Indicator bar */}
            <div className="p-4 pb-0 space-y-3">
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all ease-linear"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.avatar}
                    alt="Active speaker head"
                    className="w-8 h-8 rounded-full object-cover border border-rose-500"
                  />
                  <div>
                    <span className="text-xs font-black text-white">
                      @{activeStory.name}
                    </span>
                    <p className="text-[10px] text-zinc-500 font-bold leading-none">University Student Story</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveStory(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900 border border-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Immersive body picture */}
            <div className="flex-1 my-4 overflow-hidden relative">
              <img
                src={activeStory.image}
                alt="Story graphic timeline"
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-6 inset-x-4 p-3.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                <p className="text-xs text-center text-zinc-200 leading-relaxed font-semibold">
                  {activeStory.content}
                </p>
              </div>
            </div>

            {/* DM Input in Story overlay */}
            <div className="p-4 border-t border-zinc-900 bg-black flex gap-3">
              <input
                type="text"
                placeholder="Send direct message commentary..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    triggerToast(`Reaction dispatched to @${activeStory.name}!`);
                    setActiveStory(null);
                  }
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-xs rounded-xl px-4 py-2 text-white focus:outline-none placeholder-zinc-550"
              />
              <button
                onClick={() => {
                  triggerToast(`Reaction dispatched to @${activeStory.name}!`);
                  setActiveStory(null);
                }}
                className="px-4 py-1.5 bg-rose-600 text-[11px] font-black uppercase text-white rounded-xl active:scale-95 transition-transform"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CHASSIS IDEA GENERATOR MODAL COMPOSER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/85 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 max-w-lg w-full rounded-2xl overflow-hidden p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-rose-500 w-5 h-5" />
                <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">
                  Publish Academic Idea
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-550 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              placeholder="What is happening on your minded campus today? Write descriptions..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              rows={4}
              className="w-full bg-zinc-900 text-xs text-neutral-200 border border-zinc-805 rounded-xl p-3 focus:outline-none resize-none placeholder-zinc-550"
            />

            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase font-black block">Attachment Image URL</span>
              <input
                type="text"
                placeholder="HTTPS JPEG/PNG link..."
                value={newPostMedia}
                onChange={(e) => setNewPostMedia(e.target.value)}
                className="w-full bg-zinc-900 text-xs text-neutral-200 border border-zinc-805 rounded-lg p-2.5 focus:outline-none font-mono text-[11px]"
              />
              
              <div className="flex gap-2 pt-1.5 overflow-x-auto no-scrollbar">
                {PRESET_GRAPHICS.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => {
                      setNewPostMedia(g.url);
                      triggerToast(`Selected preset illustration: ${g.name}`);
                    }}
                    className={`px-3 py-1 text-[9px] rounded-lg font-bold border whitespace-nowrap transition-all ${
                      newPostMedia === g.url
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <select
                value={composerVisibility}
                onChange={(e) => setComposerVisibility(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase rounded p-1.5 text-zinc-300"
              >
                <option value="public">🌐 Public Stream</option>
                <option value="following">👥 Peers circle</option>
              </select>

              <button
                onClick={handleCreatePost}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-lg text-xs font-black uppercase shadow-lg active:scale-95 transition-all"
              >
                Release Idea
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL OVERLAY */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/85 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-black uppercase tracking-widest text-rose-500 font-mono">
                Update Student Card
              </span>
              <button onClick={() => setIsEditProfileModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="block">
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Full Display Name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 focus:outline-none text-zinc-200 font-bold"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Unique Handle</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 focus:outline-none text-zinc-200 font-mono"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Biography Statement</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded p-2 focus:outline-none text-zinc-200 resize-none font-sans"
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Avatar Portrait HTTPS URL</span>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-800 text-[11px] rounded p-2 focus:outline-none text-zinc-200 font-mono"
                />
              </label>

              <button
                onClick={() => {
                  setIsEditProfileModalOpen(false);
                  triggerToast("Student Profile updated!");
                }}
                className="w-full py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-black uppercase text-[10px] tracking-widest rounded-lg shadow-lg hover:brightness-110"
              >
                Apply parameters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
