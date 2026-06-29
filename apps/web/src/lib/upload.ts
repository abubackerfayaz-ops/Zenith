import api from './api';

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.url || res.data?.data?.url;
}

export async function uploadVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/upload/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.url || res.data?.data?.url;
}
