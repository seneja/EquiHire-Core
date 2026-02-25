import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { EquiHireLogo } from "@/components/ui/Icons";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

export default function CandidateInterview() {

    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Dynamic fetch state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // candidateData is fetched and stored but not strictly necessary for the UI at this moment
    // const [candidateData, setCandidateData] = useState<any>(null);

    // Initial Load & Validation
    useEffect(() => {
        const initializeInterview = async () => {
            try {
                // Determine token from sessionStorage or query params might be better, 
                // but since welcome page sets logic, let's assume it's in sessionStorage per standard pattern
                const storedDataStr = sessionStorage.getItem('candidateData');

                if (!storedDataStr) {
                    setError("No invitation session found. Please use the link provided in your email.");
                    setLoading(false);
                    return;
                }

                const storedData = JSON.parse(storedDataStr);

                if (!storedData.jobId) {
                    setError("Invalid session data. Job ID is missing.");
                    setLoading(false);
                    return;
                }

                // Fetch questions for this job
                const jobQuestions = await API.getJobQuestions(storedData.jobId);
                setQuestions(jobQuestions);
                setLoading(false);

            } catch (err: any) {
                console.error("Initialization error:", err);
                setError("Failed to initialize interview. Please try again.");
                setLoading(false);
            }
        };

        initializeInterview();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (loading || error || isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto submit when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, error, isSubmitted]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswerChange = (val: string) => {
        if (questions.length === 0) return;
        const currentQId = questions[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [currentQId]: val }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitted(true);
        // Format answers for submission
        const formattedAnswers = Object.entries(answers).map(([questionId, text]) => ({
            questionId,
            answerText: text
        }));

        console.log("Submitting answers:", formattedAnswers);

        try {
            const candidateId = sessionStorage.getItem('candidateId');
            const candidateDataStr = sessionStorage.getItem('candidateData');

            if (!candidateId || !candidateDataStr) {
                alert("Missing session data. Cannot submit assessment. Please ensure you uploaded your CV.");
                setIsSubmitted(false);
                return;
            }

            const candidateData = JSON.parse(candidateDataStr);

            // Actually call the API to submit answers
            await API.submitCandidateAnswers(candidateId, candidateData.jobId, formattedAnswers);

            // Clear token as it's used
            sessionStorage.removeItem('invite_token');
            sessionStorage.removeItem('candidateData');
            sessionStorage.removeItem('candidateId');
            alert("Assessment Submitted Successfully!");
            window.location.href = '/candidate/welcome';
        } catch (err) {
            console.error(err);
            alert("Failed to submit assessment.");
            setIsSubmitted(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111827] flex items-center justify-center font-sans text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF7300]" />
                    <p className="text-gray-400">Loading your assessment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#111827] flex items-center justify-center font-sans text-white p-6">
                <div className="bg-gray-900/80 border border-red-500/30 p-8 rounded-lg max-w-md w-full text-center space-y-4 shadow-2xl">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-semibold">Access Denied</h2>
                    <p className="text-gray-400">{error}</p>
                    <Button onClick={() => window.location.href = '/candidate/welcome'} className="mt-4 bg-gray-800 hover:bg-gray-700 w-full">
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || "") : "";
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

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
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
                        <div
                            className="bg-[#FF7300] h-1.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${((currentQuestionIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
                        ></div>
                    </div>

                    {questions.length === 0 ? (
                        <div className="bg-gray-900/50 backdrop-blur-md border border-white/10 p-12 rounded-lg text-center">
                            <p className="text-gray-400">No questions have been configured for this role yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-900/50 backdrop-blur-md border border-white/10 p-6 rounded-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                                    <span className="text-xs uppercase font-medium tracking-wider text-gray-400 bg-gray-800 px-2.5 py-1 rounded">
                                        {currentQuestion.type || "Text Answer"}
                                    </span>
                                </div>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                                    {currentQuestion.questionText}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Textarea
                                    placeholder={currentQuestion.type === 'code' ? "Write your code here..." : "Type your answer here..."}
                                    className={`min-h-[300px] bg-gray-900/80 border-gray-700 text-white focus-visible:ring-[#FF7300] ${currentQuestion.type === 'code' ? 'font-mono' : ''}`}
                                    value={currentAnswer}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    disabled={isSubmitted}
                                />

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        disabled={currentQuestionIndex === 0 || isSubmitted}
                                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                                    >
                                        Previous
                                    </Button>

                                    {isLastQuestion ? (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitted || Object.keys(answers).length === 0}
                                            className="bg-[#FF7300] hover:bg-[#E56700] text-white px-8"
                                        >
                                            {isSubmitted ? "Submitting..." : "Submit Assessment"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNext}
                                            disabled={isSubmitted || !currentAnswer.trim()}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-8"
                                        >
                                            Next Question
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </main>
        </div>
    );
}
