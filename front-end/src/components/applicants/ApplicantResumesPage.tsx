import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useApi, useApiList } from '../../hooks/useApi';
import { applicantResumeService } from '../../services/api';
import { ApplicantResume } from '../../types/entities';
import { Edit, Trash2, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const resumeSchema = z.object({
  applicant: z.string().min(1, 'Applicant ID is required'),
  resume: z.string().min(10, 'Resume content must be at least 10 characters'),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export function ApplicantResumesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<ApplicantResume | null>(null);
  const [deletingResume, setDeletingResume] = useState<ApplicantResume | null>(null);
  const [viewingResume, setViewingResume] = useState<ApplicantResume | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const resumesApi = useApiList(applicantResumeService.getAll);
  const createApi = useApi(applicantResumeService.create, {
    showSuccessToast: true,
    successMessage: 'Resume created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      resumesApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(applicantResumeService.update, {
    showSuccessToast: true,
    successMessage: 'Resume updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingResume(null);
      resumesApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(applicantResumeService.delete, {
    showSuccessToast: true,
    successMessage: 'Resume deleted successfully',
    onSuccess: () => {
      setDeletingResume(null);
      resumesApi.refresh();
    },
  });

  // Form setup
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      applicant: '',
      resume: '',
    },
  });

  // Filter resumes based on search term
  const filteredResumes = resumesApi.data.filter(resume =>
    resume.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.resume.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<ApplicantResume>[] = [
    {
      key: 'applicant',
      label: 'Applicant',
      sortable: true,
    },
    {
      key: 'resume',
      label: 'Resume Preview',
      render: (value) => {
        const preview = value.substring(0, 100);
        return (
          <div className="max-w-xs">
            <p className="text-sm text-gray-700 truncate">
              {preview}...
            </p>
          </div>
        );
      },
    },
    {
      key: 'resume',
      label: 'Length',
      render: (value) => {
        const wordCount = value.split(/\s+/).length;
        const charCount = value.length;
        return (
          <div className="text-sm">
            <div>{wordCount} words</div>
            <div className="text-gray-500">{charCount} chars</div>
          </div>
        );
      },
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<ApplicantResume>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (resume) => setViewingResume(resume),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (resume) => {
        setEditingResume(resume);
        form.reset({
          applicant: resume.applicant,
          resume: resume.resume,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (resume) => setDeletingResume(resume),
    },
  ];

  const handleSubmit = async (data: ResumeFormData) => {
    const resumeData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    if (editingResume) {
      await updateApi.execute(editingResume.id, resumeData);
    } else {
      await createApi.execute(resumeData);
    }
  };

  const handleDelete = async () => {
    if (deletingResume) {
      await deleteApi.execute(deletingResume.id);
    }
  };

  const openAddForm = () => {
    setEditingResume(null);
    form.reset();
    setIsFormOpen(true);
  };

  const downloadResume = (resume: ApplicantResume) => {
    const blob = new Blob([resume.resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.applicant}_resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicant Resumes</h1>
        <p className="text-gray-600">Manage applicant resume documents and content</p>
      </div>

      <DataTable
        title="Resumes"
        data={filteredResumes}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={resumesApi.isLoading}
        searchPlaceholder="Search by applicant or resume content..."
        emptyMessage="No resumes found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingResume(null);
          form.reset();
        }}
        title={editingResume ? 'Edit Resume' : 'Add Resume'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicant">Applicant ID *</Label>
            <Input
              id="applicant"
              {...form.register('applicant')}
              placeholder="Enter applicant ID"
            />
            {form.formState.errors.applicant && (
              <p className="text-sm text-red-600">{form.formState.errors.applicant.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume Content *</Label>
            <Textarea
              id="resume"
              {...form.register('resume')}
              placeholder="Paste or type the resume content here..."
              rows={15}
              className="font-mono text-sm"
            />
            {form.formState.errors.resume && (
              <p className="text-sm text-red-600">{form.formState.errors.resume.message}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Words: {form.watch('resume')?.split(/\s+/).filter(w => w.length > 0).length || 0}
              </span>
              <span>
                Characters: {form.watch('resume')?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </FormModal>

      {/* View Resume Modal */}
      <FormModal
        isOpen={!!viewingResume}
        onClose={() => setViewingResume(null)}
        title={`Resume - ${viewingResume?.applicant}`}
        showCancel={false}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {viewingResume?.resume.split(/\s+/).length} words
              </Badge>
              <Badge variant="outline">
                {viewingResume?.resume.length} characters
              </Badge>
              <span className="text-sm text-gray-500">
                Last updated: {viewingResume && new Date(viewingResume.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewingResume && downloadResume(viewingResume)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
              {viewingResume?.resume}
            </pre>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingResume} onOpenChange={() => setDeletingResume(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resume for{' '}
              <strong>{deletingResume?.applicant}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
