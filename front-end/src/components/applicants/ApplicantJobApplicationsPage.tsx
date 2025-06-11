import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApi, useApiList } from '../../hooks/useApi';
import { applicantJobApplicationService } from '../../services/api';
import { ApplicantJobApplication } from '../../types/entities';
import { Edit, Trash2, FileText, Calendar, Building2 } from 'lucide-react';
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

const jobApplicationSchema = z.object({
  applicant: z.string().min(1, 'Applicant ID is required'),
  job: z.string().min(1, 'Job ID is required'),
  applicationDate: z.string().min(1, 'Application date is required'),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

export function ApplicantJobApplicationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ApplicantJobApplication | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<ApplicantJobApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const applicationsApi = useApiList(applicantJobApplicationService.getAll);
  const createApi = useApi(applicantJobApplicationService.create, {
    showSuccessToast: true,
    successMessage: 'Job application created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      applicationsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(applicantJobApplicationService.update, {
    showSuccessToast: true,
    successMessage: 'Job application updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingApplication(null);
      applicationsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(applicantJobApplicationService.delete, {
    showSuccessToast: true,
    successMessage: 'Job application deleted successfully',
    onSuccess: () => {
      setDeletingApplication(null);
      applicationsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      applicant: '',
      job: '',
      applicationDate: new Date().toISOString().split('T')[0],
    },
  });

  // Filter applications based on search term
  const filteredApplications = applicationsApi.data.filter(application =>
    application.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.job.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate days since application
  const getDaysSinceApplication = (applicationDate: string) => {
    const today = new Date();
    const appDate = new Date(applicationDate);
    const diffTime = Math.abs(today.getTime() - appDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get application status based on days since application
  const getApplicationStatus = (days: number) => {
    if (days <= 7) return { label: 'Recent', color: 'bg-green-100 text-green-800' };
    if (days <= 30) return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    if (days <= 90) return { label: 'Under Review', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Old', color: 'bg-gray-100 text-gray-800' };
  };

  // Table columns
  const columns: TableColumn<ApplicantJobApplication>[] = [
    {
      key: 'applicant',
      label: 'Applicant',
      sortable: true,
    },
    {
      key: 'job',
      label: 'Job ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'applicationDate',
      label: 'Application Date',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'applicationDate',
      label: 'Days Since Applied',
      render: (value) => {
        const days = getDaysSinceApplication(value);
        const status = getApplicationStatus(days);
        return (
          <div className="flex items-center space-x-2">
            <Badge className={status.color}>
              {status.label}
            </Badge>
            <span className="text-sm text-gray-600">
              {days} {days === 1 ? 'day' : 'days'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'timeStamp',
      label: 'Record Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<ApplicantJobApplication>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (application) => {
        setEditingApplication(application);
        form.reset({
          applicant: application.applicant,
          job: application.job,
          applicationDate: application.applicationDate.split('T')[0],
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (application) => setDeletingApplication(application),
    },
  ];

  const handleSubmit = async (data: JobApplicationFormData) => {
    const applicationData = {
      ...data,
      applicationDate: new Date(data.applicationDate).toISOString(),
    };

    if (editingApplication) {
      await updateApi.execute(editingApplication.id, applicationData);
    } else {
      await createApi.execute(applicationData);
    }
  };

  const handleDelete = async () => {
    if (deletingApplication) {
      await deleteApi.execute(deletingApplication.id);
    }
  };

  const openAddForm = () => {
    setEditingApplication(null);
    form.reset({
      applicant: '',
      job: '',
      applicationDate: new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-600">Track applicant job applications and application history</p>
      </div>

      <DataTable
        title="Job Applications"
        data={filteredApplications}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={applicationsApi.isLoading}
        searchPlaceholder="Search by applicant or job ID..."
        emptyMessage="No job applications found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingApplication(null);
          form.reset();
        }}
        title={editingApplication ? 'Edit Job Application' : 'Add Job Application'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="md"
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
            <Label htmlFor="job">Job ID *</Label>
            <Input
              id="job"
              {...form.register('job')}
              placeholder="Enter job ID (e.g., job-001)"
            />
            {form.formState.errors.job && (
              <p className="text-sm text-red-600">{form.formState.errors.job.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationDate">Application Date *</Label>
            <Input
              id="applicationDate"
              type="date"
              {...form.register('applicationDate')}
            />
            {form.formState.errors.applicationDate && (
              <p className="text-sm text-red-600">{form.formState.errors.applicationDate.message}</p>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Application Status Legend</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Recent</Badge>
                <span className="text-blue-700">≤ 7 days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                <span className="text-blue-700">8-30 days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
                <span className="text-blue-700">31-90 days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-gray-100 text-gray-800">Old</Badge>
                <span className="text-blue-700">&gt; 90 days</span>
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingApplication} onOpenChange={() => setDeletingApplication(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job application for{' '}
              <strong>{deletingApplication?.applicant}</strong> to job{' '}
              <strong>{deletingApplication?.job}</strong>.
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
