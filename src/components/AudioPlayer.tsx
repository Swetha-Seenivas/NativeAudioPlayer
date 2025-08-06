import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { useAudio } from '../hooks/useAudio';
import { MockResponseData } from '../types';
import { fetchInsights } from '../services/fetchInsights';
import Svg, { Path } from 'react-native-svg';
import SummariseIcon from '../icons/SummariseIcon';
import TranscriptView from './TranscriptView';


export default function Audioplayer() {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | null>('summary');
    const [transcriptData, setTranscriptData] = useState<MockResponseData | null>(null);
    const progressBarRef = React.useRef<View>(null);

    const {
        isPlaying,
        isLoading,
        isBuffering,
        currentTime,
        duration,
        playbackRate,
        play,
        pause,
        setPlaybackRate,
        seek,
        formatTime,
    } = useAudio();

    useEffect(() => {
        loadTranscriptData();
        setIsPlayerReady(true);
    }, []);


    const loadTranscriptData = async () => {
        try {
            fetchInsights({ connectionId: 'd6ae24f7-0528-4782-82c0-80247dc8a14c' }).then((data) => {
                if (data) {
                    setTranscriptData(data);
                }
            });
        } catch (error) {
            console.error('Error loading transcript data:', error);
        }
    };

    const togglePlayback = async () => {
        try {
            if (isPlaying) {
                pause();
            } else {
                play();
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };

    const seekToTime = async (timeInSeconds: number) => {
        try {
            seek(timeInSeconds);
        } catch (error) {
            console.error('Error seeking to time:', error);
        }
    };

    const isLoadingState = isLoading || isBuffering;

    if (!isPlayerReady) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.loadingText}>Setting up audio player...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.rowContainer}>
                <View style={styles.playerContainer}>
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={[styles.playButton, isLoadingState && styles.disabledButton]}
                            onPress={togglePlayback}
                            disabled={isLoadingState}
                        >
                            <Text style={styles.playButtonText}>
                                {isLoadingState ?
                                    <ActivityIndicator color='#676767' />
                                    : isPlaying ?
                                        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <Path d="M5.33301 3.40039C6.21637 3.40039 6.93358 4.11664 6.93359 5V11C6.93359 11.8834 6.21638 12.5996 5.33301 12.5996C4.44976 12.5995 3.7334 11.8833 3.7334 11V5C3.73341 4.11673 4.44977 3.40054 5.33301 3.40039Z" fill="#676767" />
                                            <Path d="M10.667 3.40039C11.5502 3.4006 12.2666 4.11677 12.2666 5V11C12.2666 11.8832 11.5502 12.5994 10.667 12.5996C9.78362 12.5996 9.06641 11.8834 9.06641 11V5C9.06642 4.11664 9.78363 3.40039 10.667 3.40039Z" fill="#676767" />
                                        </Svg> :
                                        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <Path fill-rule="evenodd" clip-rule="evenodd" d="M5.29186 3.12296L12.201 7.26863C12.753 7.59967 12.753 8.40082 12.201 8.73186L5.29186 12.8775C4.72363 13.2179 4.00012 12.8084 4.00012 12.1455V3.85415C4.00012 3.19122 4.72363 2.78169 5.29186 3.12296Z" fill="#676767" stroke="#676767" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                        </Svg>
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.progressContainer}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <TouchableWithoutFeedback
                            onPress={(event) => {
                                const { locationX } = event.nativeEvent;
                                progressBarRef.current?.measure((x, y, width, _height, _pageX, _pageY) => {
                                    const seekPosition = (locationX / width) * duration;
                                    seek(seekPosition);
                                });
                            }}
                        >
                            <View style={styles.progressBar} ref={progressBarRef}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(currentTime / duration) * 100}%` }
                                    ]}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                    <View style={styles.speedContainer}>
                        <TouchableOpacity
                            style={styles.speedButton}
                            onPress={() => {
                                Alert.alert(
                                    'Playback Speed',
                                    '',
                                    [
                                        { text: '0.5x', onPress: () => { setPlaybackRate(0.5); } },
                                        { text: '1x', onPress: () => { setPlaybackRate(1); } },
                                        { text: '1.5x', onPress: () => { setPlaybackRate(1.5); } },
                                        { text: '2x', onPress: () => { setPlaybackRate(2); } },
                                    ]
                                );
                            }}
                        >
                            <Text style={styles.speedButtonText}>{`${playbackRate}x`}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* {showSummary ? 'Hide' : 'Show'} */}
                <SummariseIcon showSummary={showSummary} setShowSummary={setShowSummary} />
            </View>
            {showSummary && (
                <View style={styles.summaryContainer}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'summary' && styles.activeTabButton
                            ]}
                            onPress={() => {
                                setActiveTab('summary');
                            }}
                        >
                            <Text style={[
                                styles.tabButtonText,
                                activeTab === 'summary' && styles.activeTabText
                            ]}>
                                Summary
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'transcript' && styles.activeTabButton
                            ]}
                            onPress={() => {
                                setActiveTab('transcript');
                            }}
                        >
                            <Text style={[
                                styles.tabButtonText,
                                activeTab === 'transcript' && styles.activeTabText
                            ]}>
                                Transcript
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'summary' && transcriptData && (
                        <View style={styles.contentContainer}>
                            <Text style={styles.contentText}>
                                {transcriptData.data.summary.text}
                            </Text>
                        </View>
                    )}

                    {activeTab === 'transcript' && transcriptData && (
                        <View style={{ ...styles.contentContainer, ...styles.transcriptionContainer }}>
                            <View style={styles.transcriptContainer}>
                                <TranscriptView
                                    words={transcriptData.data.transcript.data.words}
                                    speakerLabels={transcriptData.data.transcript.speakerLabels}
                                    currentTime={currentTime}
                                    onWordPress={seekToTime}
                                    autoScroll={true}
                                />
                            </View>
                        </View>
                    )}
                </View>

            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 250,
        margin: 10,
        backgroundColor: '#ffffff',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 12,
        color: '#666',
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    playerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 4,
        height: 42,
        width: '85%',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 25,
    },
    trackArtist: {
        fontSize: 12,
        color: '#666',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '85%'
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    progressBar: {
        flex: 1,
        height: 3,
        backgroundColor: '#ddd',
        borderRadius: 6,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#111111',
        borderRadius: 6,
    },
    controls: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    playButtonText: {
        fontSize: 20,
        color: 'white',
    },
    speedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
    },
    speedLabel: {
        fontSize: 12,
        color: '#333',
    },
    speedButton: {
        borderRadius: 6,
        width: 26,
    },
    speedButtonText: {
        fontSize: 12,
        color: '#666',
    },
    summaryContainer: {
        marginHorizontal: 4,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
    },
    tabContainer: {
        backgroundColor: '#fafafa',
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        paddingHorizontal: 10,
        flexDirection: 'row',
        gap: 14,
        marginBottom: 6,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderColor: '#d6dce0',
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderColor: '#333',
    },
    tabButtonText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    contentContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    transcriptionContainer: {
        paddingRight: 0,
        minHeight: 200,
    },
    contentText: {
        fontSize: 12,
        lineHeight: 24,
        color: '#666',
    },
    activeTabText: {
        fontWeight: '600',
    },
    transcriptContainer: {
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
    },
});
