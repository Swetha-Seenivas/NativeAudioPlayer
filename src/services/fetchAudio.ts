
import { INBOUND_BASE_URLS_LIVE, INBOUND_BASE_URLS_STAGING } from '../lib/constants';
import { type AppEnv, getEnvironment, isEnvironment, isProduction } from '../lib/enviroment';

interface CallRecordingParams {
	connectionId: string;
	brandId?: string;
	getAccessToken: () => Promise<string>;
	uniquePin?: string;
	mode?: AppEnv;
	callRecApiKey?: string;
	messageSavedTime?: number;
}

interface CallRecordingResponse {
	availableFor: number;
	data: string;
	expiryTime: number;
}

const fetchCallRecordingUrl = async ({
	connectionId,
	brandId,
	getAccessToken,
	uniquePin,
	mode,
	callRecApiKey,
	messageSavedTime,
}: CallRecordingParams): Promise<CallRecordingResponse> => {
	if (isProduction(mode) || getEnvironment(mode) === 'staging') {
		if (!brandId) {
			throw new Error('Missing required parameter brandId');
		}
		const accessToken = await getAccessToken();
		const baseURL = isProduction(mode) ? INBOUND_BASE_URLS_LIVE[brandId] : INBOUND_BASE_URLS_STAGING[brandId];
		const response = await fetch(
			`${baseURL}/v3/services/aws/getCallRecording/connectionId/${connectionId}?uniquePin=${uniquePin}&messageSavedTime=${messageSavedTime}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		if (!response.ok) {
			throw new Error(`Error fetching call recording URL: ${response.statusText}`);
		}
		const data = await response.json();
		return data;
	}
	if (isEnvironment(mode, 'development') || isEnvironment(mode, 'dev-preview')) {
		if (callRecApiKey === undefined) {
			throw new Error('Missing required param callRecApiKey');
		}
		const response = await fetch('https://oa706f8gc6.execute-api.us-east-1.amazonaws.com/prod/getrecording', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': callRecApiKey,
			},
			body: JSON.stringify({ contactId: connectionId }),
		});
		const data = await response.json();
		return {
			availableFor: data.availableFor as number,
			data: (data.data ?? data.signedURL) as string,
			expiryTime: (data.expiryTime as number) || Date.now() + 30 * 60 * 1000, // Default to 30 minutes if expiryTime is not provided
		};
	}
	return { availableFor: 0, data: '', expiryTime: 0 };
};

async function fetchAudio(audioUrl: string) {
	const response = await fetch(audioUrl);
	const audioBlob = await response.blob();
	const audioURL = URL.createObjectURL(audioBlob);
	return audioURL;
}
export { fetchCallRecordingUrl, fetchAudio };
