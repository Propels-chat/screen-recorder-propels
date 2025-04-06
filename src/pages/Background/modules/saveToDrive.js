import signIn from "./signIn";

const getCognitoToken = () => {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll(
      {
        domain: process.env.DASHBOARD_URL,
      },
      (cookies) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting cookies:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        const idToken = cookies.find(
          (cookie) =>
            cookie.name.includes("CognitoIdentityServiceProvider") &&
            cookie.name.endsWith("idToken")
        );

        if (idToken) {
          resolve({ idToken: idToken.value });
        } else {
          reject(new Error("NO_TOKEN_FOUND"));
        }
      }
    );
  });
};

// Function to upload a video to AWS S3
const saveToDrive = async (videoBlob, fileName, sendResponse) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getCognitoToken();
      // First, get the presigned URL from the API
      const getPresignedUrlResponse = await fetch(
        process.env.VIDEOS_API_ENDPOINT,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mimeType: "video/webm",
          }),
        }
      );

      if (!getPresignedUrlResponse.ok) {
        if (getPresignedUrlResponse.status === 401) {
          throw new Error("TOKEN_EXPIRED");
        }
        throw new Error(
          `Error getting presigned URL: ${getPresignedUrlResponse.status}`
        );
      }

      const responseData = await getPresignedUrlResponse.json();

      const presigned_url = responseData.presigned_url;
      const upload_path = responseData.upload_path;
      const video_id = responseData.video_id;

      console.log("Presigned URL generated");
      console.info("S3 File Key:", upload_path);
      console.log("Video ID:", video_id);

      if (!presigned_url) {
        throw new Error("Failed to get presigned URL from response");
      }

      console.log(`type of responseData: ${typeof responseData}`);

      console.log(`presigned_url: ${presigned_url}`);
      // Upload the video to S3 using the presigned URL
      const uploadResponse = await fetch(presigned_url, {
        method: "PUT",
        headers: {
          "Content-Type": videoBlob.type,
        },
        body: videoBlob,
      });

      console.info("S3 Upload Response:", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        headers: Object.fromEntries(uploadResponse.headers.entries()),
      });

      if (!uploadResponse.ok) {
        throw new Error(`Error uploading to S3: ${uploadResponse.status}`);
      }

      // If upload is successful, resolve with success message
      const editorUrl = `https://${process.env.DASHBOARD_URL}/dashboard/${responseData.video_id}/edit`;
      chrome.tabs.create({
        url: editorUrl,
        active: true, // Make this tab active since user will want to edit the video
      });
      resolve({ success: true, message: "Video uploaded successfully" });
    } catch (error) {
      console.error("Error in upload:", error);
      reject(error);
    }
  });
};

export { getCognitoToken };
export default saveToDrive;
