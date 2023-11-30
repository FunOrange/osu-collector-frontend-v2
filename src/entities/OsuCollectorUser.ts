import { OsuUser } from "@/entities/OsuUser";

export interface OsuCollectorUser {
  ircName: string;
  id: number;
  npCollectionId: any;
  favouriteTournaments: number[];
  uploads: any[];
  favourites: number[];
  osuweb: OsuUser;
  private: Private;
  paidFeaturesAccess: boolean;
}

interface Private {
  linkedTwitchAccount: LinkedTwitchAccount;
  stripeSubscriptionId: string;
  twitchError: boolean;
  twitchToken: TwitchToken;
  subscriptionExpiryDate: SubscriptionExpiryDate;
  paypalSubscriptionId: string;
  stripeCustomer: StripeCustomer;
}

interface LinkedTwitchAccount {
  profilePictureUrl: string;
  displayName: string;
  name: string;
  id: string;
}

interface TwitchToken {
  expiresIn: number;
  scope: string[];
  obtainmentTimestamp: number;
  accessToken: string;
  refreshToken: string;
}

interface SubscriptionExpiryDate {
  _seconds: number;
  _nanoseconds: number;
}

interface StripeCustomer {
  id: string;
  email: string;
}
