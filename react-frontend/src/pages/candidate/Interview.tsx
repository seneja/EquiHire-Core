import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { EquiHireLogo } from "@/components/ui/Icons";
import { Textarea } from "@/components/ui/textarea";

export default function CandidateInterview() {

    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
    const [answer, setAnswer] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);



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

    const handleSubmit = async () => {
        setIsSubmitted(true);
        // TODO: Send answer to backend
        console.log("Submitting answer:", answer);

        // Mock delay
        await new Promise(r => setTimeout(r, 1000));
        alert("Assessment Submitted!");
        window.location.href = '/candidate/welcome';
    };

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
                        Lockdown Assessment
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400 hidden sm:inline-block">Time Remaining: <span className="text-white font-mono">{formatTime(timeLeft)}</span></span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start p-6 z-10 relative w-full max-w-4xl mx-auto mt-8">

                <div className="w-full space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-md border border-white/10 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Question 1</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Explain the concept of "Immutability" in functional programming and provide a code example in Python or JavaScript demonstrating how it helps prevent side effects.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Textarea
                            placeholder="Type your answer here..."
                            className="min-h-[300px] bg-gray-900/80 border-gray-700 text-white font-mono"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={isSubmitted}
                        />

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitted || !answer.trim()}
                                className="bg-[#FF7300] hover:bg-[#E56700] text-white px-8"
                            >
                                {isSubmitted ? "Submitted" : "Submit Answer"}
                            </Button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
