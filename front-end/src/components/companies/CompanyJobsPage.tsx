import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useApi, useApiList } from '../../hooks/useApi';
import { companyJobService, companyProfileService } from '../../services/api';
import { CompanyJob, CompanyProfile } from '../../types/entities';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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
import { Badge } from '../ui/badge';

const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  profileCreated: z.string().min(1, 'Profile created date is required'),
  isActive: z.boolean(),
  isCompanyHidden: z.boolean(),
});

type JobFormData = z.infer<typeof jobSchema>;

export function CompanyJobsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CompanyJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<CompanyJob | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const jobsApi = useApiList(companyJobService.getAll);
  const companiesApi = useApiList(companyProfileService.getAll);
  const createApi = useApi(companyJobService.create, {
    showSuccessToast: true,
    successMessage: 'Job created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      jobsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(companyJobService.update, {
    showSuccessToast: true,
    successMessage: 'Job updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingJob(null);
      jobsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(companyJobService.delete, {
    showSuccessToast: true,
    successMessage: 'Job deleted successfully',
    onSuccess: () => {
      setDeletingJob(null);
      jobsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: '',
      profileCreated: new Date().toISOString().split('T')[0],
      isActive: true,
      isCompanyHidden: false,
    },
  });

  // Load companies on mount
  useEffect(() => {
    companiesApi.execute();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = jobsApi.data.filter(job =>
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<CompanyJob>[] = [
    {
      key: 'id',
      label: 'Job ID',
      sortable: true,
      width: '200px',
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'profileCreated',
      label: 'Profile Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'isCompanyHidden',
      label: 'Visibility',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{value ? 'Hidden' : 'Visible'}</span>
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
  const actions: TableAction<CompanyJob>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (job) => {
        setEditingJob(job);
        form.reset({
          company: job.company,
          profileCreated: job.profileCreated.split('T')[0],
          isActive: job.isActive,
          isCompanyHidden: job.isCompanyHidden,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (job) => setDeletingJob(job),
    },
  ];

  const handleSubmit = async (data: JobFormData) => {
    const jobData = {
      ...data,
      profileCreated: new Date(data.profileCreated).toISOString(),
    };

    if (editingJob) {
      await updateApi.execute(editingJob.id, jobData);
    } else {
      await createApi.execute(jobData);
    }
  };

  const handleDelete = async () => {
    if (deletingJob) {
      await deleteApi.execute(deletingJob.id);
    }
  };

  const openAddForm = () => {
    setEditingJob(null);
    form.reset({
      company: '',
      profileCreated: new Date().toISOString().split('T')[0],
      isActive: true,
      isCompanyHidden: false,
    });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Jobs</h1>
        <p className="text-gray-600">Manage job postings and their visibility settings</p>
      </div>

      <DataTable
        title="Company Jobs"
        data={filteredJobs}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={jobsApi.isLoading}
        searchPlaceholder="Search by job ID or company..."
        emptyMessage="No company jobs found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJob(null);
          form.reset();
        }}
        title={editingJob ? 'Edit Company Job' : 'Add Company Job'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company ID *</Label>
            <Input
              id="company"
              {...form.register('company')}
              placeholder="Enter company ID"
            />
            {form.formState.errors.company && (
              <p className="text-sm text-red-600">{form.formState.errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileCreated">Profile Created Date *</Label>
            <Input
              id="profileCreated"
              type="date"
              {...form.register('profileCreated')}
            />
            {form.formState.errors.profileCreated && (
              <p className="text-sm text-red-600">{form.formState.errors.profileCreated.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Job Status</Label>
                <p className="text-sm text-gray-600">
                  Enable to make this job active and visible to applicants
                </p>
              </div>
              <Switch
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hide Company</Label>
                <p className="text-sm text-gray-600">
                  Enable to hide the company name from applicants
                </p>
              </div>
              <Switch
                checked={form.watch('isCompanyHidden')}
                onCheckedChange={(checked) => form.setValue('isCompanyHidden', checked)}
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingJob} onOpenChange={() => setDeletingJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting{' '}
              <strong>{deletingJob?.id}</strong> from{' '}
              <strong>{deletingJob?.company}</strong>.
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
