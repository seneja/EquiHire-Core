import { useState, useEffect, useRef } from 'react';
import { useInterviewSocket } from '@/hooks/useInterviewSocket';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Settings, MessageSquare } from "lucide-react";
import { EquiHireLogo } from "@/components/ui/Icons";

export default function CandidateInterview() {
    const [isMicOn, setIsMicOn] = useState(false); // Default off until perm granted
    const [transcript, setTranscript] = useState<string[]>([]);
    const [token, setToken] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(5).fill(0));

    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('invitationToken');
        if (storedToken) setToken(storedToken);

        // Start Mic immediately
        startMicrophone();

        return () => {
            stopMicrophone();
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsMicOn(true);

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 32; // Small FFT for few bars

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            updateVisualizer();
        } catch (err) {
            console.error("Microphone access denied:", err);
            setIsMicOn(false);
        }
    };

    const stopMicrophone = () => {
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setIsMicOn(false);
    };

    const updateVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Pick 5 distinct points/averages from the low-mid frequency range
        const displayData = new Uint8Array(5);
        displayData[0] = dataArray[1];  // Low
        displayData[1] = dataArray[3];
        displayData[2] = dataArray[5];  // Mid
        displayData[3] = dataArray[7];
        displayData[4] = dataArray[9];  // High-Mid

        setAudioData(displayData);
        rafRef.current = requestAnimationFrame(updateVisualizer);
    };

    const toggleMic = () => {
        if (isMicOn) {
            stopMicrophone(); // Actually stops processing, though getting stream again might need re-prompt if completely stopped. 
            // Better: just suspend context or weird user experience? 
            // For simplicity: Stop functionality.
        } else {
            startMicrophone();
        }
    };

    // Pass the token explicitly to the hook
    const { transcripts } = useInterviewSocket('ws://localhost:9091/dashboard', token);

    useEffect(() => {
        if (transcripts.length > 0) {
            setTranscript(transcripts.slice(-5));
        }
    }, [transcripts]);

    return (
        <div className="min-h-screen bg-[#111827] flex flex-col font-sans text-white overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF7300]/10 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 lg:px-12 z-10 border-b border-gray-800/50 backdrop-blur-sm">
                <div className="flex items-center">
                    <EquiHireLogo className="mr-3 w-8 h-8 text-white" />
                    <span className="font-semibold text-lg tracking-tight">EquiHire</span>
                    <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                        Live Session
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400 hidden sm:inline-block">Time Remaining: <span className="text-white font-mono">{formatTime(timeLeft)}</span></span>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">

                {/* Visualizer Area */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                        {/* Animated Pulses (Reacting to Volume) */}
                        {/* Calculate simple volume average for pulse effect */}
                        {(() => {
                            const avgVol = (audioData[0] + audioData[2] + audioData[4]) / 3;
                            const scale = 1 + (avgVol / 255) * 0.5; // Scale from 1.0 to 1.5
                            return (
                                <>
                                    <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 transition-transform duration-75`}
                                        style={{ transform: `scale(${scale})`, opacity: isMicOn ? 0.8 : 0.2 }}></div>
                                    <div className={`absolute inset-4 rounded-full border border-blue-400/20 transition-transform duration-100`}
                                        style={{ transform: `scale(${scale * 0.9})`, opacity: isMicOn ? 0.6 : 0.1 }}></div>
                                </>
                            );
                        })()}

                        {/* Core Avatar/Visualizer */}
                        <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-2xl shadow-blue-900/50 flex items-center justify-center relative overflow-hidden backdrop-blur-md border border-white/10">
                            {/* Inner Waveform Effect */}
                            <div className="flex items-end justify-center space-x-1 h-12">
                                {[0, 1, 2, 3, 4].map((i) => {
                                    const height = Math.max(4, (audioData[i] / 255) * 40);
                                    return (
                                        <div
                                            key={i}
                                            className={`w-2 bg-white/80 rounded-full transition-all duration-75`}
                                            style={{ height: `${height}px` }}
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="absolute -bottom-12 text-center">
                            <h2 className="text-xl font-medium text-white">Interview is in progress</h2>
                            <p className="text-sm text-blue-300/80 mt-1">Your identity is protected</p>
                        </div>
                    </div>
                </div>

                {/* Subtitles / Transcript Preview */}
                <div className="w-full max-w-2xl h-24 mt-8 mb-8 flex flex-col items-center justify-end space-y-2 pointer-events-none">
                    {transcript.map((text, i) => (
                        <div key={i} className="text-lg md:text-xl text-white/90 font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 text-center drop-shadow-md">
                            "{text}"
                        </div>
                    ))}
                </div>

            </main>

            {/* Bottom Controls */}
            <footer className="h-24 pb-6 flex items-center justify-center z-10">
                <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-full px-8 py-4 flex items-center space-x-6 shadow-2xl">
                    <button
                        onClick={toggleMic}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isMicOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                    >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <div className="h-8 w-px bg-gray-700"></div>

                    <button
                        className="w-16 h-12 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors space-y-1"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>

                    <button
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium flex items-center transition-colors shadow-lg shadow-red-900/20"
                        onClick={() => window.location.href = '/candidate/welcome'}
                    >
                        <PhoneOff className="w-5 h-5 mr-2" />
                        Leave
                    </button>
                </div>
            </footer>
        </div>
    );
}
