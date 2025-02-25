// audioUtils.js
export const recordAudio = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    return new Promise((resolve, reject) => {
      recorder.ondataavailable = event => chunks.push(event.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/wav' }));
      recorder.onerror = reject;
      recorder.start();
    });
  } catch (error) {
    console.error('Error recording audio:', error);
  }
};

export const uploadAudioToCloudinary = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET); // Cloudinary preset

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.secure_url; // Return the URL of the uploaded audio
};

export const transcribeAudio = async (audioUrl) => {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_ASSEMBLY_AI_API_KEY}`,
    },
    body: JSON.stringify({ audio_url: audioUrl }),
  });

  const data = await response.json();
  return data.text; // Return the transcribed text
};