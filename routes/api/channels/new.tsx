function randomChannel() {
    return crypto.randomUUID().slice(0, 8);
}

export const handler = () => {
    const channel = randomChannel();

    return new Response(
        JSON.stringify({
            channel,
            inspectUrl: `/inspect/${channel}`,
            webhookUrl: `/inspect/${channel}`,
        }),
        {
            headers: {
                "content-type": "application/json",
            },
        },
    );
};