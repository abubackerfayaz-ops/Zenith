import api from './api';

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/upload/image', form);
  return res.data?.url || res.data?.data?.url;
}

export async function uploadVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/upload/video', form);
  return res.data?.url || res.data?.data?.url;
}
