import { useState, useEffect } from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
import { API } from "@/lib/api";
import CreateJob from '../CreateJob';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Edit2, Trash2, Loader2, Plus, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDeleteDialog, ConfirmUpdateDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const SKILL_CATEGORIES: Record<string, string[]> = {
    "Languages": ["Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "Swift", "Kotlin"],
    "Web & Frameworks": ["React", "Angular", "Vue.js", "Node.js", "Spring Boot", "Django", "Flask", "FastAPI", "GraphQL", "REST API"],
    "Data & AI": ["Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Pandas", "NumPy"],
    "Infrastructure": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    "Databases": ["SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle"],
};

export default function JobsManager() {
    const { state } = useAuthContext();
    const [jobs, setJobs] = useState<any[]>([]);
    const [organization, setOrganization] = useState<{ id: string; name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', requiredSkills: [] as string[] });
    const [activeCategory, setActiveCategory] = useState("Languages");
    const [customSkill, setCustomSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Confirm Dialogs
    const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchJobs = () => {
        if (state.sub) {
            setIsLoading(true);
            API.getJobs(state.sub)
                .then(setJobs)
                .catch(err => console.error("Failed to load jobs", err))
                .finally(() => setIsLoading(false));
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

    const openEditDialog = (job: any) => {
        setEditingJob(job);
        setEditForm({
            title: job.title || '',
            description: job.description || '',
            requiredSkills: job.required_skills || job.requiredSkills || [],
        });
        setEditDialogOpen(true);
    };

    const toggleSkill = (skill: string) => {
        setEditForm(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.includes(skill)
                ? prev.requiredSkills.filter(s => s !== skill)
                : [...prev.requiredSkills, skill]
        }));
    };

    const handleAddCustomSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customSkill.trim()) {
            e.preventDefault();
            toggleSkill(customSkill.trim());
            setCustomSkill('');
        }
    };

    const handleSaveEdit = async () => {
        setConfirmUpdateOpen(false);
        if (!editingJob) return;
        setIsSaving(true);
        try {
            await API.updateJob(editingJob.id, {
                title: editForm.title,
                description: editForm.description,
                requiredSkills: editForm.requiredSkills,
            });
            fetchJobs();
        } catch (err) {
            console.error("Failed to update job", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setConfirmDeleteOpen(false);
        if (!deletingJobId) return;
        setIsDeleting(true);
        try {
            await API.deleteJob(deletingJobId);
            fetchJobs();
        } catch (err) {
            console.error("Failed to delete job", err);
        } finally {
            setIsDeleting(false);
            setDeletingJobId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
                <p className="text-gray-500">Create and manage job roles/openings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Job Form */}
                <div className="col-span-1 lg:col-span-2">
                    <CreateJob organizationId={organization?.id} onJobCreated={fetchJobs} />
                </div>

                {/* Active Roles Sidebar (Right) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500">Active Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-6 text-gray-400">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        <span className="text-sm">Loading...</span>
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <p className="text-sm text-gray-400">No jobs created yet.</p>
                                ) : (
                                    jobs.map((job) => (
                                        <div key={job.id} className="group p-3 border rounded-lg bg-gray-50 flex items-center justify-between hover:border-gray-300 transition-all">
                                            <div className="flex items-center min-w-0">
                                                <Briefcase className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 truncate">{job.title}</p>
                                                    <p className="text-xs text-gray-500">{new Date(job.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {/* Edit/Delete on hover */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                                <button
                                                    onClick={() => openEditDialog(job)}
                                                    className="p-1 rounded bg-white border border-gray-200 shadow-sm hover:bg-orange-50 hover:border-[#FF7300] hover:text-[#FF7300] text-gray-400 transition-all"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => { setDeletingJobId(job.id); setConfirmDeleteOpen(true); }}
                                                    className="p-1 rounded bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-400 hover:text-red-600 text-gray-400 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Job Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-[#FF7300]" />
                            Edit Job Role
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                        <div className="grid gap-2">
                            <Label>Job Title</Label>
                            <Input
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Brief description of the role..."
                            />
                        </div>

                        {/* Skills Selector */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label>Required Skills</Label>
                                <span className="text-xs text-gray-500">{editForm.requiredSkills.length} selected</span>
                            </div>

                            {editForm.requiredSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 min-h-[40px]">
                                    {editForm.requiredSkills.map(skill => (
                                        <span key={skill} className="bg-[#FF7300]/10 text-[#FF7300] border border-[#FF7300]/20 text-xs px-2 py-1 rounded-full flex items-center">
                                            {skill}
                                            <button onClick={() => toggleSkill(skill)} className="ml-1 hover:text-[#d36000]">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="flex overflow-x-auto border-b bg-gray-50 scrollbar-hide">
                                    {Object.keys(SKILL_CATEGORIES).map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className={cn(
                                                "px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2",
                                                activeCategory === category
                                                    ? "border-[#FF7300] text-[#FF7300] bg-white"
                                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                            )}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-3 bg-white min-h-[120px]">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(SKILL_CATEGORIES[activeCategory] || []).map((skill) => {
                                            const isSelected = editForm.requiredSkills.includes(skill);
                                            return (
                                                <button
                                                    key={skill}
                                                    onClick={() => toggleSkill(skill)}
                                                    className={cn(
                                                        "text-xs px-2.5 py-1 rounded-full border transition-all duration-200 flex items-center",
                                                        isSelected
                                                            ? "bg-[#FF7300] text-white border-[#FF7300]"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-[#FF7300] hover:text-[#FF7300]"
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                                                    {skill}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 border-t flex items-center gap-2">
                                    <Plus className="w-3 h-3 text-gray-400" />
                                    <Input
                                        placeholder="Add custom skill..."
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        onKeyDown={handleAddCustomSkill}
                                        className="border-0 bg-transparent focus-visible:ring-0 h-7 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-[#FF7300] hover:bg-[#E56700]"
                            onClick={() => { setEditDialogOpen(false); setConfirmUpdateOpen(true); }}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialogs */}
            <ConfirmUpdateDialog
                open={confirmUpdateOpen}
                onOpenChange={setConfirmUpdateOpen}
                onConfirm={handleSaveEdit}
                title="Update Job Role"
                description="Are you sure you want to update this job role? This will modify the role details visible to candidates."
                isLoading={isSaving}
            />

            <ConfirmDeleteDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                onConfirm={handleDelete}
                title="Delete Job Role"
                description="Are you sure you want to delete this job role? All associated questions and candidate data may be affected."
                isLoading={isDeleting}
            />
        </div>
    );
}
