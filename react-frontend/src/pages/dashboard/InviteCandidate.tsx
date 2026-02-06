import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle, Copy, AlertCircle } from "lucide-react";
import { useAuthContext } from "@asgardeo/auth-react";
import { API } from "@/lib/api";

interface InviteCandidateProps {
    organizationId?: string;
}

export default function InviteCandidate({ organizationId }: InviteCandidateProps) {
    const { state } = useAuthContext();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [candidateName, setCandidateName] = useState('');
    // Job Title is now derived from selected job
    const [interviewDate, setInterviewDate] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [magicLink, setMagicLink] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (state.sub) {
            API.getJobs(state.sub)
                .then(setJobs)
                .catch(err => console.error("Failed to load jobs", err));
        }
    }, [state.sub]);

    const handleJobSelect = (value: string) => {
        setSelectedJobId(value);
    };

    const handleSendInvitation = async () => {
        setError('');
        setMagicLink('');

        if (!candidateEmail || !candidateName || !selectedJobId) {
            setError('Please fill in all required fields and select a job');
            return;
        }

        if (!organizationId || !state.sub) {
            setError('Organization or recruiter information missing');
            return;
        }

        setIsSending(true);

        try {
            const payload = {
                candidateEmail,
                candidateName,
                jobTitle: jobs.find(j => j.id === selectedJobId)?.title || 'Unknown Role',
                jobId: selectedJobId,
                interviewDate: interviewDate || null,
                organizationId,
                recruiterId: state.sub
            };

            const data = await API.createInvitation(payload);
            setMagicLink(data.magicLink);

            // Clear form
            setCandidateEmail('');
            setCandidateName('');
            setSelectedJobId('');
            setInterviewDate('');

        } catch (err) {
            console.error('Error sending invitation:', err);
            setError('Failed to send invitation. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(magicLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center">
                    <Mail className="h-6 w-6 mr-2 text-[#FF7300]" />
                    <CardTitle>Invite Candidate</CardTitle>
                </div>
                <CardDescription>Enter candidate details to schedule an interview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {magicLink ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-green-900 mb-1">Invitation Sent Successfully!</h3>
                                    <p className="text-sm text-green-700 mb-3">
                                        An email has been sent to the candidate. You can also share the link directly:
                                    </p>
                                    <div className="bg-white border border-green-300 rounded p-3 mb-3">
                                        <p className="text-xs font-mono text-gray-600 break-all">{magicLink}</p>
                                    </div>
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setMagicLink('')}
                            className="w-full bg-gray-900 hover:bg-gray-800"
                        >
                            Send Another Invitation
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="candidateName">Candidate Name *</Label>
                            <Input
                                id="candidateName"
                                placeholder="John Doe"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="candidateEmail">Candidate Email *</Label>
                            <Input
                                id="candidateEmail"
                                type="email"
                                placeholder="candidate@example.com"
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobSelect">Job Role *</Label>
                            <Select onValueChange={handleJobSelect} value={selectedJobId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a job role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs.map((job) => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">Create new jobs in the "Create Job" section</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interviewDate">Interview Date (Optional)</Label>
                            <Input
                                id="interviewDate"
                                type="datetime-local"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleSendInvitation}
                            disabled={isSending}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isSending ? 'Sending...' : 'Send Invitation'}
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                            The candidate will receive an email with a secure magic link valid for 7 days.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
