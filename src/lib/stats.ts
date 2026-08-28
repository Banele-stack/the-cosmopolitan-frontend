import { CERTIFICATION_TYPES, type Certification, type CertificationType } from "@/lib/types";

export interface CertTypeBreakdown {
  type: CertificationType;
  total: number;
  valid: number;
  expiringSoon: number;
  critical: number; // Expired + Red-Flagged
}

export function getCertTypeBreakdown(certifications: Certification[]): CertTypeBreakdown[] {
  return CERTIFICATION_TYPES.map((type) => {
    const certs = certifications.filter((c) => c.type === type);
    return {
      type,
      total: certs.length,
      valid: certs.filter((c) => c.status === "Valid").length,
      expiringSoon: certs.filter((c) => c.status === "Expiring Soon").length,
      critical: certs.filter((c) => c.status === "Expired" || c.status === "Red-Flagged").length,
    };
  });
}
