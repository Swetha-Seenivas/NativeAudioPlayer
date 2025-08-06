import { TranscriptSegment, SpeakerLabels } from '../types';

async function fetchInsights({
    connectionId,
}: { 
    connectionId: string; 
}): Promise<
    { summary: string; transcript: TranscriptSegment[]; speakerLabels: SpeakerLabels } | undefined
> {
    const accessToken = '';
    
    try {
        const result = await fetch(`https://backend.switchport.app/api/v1/call/insights/${connectionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ components: ['transcript', 'summary'] }),
        });

        if (!result.ok) {
            throw new Error(`Error fetching insights: ${result.statusText} (${result.status})`);
        }

        const data = await result.json();
        return data;
        
    } catch (error) {
        console.error('Error fetching insights:', error);
        return undefined;
    }
}

export { fetchInsights };
