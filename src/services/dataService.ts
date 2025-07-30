import { MockResponseData } from '../types';

// Import the mock data
import mockData from '../../mockdata/mockResponseData.json';

export const loadMockData = (): MockResponseData => {
  return mockData as MockResponseData;
};

export const getMockAudioUrl = () => {
  // In a real app, this would be the actual URL to your audio file
  // For now, we'll use a bundled asset path
  return require('../../mockdata/audio.wav');
};
