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
