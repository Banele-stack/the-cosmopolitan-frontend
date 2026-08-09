"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BedDouble, Sparkles, Home, MapPin, Calendar, DollarSign,
  Sofa, Wifi, Car, PawPrint, Zap, Droplets, Image, Video, X, Upload, Loader2,
  Phone
} from "lucide-react";
import { motion } from "framer-motion";
import FormProgress from "@/components/ui/FormProgress";
import AuthGate from "@/components/ui/AuthGate";
import AddressAutocomplete, {
  GeocodeResult,
} from "@/components/ui/AddressAutocomplete";
import LocationPinPicker from "@/components/ui/LocationPinPicker";
import { getRoom, updateRoom } from "@/features/rooms/services/room.service";
import { getProfile } from "@/features/auth/services/auth.service";
import { Room } from "@/features/rooms/types";
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

// Uploaded media may be a path relative to the API origin (e.g.
// "/uploads/...") — same helper as the room detail/card views.
const getMediaUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

// Same form as create (app/rooms/create/page.tsx) — prefilled from the
// existing listing and PATCHing instead of POSTing. The one structural
// difference is images/videos: create only ever adds new files, edit also
// has to let the owner remove media that's already on the listing, so
// "existing" (URLs, removable) and "new" (Files, to upload) are tracked
// separately and merged into one array on submit.
export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [ownerCheckDone, setOwnerCheckDone] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [notFound, setNotFound] = useState(false);

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

  // Already on the listing — kept unless the owner removes them here.
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoUploadError, setVideoUploadError] = useState<string>("");
  const [uploadingVideos, setUploadingVideos] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isNaN(id)) {
      setOwnerCheckDone(true);
      return;
    }

    (async () => {
      try {
        const [room, profile]: [Room, { id: number }] = await Promise.all([
          getRoom(id),
          getProfile(),
        ]);

        if (profile.id !== room.ownerId) {
          setIsOwner(false);
          return;
        }

        setIsOwner(true);
        setExistingImages(room.images ?? []);
        setExistingVideos(room.videos ?? []);
        setForm({
          name: room.name,
          category: room.category,
          propertyType: room.propertyType,
          price: String(room.price),
          description: room.description,
          phoneNumber: room.phoneNumber ?? "",
          whatsappNumber: room.whatsappNumber ?? "",
          bedrooms: String(room.bedrooms),
          bathrooms: String(room.bathrooms),
          address: room.location.address,
          area: room.location.area,
          lat: room.location.lat ?? null,
          lng: room.location.lng ?? null,
          availableFrom: room.availableFrom?.slice(0, 10) ?? "",
          deposit: String(room.deposit),
          leaseTerm: room.leaseTerm,
          furnished: room.furnished,
          parking: room.parking,
          wifi: room.wifi,
          electricityIncluded: room.electricityIncluded,
          waterIncluded: room.waterIncluded,
          petsAllowed: room.petsAllowed,
        });
      } catch (err) {
        console.error("Failed to load room:", err);
        setNotFound(true);
      } finally {
        setOwnerCheckDone(true);
      }
    })();
  }, [id]);

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

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index: number) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setUploadError(`File "${file.name}" is not a supported image format. Please use JPEG, PNG, WebP, or GIF.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File "${file.name}" exceeds the 5MB limit.`);
        continue;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (existingImages.length + images.length + newFiles.length > 10) {
      setUploadError("You can upload a maximum of 10 images.");
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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

    if (existingVideos.length + videos.length + newFiles.length > MAX_VIDEOS) {
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

  const uploadImagesToServer = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room/upload`,
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
        throw new Error(errorData.message || "Failed to upload images");
      }

      const data = await response.json();
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
        images: [...existingImages, ...uploadedImageUrls],
        videos: [...existingVideos, ...uploadedVideoUrls],
      };

      await updateRoom(id, roomData);

      toast.success("Property updated", {
        description: `"${form.name}" has been saved.`,
      });

      router.push(`/rooms/${id}`);
    } catch (error: any) {
      alert(error.message || "Failed to save changes. Please try again.");
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
    { id: "section-basics", label: "Basic Information" },
    { id: "section-images", label: "Photos" },
    { id: "section-videos", label: "Videos" },
    { id: "section-pricing", label: "Pricing" },
    { id: "section-details", label: "Property Details" },
    { id: "section-location", label: "Location" },
    { id: "section-availability", label: "Availability" },
    { id: "section-amenities", label: "Amenities" },
  ];

  if (!authChecked || !ownerCheckDone) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100" />
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4 pt-24">
        <AuthGate
          nextPath={`/rooms/${id}/edit`}
          title="Sign in to edit your property"
          message="Log in with the account that listed it."
          browseHref="/?view=rooms"
          accent="from-green-600 to-emerald-600"
        />
      </main>
    );
  }

  if (notFound || !isOwner) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4 pt-24">
        <div className="flex items-center justify-center py-32 text-gray-500">
          {notFound ? "Property not found." : "You can only edit your own listings."}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4 pb-10 pt-24">
      <FormProgress
        sections={FORM_SECTIONS}
        accent="from-green-500 to-emerald-600"
      />

      {/* Background blobs */}
      <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/10 blur-3xl" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-2xl"
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
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-xl"
            >
              <BedDouble size={30} className="text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900">
              Edit Your Property
            </h1>

            <p className="mt-2 text-gray-500">
              Update the details below — changes go live as soon as you save.
            </p>
          </div>

          <motion.form
            variants={container}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Basic Information */}
            <motion.div id="section-basics" variants={item}>
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
            </motion.div>

            {/* Image Upload */}
            <motion.div id="section-images" variants={item}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Image size={16} className="text-green-600" />
                Property Images
              </h2>

              <div className="space-y-4">
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingImages.map((url, index) => (
                      <div
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={getMediaUrl(url)}
                          alt={`Property ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600"
                          disabled={uploadingImages || loading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image upload button */}
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
                        {uploadingImages ? 'Uploading...' : 'Click to add more images'}
                      </span>
                      <span className="text-xs text-gray-400">
                        JPEG, PNG, WebP, GIF (max 5MB each, up to 10 images total)
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

                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}

                {duplicateWarnings.length > 0 && (
                  <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                    {duplicateWarnings.map((warning, i) => (
                      <p key={i}>⚠️ {warning}</p>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video Upload */}
            <motion.div id="section-videos" variants={item}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Video size={16} className="text-green-600" />
                Property Videos
                <span className="text-xs font-normal text-gray-400">(optional)</span>
              </h2>

              <div className="space-y-4">
                {/* Existing videos */}
                {existingVideos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingVideos.map((url, index) => (
                      <div
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-black"
                      >
                        <video
                          src={getMediaUrl(url)}
                          controls
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingVideo(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600"
                          disabled={uploadingVideos || loading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New video upload button */}
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
                        {uploadingVideos ? 'Uploading...' : 'Click to add more videos'}
                      </span>
                      <span className="text-xs text-gray-400">
                        MP4, MOV, WebM, AVI (max 50MB each, up to {MAX_VIDEOS} videos total)
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

                {videoUploadError && (
                  <p className="text-sm text-red-500">{videoUploadError}</p>
                )}

                {/* New video previews */}
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
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div id="section-pricing" variants={item}>
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
            </motion.div>

            {/* Property Details */}
            <motion.div id="section-details" variants={item}>
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
            </motion.div>

            {/* Location */}
            <motion.div id="section-location" variants={item}>
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
                    The address search gets you close — drag the pin (or tap
                    the map) to the exact gate or entrance. This is what
                    tenants will actually navigate to.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Availability */}
            <motion.div id="section-availability" variants={item}>
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
            </motion.div>

            {/* Contact — what the listing's Call/WhatsApp buttons use */}
            <motion.div variants={item}>
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
            </motion.div>

            {/* Amenities */}
            <motion.div id="section-amenities" variants={item}>
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
            </motion.div>

            <motion.button
              variants={item}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              disabled={loading || uploadingImages || uploadingVideos}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-green-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploadingImages
                    ? 'Uploading Images...'
                    : uploadingVideos
                    ? 'Uploading Videos...'
                    : 'Saving...'}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Save Changes
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </motion.div>
    </main>
  );
}
