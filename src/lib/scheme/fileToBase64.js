export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // remove data:image/*
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
