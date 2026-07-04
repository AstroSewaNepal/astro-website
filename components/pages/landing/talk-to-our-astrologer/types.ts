export type AstrologerStatus = 'ONLINE' | 'OFFLINE' | string;

export interface ProfilePictureThumbnail {
  url?: string | null;
}

export interface ProfilePicture {
  url?: string | null;
  thumbnail?: ProfilePictureThumbnail | null;
}

export interface AstrologerUser {
  _id?: string;
  fullName?: string | null;
  profilePicture?: ProfilePicture | null;
}

export interface PackagePrice {
  currency?: string | null;
  value?: number | null;
}

export interface AstrologerPackage {
  _id?: string;
  cost?: PackagePrice | null;
  discountedPrice?: PackagePrice | null;
  discountPercent?: number | null;
}

export interface Astrologer {
  _id: string;
  averageRating?: number | null;
  services?: string[] | null;
  language?: string[] | null;
  yearsOfExperience?: number | null;
  expertise?: string[] | null;
  specialist?: string[] | null;
  chatAvailable?: boolean;
  callAvailable?: boolean;
  isBookingEnabled?: boolean;
  isAstrologerActive?: boolean;
  status?: AstrologerStatus | null;
  totalBookings?: number | null;
  user?: AstrologerUser | null;
  packages?: AstrologerPackage[] | null;
}

export interface AstrologerListResponse {
  astrologers?: Astrologer[];
  items?: Astrologer[];
  data?: Astrologer[];
  total?: number;
}

export interface BackendAstrologerResult<T> {
  success?: boolean;
  data?: T;
  errors?: Array<{ message?: string; statusCode?: number }>;
}

export type AstrologerCardActions = {
  onChat?: (astrologer: Astrologer) => void;
  onCall?: (astrologer: Astrologer) => void;
  onSchedule?: (astrologer: Astrologer) => void;
};
