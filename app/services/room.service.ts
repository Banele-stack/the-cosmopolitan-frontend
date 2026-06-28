const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getRooms = async () => {
  const response = await fetch(`${API_URL}/room`);

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return response.json();
};

export const getRoom = async (id: number) => {
  const response = await fetch(`${API_URL}/room/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  return response.json();
};