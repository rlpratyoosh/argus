"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import api from "@/libs/axios";
import { ArrowLeft, Camera, ChevronDown, ChevronUp, MapPin, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MapWithNoSSR = dynamic(() => import("@/components/Map/FormMapComponent"), {
    ssr: false,
    loading: () => <div className="h-screen w-screen bg-zinc-900 animate-pulse" />,
});

interface IncidentFormState {
    title: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    images: string[]; // Base64 encoded images
    latitude: number;
    longitude: number;
}

function getSeverityColor(level: string) {
    switch (level) {
        case "LOW":
            return "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]";
        case "MEDIUM":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(250,204,21,0.2)]";
        case "HIGH":
            return "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(251,146,60,0.2)]";
        case "CRITICAL":
            return "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]";
        default:
            return "bg-zinc-800";
    }
}

function FormContent({
    formData,
    setFormData,
    coords,
    handleSeveritySelect,
    handleSubmit,
    isSubmitting,
}: {
    formData: IncidentFormState;
    setFormData: (data: IncidentFormState) => void;
    coords: { lat: number; lng: number } | undefined;
    handleSeveritySelect: (level: IncidentFormState["severity"]) => void;
    handleSubmit: () => void;
    isSubmitting: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Limit to 3 images max
        const remainingSlots = 3 - formData.images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setFormData({
                    ...formData,
                    images: [...formData.images, base64],
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Incident Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Transformer Fire"
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(level => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => handleSeveritySelect(level as any)}
                            className={`
                                py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all border
                                ${
                                    formData.severity === level
                                        ? getSeverityColor(level)
                                        : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700"
                                }
                            `}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the situation..."
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Photos <span className="text-zinc-600">({formData.images.length}/3)</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                    {/* Image Previews */}
                    {formData.images.map((img, index) => (
                        <div
                            key={index}
                            className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group"
                        >
                            <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {/* Add Image Button */}
                    {formData.images.length < 3 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 bg-zinc-800/30 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all"
                        >
                            <Camera className="w-5 h-5" />
                            <span className="text-[9px] font-medium">Add</span>
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
                <p className="text-[10px] text-zinc-600">Upload up to 3 photos (max 5MB each)</p>
            </div>

            <div className="flex gap-3 px-6 py-4 bg-black/20 rounded-4xl border border-white/5">
                <MapPin className="w-5 h-5 text-blue-400 mt-1" />
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-400">Selected Location</span>
                    <span className="text-sm font-mono text-blue-200">
                        {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "Select on map..."}
                    </span>
                </div>
            </div>

            <div className="pt-2 flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group relative w-fit flex items-center justify-center gap-3 py-4
                        rounded-full 
                        bg-zinc-900/70 backdrop-blur-md
                        border border-white/20
                        text-white
                        shadow-lg shadow-blue-500/20
                        hover:bg-zinc-800/80 hover:shadow-blue-500/40 hover:border-white/40
                        transition-all duration-300 ease-out
                        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">Sending Alert...</span>
                    ) : (
                        <div className="w-full flex items-center justify-center px-6 py-2 gap-2">
                            <div className="relative flex items-center justify-center w-6 h-6">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-[0_0_15px_rgba(96,165,250,0.8)]"></span>
                            </div>

                            <span className="font-bold tracking-wide text-sm uppercase text-blue-50 group-hover:text-white transition-colors">
                                Confirm Incident
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function CreateIncidentForm() {
    const { location, getLocation } = useGeolocation();
    const router = useRouter();

    const [isMobileSheetOpen, setMobileSheetOpen] = useState(true);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<IncidentFormState>({
        title: "",
        description: "",
        severity: "MEDIUM",
        images: [],
        latitude: 0,
        longitude: 0,
    });

    useEffect(() => {
        if (location.latitude && location.longitude) {
            const newPos = { lat: location.latitude, lng: location.longitude };
            setCoords(newPos);
            setFormData(prev => ({ ...prev, latitude: newPos.lat, longitude: newPos.lng }));
        }
    }, [location]);

    const handleMapPositionChange = (lat: number, lng: number) => {
        setCoords({ lat, lng });
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    };

    const handleSeveritySelect = (level: IncidentFormState["severity"]) => {
        setFormData(prev => ({ ...prev, severity: level }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in all required fields");
            return;
        }

        if (!coords || coords.lat === 0 || coords.lng === 0) {
            alert("Please select a location on the map");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post("/incident", {
                title: formData.title,
                description: formData.description,
                severity: formData.severity,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: formData.images,
            });

            router.push("/report");
        } catch (err: any) {
            console.error("Failed to submit incident", err);
            alert(err.response?.data?.message || "Failed to submit incident. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-30 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="absolute inset-0 z-0">
                <MapWithNoSSR pos={coords} onPositionChange={handleMapPositionChange} />

                <button
                    onClick={() => getLocation()}
                    className="absolute top-20 right-3 md:bottom-10 md:top-auto md:right-112.5 z-20 p-3 bg-zinc-900/80 backdrop-blur text-blue-400 rounded-full border border-white/10 shadow-xl hover:bg-zinc-800 transition-all"
                >
                    <MapPin className="w-6 h-6" />
                </button>
            </div>

            <div className="hidden md:flex absolute bottom-6 right-6 w-100 flex-col z-20">
                <div className="flex flex-col h-full w-full rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-linear-to-b from-white/5 to-transparent">
                        <h2 className="text-2xl font-bold text-white">New Incident</h2>
                        <p className="text-xs text-zinc-400">Drag marker to pinpoint location</p>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <FormContent
                            formData={formData}
                            setFormData={setFormData}
                            coords={coords}
                            handleSeveritySelect={handleSeveritySelect}
                            handleSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            <div
                className={`
                    md:hidden fixed bottom-0 left-0 right-0 z-20 
                    bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 
                    rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                    transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                    flex flex-col
                `}
                style={{
                    height: "85vh",
                    transform: isMobileSheetOpen ? "translateY(0%)" : "translateY(calc(85vh - 80px))",
                }}
            >
                <div
                    onClick={() => setMobileSheetOpen(!isMobileSheetOpen)}
                    className="w-full h-16 flex items-center justify-center relative cursor-pointer shrink-0 bg-linear-to-b from-white/5 to-transparent"
                >
                    <div className="w-12 h-1.5 bg-zinc-600 rounded-full absolute top-3" />
                    <span className="text-sm font-semibold text-zinc-300 mt-2">
                        {isMobileSheetOpen ? "Tap map to minimize" : "Swipe up to report details"}
                    </span>
                    {isMobileSheetOpen ? (
                        <ChevronDown className="absolute right-6 text-zinc-500 w-5 h-5" />
                    ) : (
                        <ChevronUp className="absolute right-6 text-zinc-500 w-5 h-5" />
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 pb-10">
                    <FormContent
                        formData={formData}
                        setFormData={setFormData}
                        coords={coords}
                        handleSeveritySelect={handleSeveritySelect}
                        handleSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
}
