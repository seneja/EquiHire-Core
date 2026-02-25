import { useState, useEffect } from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ShieldAlert, CheckCircle, BarChart3, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuditAndStatistics() {
    const { state } = useAuthContext();
    // In a real app, these would be fetched from the backend API we planned
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        totalInterviews: 0,
        avgScore: 0,
        issuesDetected: 0
    });

    useEffect(() => {
        // Mock data fetch for UI showcase
        if (state.sub) {
            setStats({
                totalInterviews: 124,
                avgScore: 76.5,
                issuesDetected: 3
            });

            setLogs([
                { id: 1, action: "Evaluated Answer", entity: "Candidate", details: "Scored 85/100 for Python logic", time: "10 mins ago" },
                { id: 2, action: "Created Job", entity: "Job", details: "Senior React Developer", time: "2 hours ago" },
                { id: 3, action: "System Login", entity: "Recruiter", details: "Successful login via Asgardeo", time: "5 hours ago" },
                { id: 4, action: "Flagged Content", entity: "Candidate", details: "Cheating attempt suspected", time: "1 day ago", alert: true }
            ]);
        }
    }, [state.sub]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit & Statistics</h2>
                <p className="text-gray-500">Monitor system interactions and evaluate overall candidate performance.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="audit-logs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">System Audit Logs</TabsTrigger>
                </TabsList>

                {/* Overview / Statistics Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Interviews Evaluated</CardTitle>
                                <Users className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</div>
                                <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-500">Average Candidate Score</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.avgScore}%</div>
                                <p className="text-xs text-gray-500 mt-1">Across all job postings</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-500">Anomalies Detected</CardTitle>
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.issuesDetected}</div>
                                <p className="text-xs text-red-500 mt-1">Requires manual review</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Performance Trends</CardTitle>
                            <CardDescription>Average scores vs questions difficulty over time.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center border-t border-gray-100 bg-gray-50/50">
                            <div className="text-center text-gray-400 flex flex-col items-center">
                                <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">Chart visualization will be populated when API is connected.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audit Logs Tab */}
                <TabsContent value="audit-logs">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Interface Activity</CardTitle>
                            <CardDescription>A complete log of system actions and evaluations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id} className={`p-4 border rounded-lg flex items-start justify-between ${log.alert ? 'bg-red-50 border-red-100' : 'bg-white'}`}>
                                        <div className="flex items-start">
                                            <div className={`mt-0.5 mr-4 p-2 rounded-full ${log.alert ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {log.alert ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className={`font-medium text-sm ${log.alert ? 'text-red-900' : 'text-gray-900'}`}>
                                                    {log.action} <span className="text-gray-500 font-normal">on {log.entity}</span>
                                                </p>
                                                <p className={`text-sm mt-1 ${log.alert ? 'text-red-700' : 'text-gray-600'}`}>{log.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 whitespace-nowrap">{log.time}</div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">No activity recorded yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
