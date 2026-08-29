"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BedDouble, Sparkles, Home, MapPin, Calendar, DollarSign,
  Sofa, Wifi, Car, PawPrint, Zap, Droplets, Image, Video, X, Upload, Loader2,
  Phone
} from "lucide-react";
import FormProgress from "@/components/ui/FormProgress";
import AuthGate from "@/components/ui/AuthGate";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import LocationPinPicker from "@/components/ui/LocationPinPicker";
import { createRoom } from "@/features/rooms/services/room.service";
import {
  categories,
  propertyTypes,
  leaseTerms,
  bedroomOptions,
  bathroomOptions,
} from "@/features/rooms/constants/room-form.constants";
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  MAX_VIDEO_SIZE,
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEOS,
} from "@/constants/upload.constants";

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Was one continuous ~950-line scroll through 9 sections — the exact
  // shape of thing that makes someone give up halfway. Now shows one
  // section at a time; formRef lets Next lean on the browser's own native
  // required-field validation (checkValidity/reportValidity), scoped
  // automatically to just the current step since only its fields are
  // mounted in the DOM at any given time.
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Listing a property requires an account (so prospective tenants and
  // admin moderation can reach the owner back). Gate on the client, same as
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
    category: "",
    propertyType: "",
    price: "",
    description: "",
    phoneNumber: "",
    whatsappNumber: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    area: "",
    lat: null as number | null,
    lng: null as number | null,
    availableFrom: "",
    deposit: "",
    leaseTerm: "",
    furnished: false,
    parking: false,
    wifi: false,
    electricityIncluded: false,
    waterIncluded: false,
    petsAllowed: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoUploadError, setVideoUploadError] = useState<string>("");
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
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
      // Replace with your actual image upload endpoint
     const token = localStorage.getItem("token");

const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/room/upload`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/room/upload-videos`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.lat == null || form.lng == null) {
      alert(
        "Please confirm your property's exact location on the map before submitting."
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

      // Prepare the room data matching your CreateRoomDto
      const roomData = {
        name: form.name,
        category: form.category,
        propertyType: form.propertyType,
        price: Number(form.price),
        description: form.description,
        phoneNumber: form.phoneNumber,
        whatsappNumber: form.whatsappNumber || undefined,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        availableFrom: form.availableFrom,
        deposit: Number(form.deposit),
        leaseTerm: form.leaseTerm,
        location: {
          address: form.address,
          area: form.area,
          lat: form.lat ?? 0,
          lng: form.lng ?? 0,
        },
        amenities: {
          furnished: form.furnished,
          parking: form.parking,
          wifi: form.wifi,
          electricityIncluded: form.electricityIncluded,
          waterIncluded: form.waterIncluded,
          petsAllowed: form.petsAllowed,
        },
        // Add uploaded image URLs to match your backend DTO
        images: uploadedImageUrls,
        videos: uploadedVideoUrls,
      };

      const created = await createRoom(roomData);

      if (created?.status === "pending_review") {
        toast.info("Property submitted for review", {
          description:
            "It looks similar to another listing, so it's queued for a quick admin check before it appears on the feed.",
        });
      } else {
        toast.success("Property listed!", {
          description: `"${form.name}" is now live on the Rooms feed.`,
        });
      }

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to create property. Please try again.");
    } finally {
      setLoading(false);
      setUploadingImages(false);
      setUploadingVideos(false);
    }
  };

  const FORM_SECTIONS = [
    { id: "section-basics", label: "Basic Information" },
    { id: "section-images", label: "Photos" },
    { id: "section-videos", label: "Videos" },
    { id: "section-pricing", label: "Pricing" },
    { id: "section-details", label: "Property Details" },
    { id: "section-location", label: "Location" },
    { id: "section-availability", label: "Availability" },
    { id: "section-contact", label: "Contact" },
    { id: "section-amenities", label: "Amenities" },
  ];

  const isLastStep = currentStep === FORM_SECTIONS.length - 1;

  const goNext = () => {
    const formEl = formRef.current;

    // Only the current step's inputs exist in the DOM right now, so this
    // native check is automatically scoped to just this step — no manual
    // per-field tracking needed. reportValidity() shows the browser's own
    // "please fill this in" bubble right on the empty field.
    if (formEl && !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    // The map pin isn't a native form field, so checkValidity() can't see
    // it — same requirement the original submit-time check enforced.
    if (
      FORM_SECTIONS[currentStep].id === "section-location" &&
      (form.lat == null || form.lng == null)
    ) {
      toast.error(
        "Please confirm your property's exact location on the map before continuing."
      );
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, FORM_SECTIONS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hold the page blank until the auth check resolves, so a logged-out
  // visitor never sees the form flash before the sign-in prompt swaps in.
  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100" />
    );
  }

  // Not logged in — don't render the form at all, prompt to sign in first.
  if (!isLoggedIn) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4 pt-24">
        <AuthGate
          nextPath="/rooms/create"
          title="Sign in to list your property"
          message="Create a free account or log in so prospective tenants can reach you."
          browseHref="/?view=rooms"
          accent="from-green-600 to-emerald-600"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4 pb-10 pt-24">
      <FormProgress
        sections={FORM_SECTIONS}
        accent="from-green-500 to-emerald-600"
        activeIndex={currentStep}
      />

      {/* Background blobs */}
      <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-xl">
              <BedDouble size={26} className="text-white" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              List Your Property
            </h1>

            <p className="mt-2 text-gray-500">
              Add your property and find the perfect tenant on SouthSpot.
            </p>
          </div>

          <form ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6">
            {/* Basic Information */}
            {currentStep === 0 && (
            <div id="section-basics">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Home size={16} className="text-green-600" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Property title *"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    required
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                  >
                    <option value="">Category *</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    required
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                  >
                    <option value="">Property Type *</option>
                    {propertyTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your property... *"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none resize-none"
                />
              </div>
            </div>
            )}

            {/* Image Upload */}
            {currentStep === 1 && (
            <div id="section-images">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Image size={16} className="text-green-600" />
                Property Images
              </h2>

              <div className="space-y-4">
                {/* Image upload button */}
                <div className="flex items-center justify-center">
                  <label className={`relative flex w-full cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-6 transition-all ${
                    uploadError 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-300 bg-white/50 hover:border-green-500 hover:bg-green-50/50'
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      {uploadingImages ? (
                        <Loader2 size={32} className="animate-spin text-green-500" />
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
                          alt={`Property ${index + 1}`}
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
            </div>
            )}

            {/* Video Upload */}
            {currentStep === 2 && (
            <div id="section-videos">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Video size={16} className="text-green-600" />
                Property Videos
                <span className="text-xs font-normal text-gray-400">(optional)</span>
              </h2>

              <div className="space-y-4">
                {/* Video upload button */}
                <div className="flex items-center justify-center">
                  <label className={`relative flex w-full cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-6 transition-all ${
                    videoUploadError
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-gray-300 bg-white/50 hover:border-green-500 hover:bg-green-50/50'
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      {uploadingVideos ? (
                        <Loader2 size={32} className="animate-spin text-green-500" />
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
            </div>
            )}

            {/* Pricing */}
            {currentStep === 3 && (
            <div id="section-pricing">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign size={16} className="text-green-600" />
                Pricing
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Monthly Rent (R) *"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />

                <input
                  required
                  type="number"
                  name="deposit"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="Deposit (R) *"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />
              </div>
            </div>
            )}

            {/* Property Details */}
            {currentStep === 4 && (
            <div id="section-details">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <BedDouble size={16} className="text-green-600" />
                Property Details
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  required
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                >
                  <option value="">Bedrooms *</option>
                  {bedroomOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <select
                  required
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                >
                  <option value="">Bathrooms *</option>
                  {bathroomOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}

            {/* Location */}
            {currentStep === 5 && (
            <div id="section-location">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MapPin size={16} className="text-green-600" />
                Location
              </h2>

              <div className="space-y-4">
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
                  placeholder="Start typing your street address *"
                  inputClassName="w-full h-auto rounded-xl border border-gray-200 bg-white p-3 pl-10 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none text-base"
                  showUseCurrentLocation
                />

                <input
                  required
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Area / Suburb *"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Confirm the exact spot on the map{" "}
                    <span className="text-red-500">*</span>
                  </p>

                  <LocationPinPicker
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(lat, lng) =>
                      setForm((prev) => ({ ...prev, lat, lng }))
                    }
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Easiest: tap &quot;Use my current location&quot; above
                    while you&apos;re standing at the gate or entrance. Typing
                    an address gets you close too — just drag the pin (or tap
                    the map) the rest of the way. This is what tenants will
                    actually navigate to.
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Availability */}
            {currentStep === 6 && (
            <div id="section-availability">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar size={16} className="text-green-600" />
                Availability <span className="text-red-500">*</span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  type="date"
                  name="availableFrom"
                  value={form.availableFrom}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />

                <select
                  required
                  name="leaseTerm"
                  value={form.leaseTerm}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                >
                  <option value="">Lease Term *</option>
                  {leaseTerms.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}

            {/* Contact — what the listing's Call/WhatsApp buttons use */}
            {currentStep === 7 && (
            <div id="section-contact">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone size={16} className="text-green-600" />
                Contact
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone number, e.g. +27821234567 *"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />

                <input
                  type="tel"
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  placeholder="WhatsApp number (optional, if different)"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 outline-none"
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Interested renters will call or WhatsApp this number directly — leave WhatsApp blank to use the same number.
              </p>
            </div>
            )}

            {/* Amenities */}
            {currentStep === 8 && (
            <div id="section-amenities">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sofa size={16} className="text-green-600" />
                Amenities
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                {(
                  [
                    ["furnished", "Fully Furnished", Sofa],
                    ["parking", "Parking Available", Car],
                    ["wifi", "Wi-Fi Included", Wifi],
                    ["electricityIncluded", "Electricity Included", Zap],
                    ["waterIncluded", "Water Included", Droplets],
                    ["petsAllowed", "Pets Allowed", PawPrint],
                  ] as [string, string, typeof Sofa][]
                ).map(([name, label, Icon]) => (
                  <label
                    key={name}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                      (form as any)[name]
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={name}
                      checked={(form as any)[name]}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Icon size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            )}

            {/* Back / Next — only the last step (Amenities) shows the real
                submit button, so nothing gets created until every step has
                been through its own validation. */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  Back
                </button>
              )}

              {/* Two separate conditional blocks — not a ternary — so Next
                  and Create Property are distinct DOM nodes. A ternary here
                  previously let React patch the same <button> node's type
                  from "button" to "submit" in place; browsers can carry a
                  click already in flight over onto a type mutated mid-click,
                  which silently submitted the form the instant this step
                  became the last one — before the user had touched
                  anything on it. See business/create's button block, which
                  already uses this safe pattern. */}
              {!isLastStep && (
                <button type="button"
            onClick={goNext}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-green-400/40">
                  Next
                </button>
              )}

              {isLastStep && (
                <button type="submit"
            disabled={loading || uploadingImages || uploadingVideos}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-green-400/40 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {uploadingImages
                        ? 'Uploading Images...'
                        : uploadingVideos
                        ? 'Uploading Videos...'
                        : 'Creating Property...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Create Property
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}