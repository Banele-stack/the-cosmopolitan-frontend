const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SignupDto {
  firstName: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  socialLink?: string;
  tiktokUrl?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    fullName: string;
    phoneNumber: string;
  };
}

export interface OnboardingStatusResponse {
  hasBusiness: boolean;
  hasRoom: boolean;
  hasListings: boolean;
}

export async function signup(
  data: SignupDto,
): Promise<SignupResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

   // ✅ Save the JWT
  localStorage.setItem("token", result.access_token);

  return result;
}


export async function login(
  data: LoginDto,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  localStorage.setItem("token", result.access_token);

  return result;
}

export async function getProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json();
}

export async function updateProfile(data: {
  firstName?: string;
  surname?: string;
  socialLink?: string;
  tiktokUrl?: string;
}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update profile.");
  }

  return result;
}

export function logout() {
  localStorage.removeItem("token");
}


export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const token = localStorage.getItem("token");
  console.log("Token:", token); // Debugging line

  const response = await fetch(`${API_URL}/users/onboarding-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch onboarding status.");
  }

  return response.json();
}


export async function sendEmailVerification() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/auth/send-email-verification`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send email verification.");
  }

  return result;
}

export async function sendPhoneVerification() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/auth/send-phone-verification`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send SMS verification.");
  }

  return result;
}

export async function verifyEmail(code: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function verifyPhone(code: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/verify-phone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}