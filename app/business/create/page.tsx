"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Sparkles,
  Image,
  Video,
  Upload,
  Loader2,
  X,
  Globe,
  MapPin,
  Truck,
  MessageCircle,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import FormProgress from "@/components/ui/FormProgress";
import AuthGate from "@/components/ui/AuthGate";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import LocationPinPicker from "@/components/ui/LocationPinPicker";
import {
  createBusiness,
  getBusinessCategories,
} from "@/features/business/services/business.service";
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  MAX_VIDEO_SIZE,
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEOS,
} from "@/constants/upload.constants";
import {
  BusinessCategory,
  BusinessType,
  PriceRange,
} from "@/features/business/types";
import { PRICE_RANGE_OPTIONS } from "@/features/business/constants/price-range.constants";

export default function CreateBusinessPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [categories, setCategories] = useState<BusinessCategory[]>([]);

  useEffect(() => {
    getBusinessCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Listing a business requires an account (so customers and admin
  // moderation can reach the owner back). Gate on the client, same as
  // Navbar's isLoggedIn check — there's no server session here, just a
  // token in localStorage.
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setAuthChecked(true);
  }, []);

  const [form, setForm] = useState({
    name: "",
    credential: "",
    categorySlug: "",
    subcategorySlug: "",
    description: "",
    address: "",
    area: "",
    lat: null as number | null,
    lng: null as number | null,
    phoneNumber: "",
    whatsappNumber: "",
    priceRange: "" as PriceRange | "",
  });

  const [businessType, setBusinessType] = useState<BusinessType>("physical");
  const [supportsDelivery, setSupportsDelivery] = useState(false);
  const [supportsWhatsAppOrder, setSupportsWhatsAppOrder] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoUploadError, setVideoUploadError] = useState<string>("");
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const activeCategory = categories.find(
    (c) => c.slug === form.categorySlug
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Changing category invalidates whatever subcategory was chosen
      // under the previous category.
      ...(name === "categorySlug" ? { subcategorySlug: "" } : {}),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setUploadError(`File "${file.name}" is not a supported image format. Please use JPEG, PNG, WebP, or GIF.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File "${file.name}" exceeds the 5MB limit.`);
        continue;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    // Limit to maximum 10 images
    if (images.length + newFiles.length > 10) {
      setUploadError("You can upload a maximum of 10 images.");
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setVideoUploadError("");
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setVideoUploadError(`File "${file.name}" is not a supported video format. Please use MP4, MOV, WebM, AVI, or 3GP.`);
        continue;
      }

      if (file.size > MAX_VIDEO_SIZE) {
        setVideoUploadError(`File "${file.name}" exceeds the 50MB limit.`);
        continue;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (videos.length + newFiles.length > MAX_VIDEOS) {
      setVideoUploadError(`You can upload a maximum of ${MAX_VIDEOS} videos.`);
      return;
    }

    setVideos((prev) => [...prev, ...newFiles]);
    setVideoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(videoPreviews[index]);
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to your backend
  const uploadImagesToServer = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/business/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          // Don't set Content-Type manually when sending FormData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload images");
      }

      const data = await response.json();
      // Assuming your API returns an array of image URLs
      setDuplicateWarnings(data.duplicateWarnings || []);
      return data.imageUrls || [];
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload images. Please try again.");
    }
  };

  const uploadVideosToServer = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("videos", file);
    });

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/business/upload-videos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload videos");
      }

      const data = await response.json();
      return data.videoUrls || [];
    } catch (error) {
      console.error("Video upload error:", error);
      throw new Error("Failed to upload videos. Please try again.");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      businessType === "physical" &&
      (form.lat == null || form.lng == null)
    ) {
      alert(
        "Please confirm your business's exact location on the map before submitting."
      );
      return;
    }

    try {
      setLoading(true);
      setUploadError("");

      // Upload images first if there are any
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        setUploadingImages(true);
        uploadedImageUrls = await uploadImagesToServer(images);
        setUploadingImages(false);
      }

      let uploadedVideoUrls: string[] = [];
      if (videos.length > 0) {
        setUploadingVideos(true);
        uploadedVideoUrls = await uploadVideosToServer(videos);
        setUploadingVideos(false);
      }

      const created = await createBusiness({
        name: form.name,
        credential: form.credential || undefined,
        categorySlug: form.categorySlug,
        subcategorySlug: form.subcategorySlug || undefined,
        businessType,
        description: form.description,
        location:
          businessType === "physical"
            ? {
                address: form.address,
                area: form.area,
                lat: form.lat ?? 0,
                lng: form.lng ?? 0,
              }
            : undefined,
        images: uploadedImageUrls, // Add uploaded image URLs
        videos: uploadedVideoUrls,
        supportsDelivery,
        supportsWhatsAppOrder,
        whatsappNumber: supportsWhatsAppOrder
          ? form.whatsappNumber
          : undefined,
        phoneNumber: form.phoneNumber,
        priceRange: form.priceRange || undefined,
      });

      if (created?.status === "pending_review") {
        toast.info("Business submitted for review", {
          description:
            "It looks similar to another listing, so it's queued for a quick admin check before it appears on the feed.",
        });
      } else {
        toast.success("Business listed!", {
          description: `"${form.name}" is now live on the Businesses feed.`,
        });
      }

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to create business. Please try again.");
    } finally {
      setLoading(false);
      setUploadingImages(false);
      setUploadingVideos(false);
    }
  };

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const FORM_SECTIONS = [
    { id: "section-type", label: "Business Type" },
    { id: "section-details", label: "Business Details" },
    { id: "section-media", label: "Photos & Videos" },
    ...(businessType === "physical"
      ? [{ id: "section-location", label: "Location" }]
      : []),
    { id: "section-extras", label: "Delivery & Pricing" },
  ];

  // Hold the page blank until the auth check resolves, so a logged-out
  // visitor never sees the form flash before the sign-in prompt swaps in.
  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
    );
  }

  // Not logged in — don't render the form at all, prompt to sign in first.
  if (!isLoggedIn) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 pt-24">
        <AuthGate
          nextPath="/business/create"
          title="Sign in to list your business"
          message="Create a free account or log in so customers can find and reach you."
          browseHref="/?view=businesses"
          accent="from-blue-600 to-indigo-600"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 pb-10 pt-24">
      <FormProgress
        sections={FORM_SECTIONS}
        accent="from-blue-500 to-indigo-600"
        containerClassName="max-w-xl"
      />

      {/* Background blobs */}
      <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-xl"
      >
        <motion.div
          variants={item}
          className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}

          <div className="mb-8 text-center">

            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl"
            >
              <Building2
                size={30}
                className="text-white"
              />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900">
              Create Business
            </h1>

            <p className="mt-2 text-gray-500">
              Add your business and reach thousands of
              customers on Cosmopolitan.
            </p>
          </div>

          <motion.form
            variants={container}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Business Type */}
            <motion.div id="section-type" variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Business Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBusinessType("physical")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                    businessType === "physical"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MapPin size={16} />
                  Physical
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType("online")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                    businessType === "online"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Globe size={16} />
                  Online
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {businessType === "physical"
                  ? "Has a physical address, appears in nearby searches."
                  : "No physical address needed. Won't appear in nearby searches, but is still searchable and browsable by category."}
              </p>
            </motion.div>

            <motion.div id="section-details" variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Business Name <span className="text-red-500">*</span>
              </label>

              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Sunrise Hotel"
                className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Qualification / Credential{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>

              <input
                name="credential"
                value={form.credential}
                onChange={handleChange}
                placeholder="e.g. BCom Accounting Graduate, Final-year Engineering Student"
                maxLength={100}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
              />

              <p className="mt-2 text-xs text-gray-500">
                Got a degree, diploma, or certification relevant to what
                you're offering? Show it here — it's shown as a badge on
                your listing.
              </p>
            </motion.div>

            <motion.div variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>

              <select
                required
                name="categorySlug"
                value={form.categorySlug}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </motion.div>

            {activeCategory && activeCategory.subcategories.length > 0 && (
              <motion.div variants={item}>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Subcategory
                </label>

                <select
                  name="subcategorySlug"
                  value={form.subcategorySlug}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
                >
                  <option value="">Select subcategory (optional)</option>
                  {activeCategory.subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.slug}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            <motion.div variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>

              <textarea
                required
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell customers about your business..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
              />
            </motion.div>

            {/* Image Upload Section */}
            <motion.div id="section-media" variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Image size={16} className="text-blue-600" />
                  Business Images
                </div>
              </label>

              <div className="space-y-4">
                {/* Image upload button */}
                <div className="flex items-center justify-center">
                  <label className={`relative flex w-full cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-6 transition-all ${
                    uploadError
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-gray-300 bg-white/50 hover:border-blue-500 hover:bg-blue-50/50'
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      {uploadingImages ? (
                        <Loader2 size={32} className="animate-spin text-blue-500" />
                      ) : (
                        <Upload size={32} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                      </span>
                      <span className="text-xs text-gray-400">
                        JPEG, PNG, WebP, GIF (max 5MB each, up to 10 images)
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      disabled={uploadingImages || loading}
                    />
                  </label>
                </div>

                {/* Error message */}
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}

                {/* Duplicate image warning (non-blocking) */}
                {duplicateWarnings.length > 0 && (
                  <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                    {duplicateWarnings.map((warning, i) => (
                      <p key={i}>⚠️ {warning}</p>
                    ))}
                  </div>
                )}

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`Business ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600"
                          disabled={uploadingImages || loading}
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image count */}
                {images.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {images.length} image{images.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </motion.div>

            {/* Video Upload Section */}
            <motion.div variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-blue-600" />
                  Business Videos
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </div>
              </label>

              <div className="space-y-4">
                {/* Video upload button */}
                <div className="flex items-center justify-center">
                  <label className={`relative flex w-full cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-6 transition-all ${
                    videoUploadError
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-gray-300 bg-white/50 hover:border-blue-500 hover:bg-blue-50/50'
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      {uploadingVideos ? (
                        <Loader2 size={32} className="animate-spin text-blue-500" />
                      ) : (
                        <Upload size={32} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploadingVideos ? 'Uploading...' : 'Click to upload videos'}
                      </span>
                      <span className="text-xs text-gray-400">
                        MP4, MOV, WebM, AVI (max 50MB each, up to {MAX_VIDEOS} videos)
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/3gpp"
                      onChange={handleVideoUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      disabled={uploadingVideos || loading}
                    />
                  </label>
                </div>

                {/* Error message */}
                {videoUploadError && (
                  <p className="text-sm text-red-500">{videoUploadError}</p>
                )}

                {/* Video previews */}
                {videoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {videoPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-black"
                      >
                        <video
                          src={preview}
                          controls
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600"
                          disabled={uploadingVideos || loading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video count */}
                {videos.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {videos.length} video{videos.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </motion.div>

            {businessType === "physical" && (
              <>
                <motion.div id="section-location" variants={item}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>

                  <AddressAutocomplete
                    value={form.address}
                    onInputChange={(text) =>
                      setForm((prev) => ({ ...prev, address: text }))
                    }
                    onSelect={(result: GeocodeResult) =>
                      setForm((prev) => ({
                        ...prev,
                        address: result.address || prev.address,
                        area: result.area || prev.area,
                        lat: result.lat,
                        lng: result.lng,
                      }))
                    }
                    placeholder="Start typing your street address"
                    inputClassName="w-full h-auto rounded-xl border border-gray-200 bg-white p-3 pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none text-base"
                  />
                </motion.div>

                <motion.div variants={item}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Area <span className="text-red-500">*</span>
                  </label>

                  <input
                    required
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="Sandton"
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
                  />
                </motion.div>

                <motion.div variants={item}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Confirm the exact spot on the map{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <LocationPinPicker
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(lat, lng) =>
                      setForm((prev) => ({ ...prev, lat, lng }))
                    }
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    The address search gets you close — drag the pin (or tap
                    the map) to your exact entrance. This is what customers
                    will actually navigate to.
                  </p>
                </motion.div>
              </>
            )}

            {/* Contact number — what the listing's "Call" button dials */}
            <motion.div variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Contact Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +27821234567"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Customers will call this number directly from your listing.
              </p>
            </motion.div>

            {/* Delivery & WhatsApp ordering */}
            <motion.div id="section-extras" variants={item} className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={supportsDelivery}
                  onChange={(e) => setSupportsDelivery(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Truck size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  Offers nationwide delivery
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={supportsWhatsAppOrder}
                  onChange={(e) =>
                    setSupportsWhatsAppOrder(e.target.checked)
                  }
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <MessageCircle size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  Accepts orders via WhatsApp
                </span>
              </label>

              {supportsWhatsAppOrder && (
                <input
                  required
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  placeholder="WhatsApp number, e.g. +27821234567"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
                />
              )}
            </motion.div>

            <motion.div variants={item}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Price Range
              </label>

              <select
                name="priceRange"
                value={form.priceRange}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none"
              >
                <option value="">Not specified</option>
                {PRICE_RANGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-gray-400">
                What a customer typically pays for one item or one visit —
                helps them know what to expect before they call.
              </p>
            </motion.div>

            <motion.button
              variants={item}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              disabled={loading || uploadingImages || uploadingVideos}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-blue-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={18} />

              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploadingImages
                    ? 'Uploading Images...'
                    : uploadingVideos
                    ? 'Uploading Videos...'
                    : 'Creating Business...'}
                </>
              ) : (
                "Create Business"
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </motion.div>
    </main>
  );
}
