import { useState, useEffect } from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
import { API } from "@/lib/api";
import CreateJob from '../CreateJob';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function JobsManager() {
    const { state } = useAuthContext();
    const [jobs, setJobs] = useState<any[]>([]);
    const [organization, setOrganization] = useState<{ id: string; name: string } | null>(null);

    const fetchJobs = () => {
        if (state.sub) {
            API.getJobs(state.sub)
                .then(setJobs)
                .catch(err => console.error("Failed to load jobs", err));
        }
    };

    useEffect(() => {
        const fetchOrg = async () => {
            if (state.sub) {
                try {
                    const data = await API.getOrganization(state.sub);
                    if (data) setOrganization(data);
                } catch (error) {
                    console.error("Failed to fetch organization", error);
                }
            }
        };
        fetchOrg();
        fetchJobs();
    }, [state.sub]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
                <p className="text-gray-500">Create and manage job roles/openings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Job Form */}
                <div className="col-span-1 lg:col-span-2">
                    <CreateJob organizationId={organization?.id} onJobCreated={fetchJobs} />
                </div>

                {/* Existing Jobs List */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500">Active Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {jobs.length === 0 ? (
                                    <p className="text-sm text-gray-400">No jobs created yet.</p>
                                ) : (
                                    jobs.map((job) => (
                                        <div key={job.id} className="p-3 border rounded-lg bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{job.title}</p>
                                                    <p className="text-xs text-gray-500">{new Date(job.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
