import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAudio } from '../hooks/useAudio';
import Svg, { Path } from 'react-native-svg';
import SummariseIcon from '../icons/SummariseIcon';
import { Slider } from '@react-native-assets/slider';
import Insights from './Insights';


export default function Audioplayer() {
    const [showSummary, setShowSummary] = useState(false);

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
        onSeekChange,
        onSeekStart,
    } = useAudio();

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

    const isLoadingState = isLoading || isBuffering;

    useEffect(() => {
        if (currentTime >= duration && isPlaying) {
            pause();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime, duration, isPlaying]);

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
                                    <ActivityIndicator color='#111' style={{ backgroundColor: '#ddd', borderRadius: 10 }} size={16} />
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
                        <Slider
                            style={styles.slider}
                            value={currentTime}
                            minimumValue={0}
                            maximumValue={duration || 1}
                            onSlidingStart={onSeekStart}
                            onValueChange={onSeekChange}
                            minimumTrackTintColor="#111"
                            maximumTrackTintColor="#ddd"
                            thumbTintColor="#111"
                            trackHeight={3}
                            thumbSize={12}
                            onSlidingComplete={seek}
                        />
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
                <SummariseIcon showSummary={showSummary} setShowSummary={setShowSummary} />
            </View>
            {showSummary && <Insights />}
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
    slider: {
        flex: 1,
        height: 40,
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
    speedButton: {
        borderRadius: 6,
        width: 26,
    },
    speedButtonText: {
        fontSize: 12,
        color: '#666',
    },
});
