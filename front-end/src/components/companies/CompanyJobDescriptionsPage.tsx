import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useApi, useApiList } from '../../hooks/useApi';
import { companyJobDescriptionService, companyJobService } from '../../services/api';
import { CompanyJobDescription } from '../../types/entities';
import { Edit, Trash2, FileText, Briefcase } from 'lucide-react';
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

const jobDescriptionSchema = z.object({
  job: z.string().min(1, 'Job ID is required'),
  jobName: z.string().min(1, 'Job name is required'),
  jobDescriptions: z.string().min(1, 'Job description is required'),
});

type JobDescriptionFormData = z.infer<typeof jobDescriptionSchema>;

export function CompanyJobDescriptionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobDescription, setEditingJobDescription] = useState<CompanyJobDescription | null>(null);
  const [deletingJobDescription, setDeletingJobDescription] = useState<CompanyJobDescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const jobDescriptionsApi = useApiList(companyJobDescriptionService.getAll);
  const jobsApi = useApiList(companyJobService.getAll);
  const createApi = useApi(companyJobDescriptionService.create, {
    showSuccessToast: true,
    successMessage: 'Job description created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      jobDescriptionsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(companyJobDescriptionService.update, {
    showSuccessToast: true,
    successMessage: 'Job description updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingJobDescription(null);
      jobDescriptionsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(companyJobDescriptionService.delete, {
    showSuccessToast: true,
    successMessage: 'Job description deleted successfully',
    onSuccess: () => {
      setDeletingJobDescription(null);
      jobDescriptionsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<JobDescriptionFormData>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: {
      job: '',
      jobName: '',
      jobDescriptions: '',
    },
  });

  // Load jobs on mount
  useEffect(() => {
    jobsApi.execute();
  }, []);

  // Filter job descriptions based on search term
  const filteredJobDescriptions = jobDescriptionsApi.data.filter(jobDesc =>
    jobDesc.job.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobDesc.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobDesc.jobDescriptions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<CompanyJobDescription>[] = [
    {
      key: 'job',
      label: 'Job ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'jobName',
      label: 'Job Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: 'jobDescriptions',
      label: 'Description',
      render: (value) => (
        <div className="max-w-md">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-700 line-clamp-2">
                {value.length > 100 ? `${value.substring(0, 100)}...` : value}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {value.length} characters
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<CompanyJobDescription>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (jobDesc) => {
        setEditingJobDescription(jobDesc);
        form.reset({
          job: jobDesc.job,
          jobName: jobDesc.jobName,
          jobDescriptions: jobDesc.jobDescriptions,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (jobDesc) => setDeletingJobDescription(jobDesc),
    },
  ];

  const handleSubmit = async (data: JobDescriptionFormData) => {
    if (editingJobDescription) {
      await updateApi.execute(editingJobDescription.id, data);
    } else {
      await createApi.execute(data);
    }
  };

  const handleDelete = async () => {
    if (deletingJobDescription) {
      await deleteApi.execute(deletingJobDescription.id);
    }
  };

  const openAddForm = () => {
    setEditingJobDescription(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Job Descriptions</h1>
        <p className="text-gray-600">Manage detailed job descriptions and requirements</p>
      </div>

      <DataTable
        title="Job Descriptions"
        data={filteredJobDescriptions}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={jobDescriptionsApi.isLoading}
        searchPlaceholder="Search by job ID, name, or description..."
        emptyMessage="No job descriptions found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJobDescription(null);
          form.reset();
        }}
        title={editingJobDescription ? 'Edit Job Description' : 'Add Job Description'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Job ID *</Label>
            <Input
              id="job"
              {...form.register('job')}
              placeholder="e.g., job-001"
            />
            {form.formState.errors.job && (
              <p className="text-sm text-red-600">{form.formState.errors.job.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobName">Job Name *</Label>
            <Input
              id="jobName"
              {...form.register('jobName')}
              placeholder="e.g., Senior Software Engineer"
            />
            {form.formState.errors.jobName && (
              <p className="text-sm text-red-600">{form.formState.errors.jobName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescriptions">Job Description *</Label>
            <Textarea
              id="jobDescriptions"
              {...form.register('jobDescriptions')}
              placeholder="Enter detailed job description, responsibilities, and requirements..."
              rows={6}
              className="resize-none"
            />
            {form.formState.errors.jobDescriptions && (
              <p className="text-sm text-red-600">{form.formState.errors.jobDescriptions.message}</p>
            )}
            <div className="text-xs text-gray-500">
              {form.watch('jobDescriptions')?.length || 0} characters
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingJobDescription} onOpenChange={() => setDeletingJobDescription(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job description for{' '}
              <strong>{deletingJobDescription?.jobName}</strong> (Job ID: {deletingJobDescription?.job}).
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
