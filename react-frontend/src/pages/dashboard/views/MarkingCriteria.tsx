import { useState, useEffect } from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2, Edit2, ShieldCheck, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Define Types
type EvaluationTemplate = {
    id: string;
    name: string;
    description: string;
    type: string;
    prompt_template: string;
    is_system_template: boolean;
};

export default function MarkingCriteria() {
    const { state } = useAuthContext();
    const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);

    // Dialog state
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<EvaluationTemplate>>({});

    useEffect(() => {
        // Mock data fetch - In reality, fetch from API endpoint we planned
        if (state.sub) {
            setTemplates([
                {
                    id: "system-1",
                    name: "Standard Software Engineer Evaluation",
                    description: "Default rigorous technical grading criteria.",
                    type: "QUESTIONNAIRE",
                    prompt_template: "You are an expert technical interviewer. Evaluate the candidate's answer based on: 1. Technical Accuracy (40%), 2. Code Quality & Best Practices (30%), 3. Problem Solving & Logic (30%). Provide constructive feedback.",
                    is_system_template: true
                },
                {
                    id: "system-2",
                    name: "Lenient Junior Developer Evaluation",
                    description: "Softer grading focused on potential and basic understanding.",
                    type: "QUESTIONNAIRE",
                    prompt_template: "You are an empathetic senior developer evaluating a junior. Focus on: 1. Core Understanding (50%), 2. Willingness to Learn (30%), 3. Syntax (20%). Point out good attempts even if the final code has minor bugs.",
                    is_system_template: true
                },
                {
                    id: "custom-1",
                    name: "Frontend UI/UX Specialist",
                    description: "Focus on design patterns, accessibility, and CSS mastery.",
                    type: "QUESTIONNAIRE",
                    prompt_template: "Evaluate as a Lead Designer. Score based on: 1. Accessibility (a11y) considerations (40%), 2. Semantic HTML structure (30%), 3. Responsive design approach (30%).",
                    is_system_template: false
                }
            ]);
        }
    }, [state.sub]);

    const handleOpenDialog = (template?: EvaluationTemplate) => {
        if (template) {
            setIsEditing(true);
            setCurrentTemplate(template);
        } else {
            setIsEditing(false);
            setCurrentTemplate({
                name: "",
                description: "",
                type: "QUESTIONNAIRE",
                prompt_template: "",
                is_system_template: false
            });
        }
        setIsOpen(true);
    };

    const handleSave = () => {
        if (isEditing) {
            // Update logic here
            setTemplates(templates.map(t => t.id === currentTemplate.id ? currentTemplate as EvaluationTemplate : t));
        } else {
            // Create logic here
            const newTemplate = {
                ...currentTemplate,
                id: `custom-${Date.now()}`
            } as EvaluationTemplate;
            setTemplates([...templates, newTemplate]);
        }
        setIsOpen(false);
    };

    const handleDelete = (id: string) => {
        // Delete logic here
        setTemplates(templates.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Marking Criteria</h2>
                    <p className="text-gray-500">Manage evaluation templates and AI prompts for candidate scoring.</p>
                </div>
                <Button className="bg-[#FF7300] hover:bg-[#E56700]" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {templates.map((template) => (
                    <Card key={template.id} className={template.is_system_template ? "border-blue-100 bg-blue-50/10" : ""}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg flex items-center">
                                        {template.name}
                                        {template.is_system_template && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                <ShieldCheck className="h-3 w-3 mr-1" /> System
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="mt-1">{template.description}</CardDescription>
                                </div>
                                {!template.is_system_template && (
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#FF7300]" onClick={() => handleOpenDialog(template)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => handleDelete(template.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-3 rounded-md border text-sm font-medium text-gray-700 font-mono whitespace-pre-wrap">
                                {template.prompt_template}
                            </div>
                            <div className="mt-4 flex items-center text-xs text-gray-500">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                Type: {template.type}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Template Name</label>
                            <Input
                                value={currentTemplate.name || ''}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                                placeholder="e.g. Frontend Specialist Criteria"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Brief Description</label>
                            <Input
                                value={currentTemplate.description || ''}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                                placeholder="Describe when to use this template..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">AI Prompt Instructions</label>
                            <Textarea
                                value={currentTemplate.prompt_template || ''}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, prompt_template: e.target.value })}
                                placeholder="You are an expert technical interviewer evaluating a candidate for..."
                                className="h-32 font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">Provide specific weights and logic for the AI engine to evaluate answers.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button className="bg-[#FF7300] hover:bg-[#E56700]" onClick={handleSave}>
                            {isEditing ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
