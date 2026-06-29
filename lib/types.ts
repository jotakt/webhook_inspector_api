export type WebhookLog = {
  id: string;
  channel: string;
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  bodyText: string;
  bodyJson: unknown | null;
  contentType: string | null;
  receivedAt: string;
  sizeBytes: number;
  remoteAddr: string | null;
};

export type ChannelConfig = {
  channel: string;
  name: string;
  forwardTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RelayAttempt = {
  id: string;
  channel: string;
  webhookLogId: string;
  targetUrl: string;
  status: "success" | "error";
  responseStatus: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  durationMs: number;
  createdAt: string;
};