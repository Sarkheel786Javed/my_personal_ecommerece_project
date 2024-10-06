// cloudinaryConfig.ts
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'dtlsdwjrh',
  api_key: '538887555266698',
  api_secret: "cLMDmOiZ7CVfvS-VbyHquBTry4k"
});

// Test function to upload an image
const testCloudinaryConnection = async () => {
  try {
    // Replace 'path/to/your/image.jpg' with the path to an image file
    const result = await cloudinary.v2.uploader.upload('D:\ecommerece\my_personal_ecommerece_project\backend\config\test-cloudnary-image.jpg', {
      folder: 'test_uploads',
    });
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
  }
};

// Run the test
// testCloudinaryConnection();

export default cloudinary;
