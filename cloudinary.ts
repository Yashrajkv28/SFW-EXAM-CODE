
export const cloudinaryConfig = {
    cloudName: (import.meta.env as any).VITE_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME",
    uploadPreset: (import.meta.env as any).VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET"
};

// A function to check if the cloudinary config is set
export const isCloudinaryConfigured = cloudinaryConfig.cloudName !== "YOUR_CLOUD_NAME" && cloudinaryConfig.uploadPreset !== "YOUR_UPLOAD_PRESET";

export const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!isCloudinaryConfigured) {
        throw new Error("Cloudinary is not configured. Please update cloudinary.ts");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url;
};
