import { MockResponseData } from '../types';

// Import the mock data
import mockData from '../../mockdata/mockResponseData.json';

export const loadMockData = (): MockResponseData => {
  return mockData as MockResponseData;
};

export const getMockAudioUrl = () => {
  // For testing purposes, using a remote audio file
  // In a real app, you could use bundled assets or remote URLs
  return 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba-online-audio-converter.com_-1.wav';
};
