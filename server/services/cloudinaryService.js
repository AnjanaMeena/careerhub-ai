const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Supports PDF, DOC, DOCX
      folder: "careerhub_resumes"
    });
    console.log(result);
    console.log("========== CLOUDINARY SUCCESS ==========");
    console.log("Public ID:", result.public_id);
    console.log("Secure URL:", result.secure_url);
    console.log("========================================");

    return result.secure_url;
  } catch (error) {
    console.log("========== CLOUDINARY ERROR ==========");
    console.log(error);
    console.log("======================================");

    return null;
  }
};

module.exports = {
  uploadToCloudinary
};